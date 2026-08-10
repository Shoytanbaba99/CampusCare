"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "student" | "staff" | "admin",
  departmentId?: string
) {
  const supabase = await createClient();

  // 1. Verify caller session & admin privileges
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

  // 2. Perform role & department update on public.users
  const updatePayload: { role: string; department_id?: string | null } = {
    role: newRole,
  };

  if (newRole === "staff") {
    if (!departmentId) {
      return { error: "Please select a department for staff members." };
    }
    updatePayload.department_id = departmentId;
  } else {
    updatePayload.department_id = null;
  }

  const { error: updateError } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", targetUserId);

  if (updateError) {
    return { error: updateError.message || "Failed to update user role." };
  }

  // 3. Write Immutable Audit Log Record
  await supabase.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "USER_ROLE_PROMOTED",
    target_table: "users",
    target_id: targetUserId,
    details: {
      new_role: newRole,
      department_id: departmentId || null,
      updated_at: new Date().toISOString(),
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function createDepartmentAction(name: string, code: string) {
  const supabase = await createClient();

  // 1. Verify caller session & admin privileges
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

  const trimmedName = name.trim();
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedName || !trimmedCode) {
    return { error: "Department name and short code are required." };
  }

  // 2. Insert into public.departments
  const { data: dept, error: deptError } = await supabase
    .from("departments")
    .insert({
      name: trimmedName,
      code: trimmedCode,
    })
    .select("id")
    .single();

  if (deptError || !dept) {
    return { error: deptError?.message || "Failed to create department." };
  }

  // 3. Write Audit Log
  await supabase.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "DEPARTMENT_CREATED",
    target_table: "departments",
    target_id: dept.id,
    details: {
      name: trimmedName,
      code: trimmedCode,
      created_at: new Date().toISOString(),
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  revalidatePath("/student/complaints/new");
  return { success: true };
}

