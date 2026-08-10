"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const confirmSchema = z.object({
  complaintId: z.string().uuid(),
  rating: z.coerce.number().min(1).max(5),
  comments: z.string().optional(),
  isAnonymous: z.coerce.boolean().optional(),
});

const rejectSchema = z.object({
  complaintId: z.string().uuid(),
  rejectionReason: z.string().min(5, "Please provide a reason for rejecting the resolution (at least 5 characters)."),
});

export async function confirmResolutionAction(prevState: unknown, formData: FormData) {
  const rawData = {
    complaintId: formData.get("complaintId"),
    rating: formData.get("rating"),
    comments: formData.get("comments"),
    isAnonymous: formData.get("isAnonymous") === "on",
  };

  const validated = confirmSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid feedback data." };
  }

  const { complaintId, rating, comments, isAnonymous } = validated.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  // 1. Update Complaint status to 'closed'
  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", complaintId)
    .eq("reporter_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Insert Feedback row
  await supabase.from("feedback").insert({
    complaint_id: complaintId,
    student_id: user.id,
    rating,
    comments,
    is_anonymous: isAnonymous,
  });

  // 3. Log Audit Ledger
  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "TICKET_CLOSED_CONFIRMED",
    new_state: { status: "closed", rating, comments },
  });

  revalidatePath(`/student/complaints/${complaintId}`);
  return { success: true };
}

export async function rejectResolutionAction(prevState: unknown, formData: FormData) {
  const rawData = {
    complaintId: formData.get("complaintId"),
    rejectionReason: formData.get("rejectionReason"),
  };

  const validated = rejectSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid rejection data." };
  }

  const { complaintId, rejectionReason } = validated.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  // 1. Update Complaint status to 'reopened'
  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      status: "reopened",
    })
    .eq("id", complaintId)
    .eq("reporter_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Append progress note timeline entry
  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: `Resolution Rejected by Student: ${rejectionReason}`,
    is_internal: false,
  });

  // 3. Log Audit Ledger
  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "TICKET_REOPENED_REJECTED",
    new_state: { status: "reopened", rejection_reason: rejectionReason },
  });

  revalidatePath(`/student/complaints/${complaintId}`);
  return { success: true };
}
