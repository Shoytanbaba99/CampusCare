"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const acceptSchema = z.object({
  complaintId: z.string().uuid(),
});

const noteSchema = z.object({
  complaintId: z.string().uuid(),
  noteText: z.string().min(3, "Progress note must be at least 3 characters long."),
  isInternal: z.coerce.boolean().optional(),
});

const resolveSchema = z.object({
  complaintId: z.string().uuid(),
  resolutionNotes: z.string().min(5, "Please provide resolution notes explaining repair actions."),
});

export async function acceptTicketAction(prevState: unknown, formData: FormData) {
  const rawData = {
    complaintId: formData.get("complaintId"),
  };

  const validated = acceptSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Invalid ticket parameters." };
  }

  const { complaintId } = validated.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  // 1. Update Complaint status to 'in_progress' and set assigned_staff_id
  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      status: "in_progress",
      assigned_staff_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Append Timeline note
  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: "Ticket accepted by Staff Resolver. Work is now In Progress.",
    is_internal: false,
  });

  // 3. Log Audit event
  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "TICKET_ACCEPTED_STAFF",
    new_state: { status: "in_progress", assigned_staff_id: user.id },
  });

  revalidatePath("/staff/dashboard");
  revalidatePath(`/staff/complaints/${complaintId}`);
  return { success: true };
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

  const { complaintId, noteText, isInternal } = validated.data;
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthenticated." };
  }

  // 1. Update Complaint status to 'resolved'
  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 2. Append resolution progress note
  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: `Resolution Summary: ${resolutionNotes}`,
    is_internal: false,
  });

  // 3. Handle Optional Repair Proof Photo Upload
  const file = formData.get("repairProofFile") as File | null;
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/repair_${complaintId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("complaint-evidence")
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("complaint-evidence").getPublicUrl(filePath);

      await supabase.from("attachments").insert({
        complaint_id: complaintId,
        uploader_id: user.id,
        file_url: publicUrl,
        file_type: file.type,
        file_size_bytes: file.size,
        attachment_type: "repair_proof",
      });
    }
  }

  // 4. Log Audit Ledger
  await supabase.from("audit_logs").insert({
    complaint_id: complaintId,
    actor_id: user.id,
    action: "TICKET_RESOLVED_STAFF",
    new_state: { status: "resolved", resolution_notes: resolutionNotes },
  });

  revalidatePath("/staff/dashboard");
  revalidatePath(`/staff/complaints/${complaintId}`);
  return { success: true };
}
