"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateComplaintStatusAction,
  addProgressNoteAction,
  overrideSlaDateAction,
} from "../../actions";
import { takeoverLiveChatAction, postStaffChatMessageAction, fetchChatStateAction } from "@/app/chat/actions";
import {
  Wrench,
  CheckCircle2,
  UserCheck,
  MessageSquarePlus,
  Send,
  Clock,
  Calendar,
  MessageCircle,
} from "lucide-react";

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

  // SLA Override State
  const [showSlaModal, setShowSlaModal] = useState(false);
  const [slaDate, setSlaDate] = useState("");
  const [slaReason, setSlaReason] = useState("");

  const [isLiveChatActive, setIsLiveChatActive] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgCount, setChatMsgCount] = useState(0);

  const isAssignedToMe = assignedStaffId === currentUserId;

  useEffect(() => {
    const checkChat = async () => {
      const res = await fetchChatStateAction(complaintId);
      if (res.success && res.state) {
        setChatMsgCount(res.state.messages.length);
        if (res.state.mode === "staff") {
          setIsLiveChatActive(true);
        }
      }
    };
    checkChat();
    const interval = setInterval(checkChat, 3000);
    return () => clearInterval(interval);
  }, [complaintId]);

  const handleTakeoverChat = async () => {
    setIsSubmitting(true);
    await takeoverLiveChatAction(complaintId, "Staff Member");
    setIsLiveChatActive(true);
    setIsSubmitting(false);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setIsSubmitting(true);
    await postStaffChatMessageAction(complaintId, chatInput, "Staff Member");
    setChatInput("");
    toast.success("Message sent to live chat");
    setIsSubmitting(false);
  };

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

  const handleSlaOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slaDate || !slaReason.trim()) return;

    setIsSubmitting(true);
    const res = await overrideSlaDateAction(complaintId, slaDate, slaReason);
    setIsSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("SLA Target Date successfully adjusted!");
      setShowSlaModal(false);
      setSlaDate("");
      setSlaReason("");
      router.refresh();
    }
  };

  return (
    <div className="care-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1D4A38]">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#10B981]" />
          <h2 className="font-bold text-base text-[#ECFDF5] font-display">
            Staff Action & Work Log Desk
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowSlaModal(!showSlaModal)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#153326] hover:bg-[#1D4A38] border border-[#1D4A38] text-[#34D399] font-bold text-xs rounded-xl transition-[opacity,transform,background-color,border-color] duration-200 ease-out active:scale-[0.98] btn-care"
        >
          <Clock className="w-4 h-4 text-[#10B981]" />
          <span>{showSlaModal ? "Cancel SLA Change" : "Adjust Target SLA"}</span>
        </button>
      </div>

      {/* SLA Target Override Form Drawer */}
      {showSlaModal && (
        <form
          onSubmit={handleSlaOverrideSubmit}
          className="p-4 bg-[#07130E] border border-[#10B981]/50 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ease-out"
        >
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#10B981] uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Override Target Resolution Deadline (SLA)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7F3D0]">
                New Target Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={slaDate}
                onChange={(e) => setSlaDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E2219] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#A7F3D0]">
                Reason for Adjustment *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Waiting on replacement AC compressor delivery"
                value={slaReason}
                onChange={(e) => setSlaReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E2219] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSlaModal(false)}
              className="px-3 py-1.5 text-xs text-[#A7F3D0]/70 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !slaDate || !slaReason.trim()}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              Save New SLA Target
            </button>
          </div>
        </form>
      )}

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
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              <UserCheck className="w-4 h-4 text-[#042014]" />
              <span>Claim & Assign to Me</span>
            </button>
          )}

          {status !== "in_progress" && (
            <button
              onClick={() => handleStatusChange("in_progress")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              <Wrench className="w-4 h-4 text-black" />
              <span>Mark In Progress</span>
            </button>
          )}

          {status !== "resolved" && (
            <button
              onClick={() => handleStatusChange("resolved")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              <CheckCircle2 className="w-4 h-4 text-[#042014]" />
              <span>Mark Resolved & Ready</span>
            </button>
          )}

          {!isLiveChatActive ? (
            <button
              onClick={handleTakeoverChat}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 py-2.5 px-4 font-extrabold text-xs rounded-xl border shadow-md btn-care disabled:opacity-50 active:scale-[0.98] transition-all duration-150 ease-out ${
                chatMsgCount > 0
                  ? "bg-[#10B981] hover:bg-[#059669] text-[#042014] border-[#10B981] animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  : "bg-[#153326] hover:bg-[#1D4A38] text-[#34D399] border-[#1D4A38] shadow-emerald-950/40"
              }`}
            >
              <MessageCircle className={`w-4 h-4 ${chatMsgCount > 0 ? "text-[#042014]" : "text-[#10B981]"}`} />
              <span>
                {chatMsgCount > 0
                  ? `💬 Student Active in Live Chat (${chatMsgCount} msgs)`
                  : "💬 Join Live Chat Session"}
              </span>
            </button>
          ) : (
            <div className="w-full mt-4 p-4 bg-[#07130E] border border-[#1D4A38] rounded-2xl animate-in fade-in zoom-in-95 duration-200">
              <label className="block text-xs font-bold text-[#A7F3D0] uppercase tracking-wider mb-2">
                Live Staff Messaging
              </label>
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a live message to the student..."
                  className="flex-1 px-3 py-2 bg-[#0E2219] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/60 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !chatInput.trim()}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Add Progress Note Form */}
      <form onSubmit={handleAddNote} className="space-y-4 pt-4 border-t border-[#1D4A38]">
        <label className="block text-xs font-bold text-[#A7F3D0] uppercase tracking-wider items-center gap-1.5">
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
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
          >
            <Send className="w-4 h-4 text-[#042014]" />
            <span>Post Audit Note</span>
          </button>
        </div>
      </form>
    </div>
  );
}
