"use client";

import { useState, useEffect, useActionState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { acceptTicketAction, appendProgressNoteAction, resolveTicketAction } from "../../actions";
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Lock,
  MessageSquarePlus,
  X,
} from "lucide-react";

interface StaffActionPanelProps {
  complaintId: string;
  status: string;
  assignedStaffId: string | null;
  currentUserId: string;
}

export default function StaffActionPanel({
  complaintId,
  status,
  assignedStaffId,
  currentUserId,
}: StaffActionPanelProps) {
  const [activeTab, setActiveTab] = useState<"note" | "resolve">("note");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [acceptState, acceptFormAction, isAcceptPending] = useActionState(acceptTicketAction, null);
  const [noteState, noteFormAction, isNotePending] = useActionState(appendProgressNoteAction, null);
  const [resolveState, resolveFormAction, isResolvePending] = useActionState(resolveTicketAction, null);

  useEffect(() => {
    if (acceptState?.success) {
      toast.success("Ticket accepted into your queue!");
    } else if (acceptState?.error) {
      toast.error(acceptState.error);
    }
  }, [acceptState]);

  useEffect(() => {
    if (noteState?.success) {
      toast.success("Progress note appended to timeline!");
    } else if (noteState?.error) {
      toast.error(noteState.error);
    }
  }, [noteState]);

  useEffect(() => {
    if (resolveState?.success) {
      toast.success("Ticket marked resolved and student notified!");
    } else if (resolveState?.error) {
      toast.error(resolveState.error);
    }
  }, [resolveState]);

  const isAssignedToMe = assignedStaffId === currentUserId;
  const canAccept = status === "submitted" || status === "assigned";
  const canWork = status === "in_progress" || status === "reopened";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="bg-[#111827] border-2 border-blue-500/30 rounded-xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-400" />
          <h2 className="font-bold text-base text-[#F9FAFB]">
            Staff Resolver Controls
          </h2>
        </div>
        {isAssignedToMe && (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            Assigned to You
          </span>
        )}
      </div>

      {/* 1. Ticket Acceptance Trigger (If Ticket is Unassigned / Submitted) */}
      {canAccept && (
        <form action={acceptFormAction} className="space-y-3">
          <input type="hidden" name="complaintId" value={complaintId} />

          {acceptState?.error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{acceptState.error}</span>
            </div>
          )}

          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm text-[#F9FAFB]">Unassigned Department Ticket</h3>
              <p className="text-xs text-[#9CA3AF]">
                Accept this ticket into your active maintenance queue to start repair work.
              </p>
            </div>
            <button
              type="submit"
              disabled={isAcceptPending}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-blue-600/20 transition-all shrink-0 disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              <span>{isAcceptPending ? "Accepting..." : "Accept Ticket into Queue"}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Active Work Controls (Append Note & Resolve Ticket) */}
      {canWork && (
        <div className="space-y-4">
          {/* Tab Controls */}
          <div className="flex border-b border-[#1F2937] gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("note")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "note"
                  ? "border-[#6366F1] text-[#6366F1]"
                  : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Append Work Log Note</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resolve")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "resolve"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Mark Resolved</span>
            </button>
          </div>

          {/* Tab 1: Append Progress Note */}
          {activeTab === "note" && (
            <form action={noteFormAction} className="space-y-4">
              <input type="hidden" name="complaintId" value={complaintId} />

              {noteState?.error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{noteState.error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="noteText" className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                  Progress Note Entry *
                </label>
                <textarea
                  id="noteText"
                  name="noteText"
                  rows={3}
                  required
                  placeholder="e.g. Ordered replacement AC capacitor from vendor. Arrival expected tomorrow 2 PM..."
                  className="w-full p-3 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isInternal"
                  name="isInternal"
                  type="checkbox"
                  className="rounded bg-[#090D16] border-[#1F2937] text-[#6366F1] focus:ring-[#6366F1]"
                />
                <label htmlFor="isInternal" className="text-xs text-[#9CA3AF] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Internal Staff Note (Hidden from reporting student)
                </label>
              </div>

              <button
                type="submit"
                disabled={isNotePending}
                className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium text-xs rounded-lg transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isNotePending ? "Saving Note..." : "Append Progress Note"}</span>
              </button>
            </form>
          )}

          {/* Tab 2: Resolve Ticket & Upload Repair Proof */}
          {activeTab === "resolve" && (
            <form action={resolveFormAction} className="space-y-4">
              <input type="hidden" name="complaintId" value={complaintId} />

              {resolveState?.error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resolveState.error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="resolutionNotes" className="block text-xs font-medium uppercase tracking-wider text-emerald-400">
                  Resolution Summary *
                </label>
                <textarea
                  id="resolutionNotes"
                  name="resolutionNotes"
                  rows={3}
                  required
                  placeholder="Explain completed repair actions, replaced parts, or verification steps..."
                  className="w-full p-3 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Optional Repair Proof Photo Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                  Repair Proof Photo (Optional)
                </label>

                <div className="relative border-2 border-dashed border-[#1F2937] hover:border-emerald-500/50 rounded-xl p-4 text-center transition-all bg-[#090D16]">
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <Image
                        src={previewUrl}
                        alt="Repair proof preview"
                        width={400}
                        height={144}
                        unoptimized
                        className="max-h-36 rounded-lg object-contain border border-[#1F2937]"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="repairProofFile" className="cursor-pointer space-y-1 block">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1F2937] text-emerald-400">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-[#9CA3AF]">
                        <span className="text-emerald-400 font-medium">Click to upload repair proof photo</span>
                      </div>
                    </label>
                  )}

                  <input
                    id="repairProofFile"
                    name="repairProofFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResolvePending}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isResolvePending ? "Resolving Ticket..." : "Mark Ticket Resolved"}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
