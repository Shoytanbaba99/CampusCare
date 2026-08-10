"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateComplaintStatusAction, addProgressNoteAction } from "../../actions";
import { Wrench, CheckCircle2, UserCheck, MessageSquarePlus, Send } from "lucide-react";

interface StaffActionPanelProps {
  complaintId: string;
  currentStatus: string;
  assignedStaffId: string | null;
  currentUserId: string;
}

export default function StaffActionPanel({
  complaintId,
  currentStatus,
  assignedStaffId,
  currentUserId,
}: StaffActionPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAssignedToMe = assignedStaffId === currentUserId;

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);
    const res = await updateComplaintStatusAction(complaintId, newStatus);
    setIsSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Ticket status updated to ${newStatus.toUpperCase()}`);
      setStatus(newStatus);
      router.refresh();
    }
  };

  const handleSelfAssign = async () => {
    setIsSubmitting(true);
    const res = await updateComplaintStatusAction(complaintId, "in_progress", currentUserId);
    setIsSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Ticket assigned to you and moved to In Progress");
      setStatus("in_progress");
      router.refresh();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    const res = await addProgressNoteAction(complaintId, noteText, isInternal);
    setIsSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Progress note added to work audit log");
      setNoteText("");
      router.refresh();
    }
  };

  return (
    <div className="care-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-[#1D4A38]">
        <Wrench className="w-5 h-5 text-[#10B981]" />
        <h2 className="font-bold text-base text-[#ECFDF5] font-display">Staff Action & Work Log Desk</h2>
      </div>

      {/* Quick Action Controls */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#A7F3D0] uppercase tracking-wider">
          Quick Action Controls
        </label>

        <div className="flex flex-wrap items-center gap-3">
          {!isAssignedToMe && (
            <button
              onClick={handleSelfAssign}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-[#042014]" />
              <span>Claim & Assign to Me</span>
            </button>
          )}

          {status !== "in_progress" && (
            <button
              onClick={() => handleStatusChange("in_progress")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 btn-care disabled:opacity-50"
            >
              <Wrench className="w-4 h-4 text-black" />
              <span>Mark In Progress</span>
            </button>
          )}

          {status !== "resolved" && (
            <button
              onClick={() => handleStatusChange("resolved")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#042014]" />
              <span>Mark Resolved & Ready</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Progress Note Form */}
      <form onSubmit={handleAddNote} className="space-y-4 pt-4 border-t border-[#1D4A38]">
        <label className="block text-xs font-bold text-[#A7F3D0] uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquarePlus className="w-4 h-4 text-[#10B981]" />
          Post Work Audit Log Note
        </label>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Log repair progress, replaced parts, technician updates, or notes..."
          rows={3}
          required
          className="w-full p-4 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/70 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-[#A7F3D0] font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="w-4 h-4 rounded border-[#1D4A38] bg-[#07130E] text-[#10B981] focus:ring-[#10B981]"
            />
            <span>Internal Staff Only Note (hidden from student view)</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !noteText.trim()}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#042014]" />
            <span>Post Audit Note</span>
          </button>
        </div>
      </form>
    </div>
  );
}
