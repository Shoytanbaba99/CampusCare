"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { publicRequestLimiter } from "@/lib/ratelimit";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100),
  departmentId: z.string().uuid("Please select a valid department."),
  categoryId: z.string().uuid("Please select a valid issue category."),
  location: z.string().min(3, "Location details must be at least 3 characters long."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)."),
});

export async function createComplaintAction(prevState: unknown, formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    departmentId: formData.get("departmentId"),
    categoryId: formData.get("categoryId"),
    location: formData.get("location"),
    priority: formData.get("priority"),
    description: formData.get("description"),
  };

  const validated = complaintSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid form data." };
  }

  const { title, departmentId, categoryId, location, priority, description } = validated.data;
  const supabase = await createClient();

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

  // 1. Insert Complaint into PostgreSQL
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

  // 2. Handle Optional Photo Evidence Upload
  const file = formData.get("evidenceFile") as File | null;
  if (file && file.size > 0) {
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
