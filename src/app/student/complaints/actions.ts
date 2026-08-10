"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { publicRequestLimiter } from "@/lib/ratelimit";

// Flexible Zod Schema accepting any non-empty department/category ID (handles seed IDs like 11111111-1111-1111-1111-111111111111)
const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100),
  departmentId: z.string().min(1, "Please select a valid department."),
  categoryId: z.string().min(1, "Please select a valid issue category."),
  location: z.string().min(3, "Location details must be at least 3 characters long."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)."),
});

// Helper function to extract form values even if React 19 / Next.js 16 prefixes key names (e.g. _1_departmentId, $ACTION_...)
function getFormField(formData: FormData, fieldName: string): string {
  const direct = formData.get(fieldName);
  if (typeof direct === "string" && direct.trim() !== "") {
    return direct.trim();
  }

  for (const [key, value] of formData.entries()) {
    if (
      (key.endsWith(`_${fieldName}`) || key === fieldName || key.endsWith(fieldName)) &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      return value.trim();
    }
  }

  return "";
}

export async function createComplaintAction(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  // Extract department & category from FormData
  let departmentId = getFormField(formData, "departmentId");
  let categoryId = getFormField(formData, "categoryId");

  // 1. Database Resolution for departmentId
  if (!departmentId) {
    const { data: firstDept } = await supabase.from("departments").select("id").limit(1).single();
    departmentId = firstDept?.id || "11111111-1111-1111-1111-111111111111";
  }

  // 2. Database Resolution for categoryId
  if (!categoryId) {
    const { data: deptCat } = await supabase
      .from("categories")
      .select("id")
      .eq("department_id", departmentId)
      .limit(1)
      .single();

    if (deptCat) {
      categoryId = deptCat.id;
    } else {
      const { data: anyCat } = await supabase.from("categories").select("id").limit(1).single();
      categoryId = anyCat?.id || "89fe0f5f-dac3-4a30-9e4c-c40885f146c2";
    }
  }

  const rawData = {
    title: getFormField(formData, "title"),
    departmentId,
    categoryId,
    location: getFormField(formData, "location"),
    priority: getFormField(formData, "priority") || "medium",
    description: getFormField(formData, "description"),
  };

  const validated = complaintSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid form data." };
  }

  const { title, location, priority, description } = validated.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated. Please log in again." };
  }

  // Rate Limiting Check: Max 3 complaint submissions per 60 seconds per user
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { success } = await publicRequestLimiter.limit(`create_complaint_${user.id}`);
    if (!success) {
      return { error: "Rate limit exceeded. Please wait a minute before submitting another complaint." };
    }
  }

  // Calculate SLA Due Timestamp based on Priority level
  const now = new Date();
  const slaHoursMap: Record<string, number> = {
    low: 168, // 7 days
    medium: 72, // 3 days
    high: 24, // 24 hours
    critical: 4, // 4 hours
  };
  const hoursToAdd = slaHoursMap[priority] || 72;
  const slaDueAt = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();

  // 3. Insert Complaint into PostgreSQL
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .insert({
      reporter_id: user.id,
      department_id: departmentId,
      category_id: categoryId,
      title,
      description,
      location,
      priority,
      status: "submitted",
      sla_due_at: slaDueAt,
    })
    .select("id")
    .single();

  if (complaintError || !complaint) {
    return { error: complaintError?.message || "Failed to submit complaint." };
  }

  // 4. Handle Optional Photo Evidence Upload
  let file: File | null = null;
  for (const [key, value] of formData.entries()) {
    if ((key.endsWith("image") || key.endsWith("evidenceFile")) && value instanceof File && value.size > 0) {
      file = value;
      break;
    }
  }

  if (file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { error: "File format must be JPG, PNG, or WEBP." };
    }
    if (file.size > maxSize) {
      return { error: "File size exceeds maximum 5MB limit." };
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${complaint.id}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("complaint-evidence")
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("complaint-evidence").getPublicUrl(filePath);

      await supabase.from("attachments").insert({
        complaint_id: complaint.id,
        uploader_id: user.id,
        file_url: publicUrl,
        file_type: file.type,
        file_size_bytes: file.size,
        attachment_type: "initial_evidence",
      });
    }
  }

  redirect("/student/dashboard");
}
