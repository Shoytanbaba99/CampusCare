"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const acceptSchema = z.object({
  complaintId: z.string().min(1),
});

const noteSchema = z.object({
  complaintId: z.string().min(1),
  noteText: z.string().min(3, "Progress note must be at least 3 characters long."),
  isInternal: z.coerce.boolean().optional(),
});

const resolveSchema = z.object({
  complaintId: z.string().min(1),
  resolutionNotes: z.string().min(5, "Please provide resolution notes explaining repair actions."),
});

const slaOverrideSchema = z.object({
  complaintId: z.string().min(1),
  newSlaDueAt: z.string().min(1, "Please select a valid deadline date."),
  reason: z.string().min(3, "Please provide a reason for the SLA adjustment."),
});

export async function updateComplaintStatusAction(complaintId: string, newStatus: string, assignedStaffId?: string) {
  const allowedStatuses = ["submitted", "assigned", "in_progress", "resolved", "closed"];
  if (!allowedStatuses.includes(newStatus)) {
    return { error: "Invalid status value." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (assignedStaffId) {
    updatePayload.assigned_staff_id = assignedStaffId;
  }
  if (newStatus === "resolved" || newStatus === "closed") {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("complaints")
    .update(updatePayload)
    .eq("id", complaintId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: `Status updated to ${newStatus.toUpperCase()}${assignedStaffId ? " and assigned to staff member." : "."}`,
    is_internal: false,
  });

  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "STATUS_UPDATED",
    new_state: updatePayload,
  });

  revalidatePath("/staff/dashboard");
  revalidatePath(`/staff/complaints/${complaintId}`);
  return { success: true };
}

export async function overrideSlaDateAction(complaintId: string, newSlaDueAt: string, reason: string) {
  const validated = slaOverrideSchema.safeParse({ complaintId, newSlaDueAt, reason });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input parameters." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  const isoDate = new Date(newSlaDueAt).toISOString();

  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      sla_due_at: isoDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { error: updateError.message };
  }

  const formattedDate = new Date(isoDate).toLocaleString();
  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: `SLA Target Completion Date adjusted to ${formattedDate}. Reason: ${reason}`,
    is_internal: false,
  });

  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "SLA_OVERRIDDEN_STAFF",
    new_state: { sla_due_at: isoDate, reason },
  });

  revalidatePath("/staff/dashboard");
  revalidatePath(`/staff/complaints/${complaintId}`);
  revalidatePath("/student/dashboard");
  return { success: true };
}

export async function addProgressNoteAction(complaintId: string, noteText: string, isInternal: boolean = false) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  const { error } = await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: noteText,
    is_internal: isInternal,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/staff/complaints/${complaintId}`);
  return { success: true };
}

export async function acceptTicketAction(prevState: unknown, formData: FormData) {
  const rawData = {
    complaintId: formData.get("complaintId"),
  };

  const validated = acceptSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid ticket parameters." };
  }

  const { complaintId } = validated.data;
  return updateComplaintStatusAction(complaintId, "in_progress");
}

export async function appendProgressNoteAction(prevState: unknown, formData: FormData) {
  const rawData = {
    complaintId: formData.get("complaintId"),
    noteText: formData.get("noteText"),
    isInternal: formData.get("isInternal") === "on",
  };

  const validated = noteSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid note text." };
  }

  const { complaintId, noteText, isInternal = false } = validated.data;
  return addProgressNoteAction(complaintId, noteText, isInternal);
}

export async function resolveTicketAction(prevState: unknown, formData: FormData) {
  const rawData = {
    complaintId: formData.get("complaintId"),
    resolutionNotes: formData.get("resolutionNotes"),
  };

  const validated = resolveSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid resolution data." };
  }

  const { complaintId, resolutionNotes } = validated.data;
  const res = await updateComplaintStatusAction(complaintId, "resolved");
  if (res?.error) return res;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("progress_notes").insert({
      complaint_id: complaintId,
      author_id: user.id,
      note_text: `Resolution Summary: ${resolutionNotes}`,
      is_internal: false,
    });
  }

  return { success: true };
}
