"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const reassignSchema = z.object({
  complaintId: z.string().min(1, "Complaint ID is required"),
  targetDepartmentId: z.string().min(1, "Department ID is required"),
  targetStaffId: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

function getFormField(formData: FormData, fieldName: string): string {
  const direct = formData.get(fieldName);
  if (typeof direct === "string" && direct.trim() !== "") return direct.trim();
  for (const [key, value] of formData.entries()) {
    if ((key.endsWith(`_${fieldName}`) || key === fieldName || key.endsWith(fieldName)) && typeof value === "string") {
      return value.trim();
    }
  }
  return "";
}

export async function reassignTicketAction(prevState: unknown, formData: FormData) {
  const rawStaffId = getFormField(formData, "staffId") || getFormField(formData, "targetStaffId");
  const rawData = {
    complaintId: getFormField(formData, "complaintId"),
    targetDepartmentId: getFormField(formData, "departmentId") || getFormField(formData, "targetDepartmentId"),
    targetStaffId: rawStaffId === "unassigned" || !rawStaffId ? null : rawStaffId,
    priority: getFormField(formData, "priority") || "medium",
  };

  const validated = reassignSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid re-assignment data." };
  }

  const { complaintId, targetDepartmentId, targetStaffId, priority } = validated.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  // Fetch current complaint state for audit log diff
  const { data: oldComplaint } = await supabase
    .from("complaints")
    .select("department_id, assigned_staff_id, priority, status")
    .eq("id", complaintId)
    .single();

  // Recalculate SLA timestamp if priority changes
  const now = new Date();
  const slaHoursMap: Record<string, number> = {
    low: 168,
    medium: 72,
    high: 24,
    critical: 4,
  };
  const hoursToAdd = slaHoursMap[priority] || 72;
  const slaDueAt = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000).toISOString();

  // 1. Update Complaint record
  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      department_id: targetDepartmentId,
      assigned_staff_id: targetStaffId || null,
      priority,
      sla_due_at: slaDueAt,
      status: targetStaffId ? "assigned" : "submitted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Append progress note timeline entry
  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: `Admin Dispatcher updated assignment and set priority to ${priority.toUpperCase()}.`,
    is_internal: false,
  });

  // 3. Log Audit Ledger
  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "TICKET_REASSIGNED_ADMIN",
    old_state: oldComplaint,
    new_state: {
      department_id: targetDepartmentId,
      assigned_staff_id: targetStaffId,
      priority,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/staff/dashboard");
  revalidatePath("/student/dashboard");
  return { success: true };
}

export async function createCategoryAction(formData: FormData) {
  const name = getFormField(formData, "name");
  const departmentId = getFormField(formData, "departmentId");

  if (!name || !departmentId) {
    return { error: "Category name and department are required." };
  }

  const supabase = await createClient();

  // Verify caller session & admin privileges
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "Unauthenticated. Please log in again." };
  }

  const { data: adminProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { error: "Unauthorized. Admin privileges required." };
  }

  // Insert into categories table
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .insert({
      name,
      department_id: departmentId,
    })
    .select("id")
    .maybeSingle();

  if (categoryError) {
    return { error: categoryError.message || "Failed to create category." };
  }

  // Record audit log entry
  await supabase.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "create_category",
    new_state: { name, department_id: departmentId },
  });

  revalidatePath("/admin/users");
  revalidatePath("/student/complaints/new");
  
  return { success: true, message: "Category created successfully!" };
}
