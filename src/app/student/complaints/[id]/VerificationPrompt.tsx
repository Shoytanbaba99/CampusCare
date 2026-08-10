"use client";

import { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import { confirmResolutionAction, rejectResolutionAction } from "../detailActions";
import { CheckCircle2, XCircle, Star, AlertCircle, Send } from "lucide-react";

interface VerificationPromptProps {
  complaintId: string;
}

export default function VerificationPrompt({ complaintId }: VerificationPromptProps) {
  const [mode, setMode] = useState<"initial" | "confirm" | "reject">("initial");
  const [rating, setRating] = useState<number>(5);

  const [confirmState, confirmFormAction, isConfirmPending] = useActionState(
    confirmResolutionAction,
    null
  );
  const [rejectState, rejectFormAction, isRejectPending] = useActionState(
    rejectResolutionAction,
    null
  );

  useEffect(() => {
    if (confirmState?.success) {
      toast.success("Ticket confirmed resolved and closed!");
    } else if (confirmState?.error) {
      toast.error(confirmState.error);
    }
  }, [confirmState]);

  useEffect(() => {
    if (rejectState?.success) {
      toast.warning("Resolution rejected. Ticket has been reopened.");
    } else if (rejectState?.error) {
      toast.error(rejectState.error);
    }
  }, [rejectState]);

  return (
    <div className="bg-[#111827] border-2 border-emerald-500/30 rounded-xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center gap-3 text-emerald-400">
        <CheckCircle2 className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-bold text-base text-[#F9FAFB]">
            Maintenance Completed: Verification Required
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            The staff resolver has marked this ticket resolved. Please confirm or reject the repair action.
          </p>
        </div>
      </div>

      {mode === "initial" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setMode("confirm")}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Resolution & Close</span>
          </button>
          <button
            onClick={() => setMode("reject")}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F2937] hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-medium text-sm rounded-lg transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Resolution (Reopen Ticket)</span>
          </button>
        </div>
      )}

      {mode === "confirm" && (
        <form action={confirmFormAction} className="space-y-4 pt-2 border-t border-[#1F2937]">
          <input type="hidden" name="complaintId" value={complaintId} />
          <input type="hidden" name="rating" value={rating} />

          {confirmState?.error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{confirmState.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Rate Service Quality (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-all hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "text-amber-400 fill-amber-400" : "text-[#1F2937]"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-[#9CA3AF] ml-2">{rating} / 5 Stars</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comments" className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Feedback Comments (Optional)
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={3}
              placeholder="Provide feedback regarding response speed or repair quality..."
              className="w-full p-3 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isAnonymous"
              name="isAnonymous"
              type="checkbox"
              className="rounded bg-[#090D16] border-[#1F2937] text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isAnonymous" className="text-xs text-[#9CA3AF]">
              Submit feedback anonymously
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isConfirmPending}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isConfirmPending ? "Closing Ticket..." : "Submit Rating & Close Ticket"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("initial")}
              className="py-2 px-3 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === "reject" && (
        <form action={rejectFormAction} className="space-y-4 pt-2 border-t border-[#1F2937]">
          <input type="hidden" name="complaintId" value={complaintId} />

          {rejectState?.error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rejectState.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="rejectionReason" className="block text-xs font-medium uppercase tracking-wider text-rose-400">
              Reason for Rejection *
            </label>
            <textarea
              id="rejectionReason"
              name="rejectionReason"
              rows={3}
              required
              placeholder="Explain why the issue is not fully resolved (e.g. AC is still making noise / leak persists)..."
              className="w-full p-3 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            ></textarea>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isRejectPending}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-all disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isRejectPending ? "Reopening Ticket..." : "Confirm Rejection & Reopen"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("initial")}
              className="py-2 px-3 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
