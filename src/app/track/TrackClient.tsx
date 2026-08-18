"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { trackComplaintAction } from "../student/complaints/actions";
import {
  Search,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  ArrowLeft,
  Calendar,
  Lock,
  Tag,
  Paperclip,
  ExternalLink,
} from "lucide-react";

export default function TrackClient() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await trackComplaintAction(code.trim());
      if (res.error) {
        setError(res.error);
        setResult(null);
      } else {
        setResult(res);
        setError(null);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"><Clock className="w-3.5 h-3.5" /> Ticket Submitted</span>;
      case "assigned":
      case "in_progress":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
      case "resolved":
      case "closed":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-300 border border-gray-500/30">{status}</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#A7F3D0]/80 hover:text-[#ECFDF5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981] font-semibold bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
          <Lock className="w-3.5 h-3.5" /> Encrypted Public Tracking
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-[#0E2219] border border-[#1D4A38] text-[#10B981] shadow-lg shadow-emerald-950/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ECFDF5] font-display">
          Anonymous Ticket Tracker
        </h1>
        <p className="text-sm text-[#A7F3D0]/80 max-w-lg mx-auto">
          Enter your Ticket Number (e.g., <code className="bg-[#0E2219] px-2 py-0.5 rounded text-[#10B981] font-mono text-xs">CMP-2026-8465771</code>) or Access Code to view live repair status and timeline notes without logging in.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="care-panel rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CMP-2026-8465771 or CC-ANON-98A7F2"
              className="w-full pl-11 pr-4 py-3.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-base font-mono uppercase tracking-wider text-[#ECFDF5] placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
            <Search className="w-5 h-5 text-[#10B981] absolute left-3.5 top-4 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={isPending || !code.trim()}
            className="py-3.5 px-6 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
          >
            {isPending ? "Searching..." : "Track Status"}
          </button>
        </div>
      </form>

      {/* Error Output */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-semibold animate-in fade-in zoom-in-95 duration-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && result.complaint && (
        <div className="care-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Ticket Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1D4A38]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded border border-[#10B981]/20">
                  {result.complaint.ticket_number || result.complaint.tracking_code}
                </span>
                {getStatusBadge(result.complaint.status)}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#ECFDF5] mt-2">
                {result.complaint.title}
              </h2>
            </div>

            <div className="text-left sm:text-right text-xs text-[#A7F3D0]/70 space-y-1">
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Filed: {new Date(result.complaint.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Target SLA: {new Date(result.complaint.sla_due_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Issue Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38]/60 space-y-1">
              <span className="text-xs text-[#A7F3D0]/60 font-semibold block">Department</span>
              <span className="text-sm font-bold text-[#ECFDF5] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#10B981]" />
                {result.complaint.departments?.name || "Maintenance"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38]/60 space-y-1">
              <span className="text-xs text-[#A7F3D0]/60 font-semibold block">Category</span>
              <span className="text-sm font-bold text-[#ECFDF5] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#10B981]" />
                {result.complaint.categories?.name || "General"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38]/60 space-y-1">
              <span className="text-xs text-[#A7F3D0]/60 font-semibold block">Reporter Identity</span>
              <span className="text-sm font-bold text-[#ECFDF5] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#10B981]" />
                {result.complaint.is_anonymous ? "Anonymous Student" : result.complaint.reporter_name}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#A7F3D0] uppercase tracking-wider text-xs">Issue Description</h3>
            <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38]/60 text-sm text-[#ECFDF5] leading-relaxed">
              {result.complaint.description}
            </div>
          </div>

          {/* Attachments Section */}
          {result.attachments && result.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#A7F3D0] uppercase tracking-wider">Photo Evidence</h3>
              <div className="flex flex-wrap gap-3">
                {result.attachments.map((att: any) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#07130E] border border-[#1D4A38] text-xs font-semibold text-[#10B981] hover:bg-[#0E2219] transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>View Evidence Photo</span>
                    <ExternalLink className="w-3 h-3 text-[#A7F3D0]/60" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline & Notes */}
          <div className="space-y-4 pt-4 border-t border-[#1D4A38]">
            <h3 className="text-sm font-bold text-[#A7F3D0] uppercase tracking-wider text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#10B981]" />
              <span>Public Progress Timeline ({result.notes?.length || 0})</span>
            </h3>

            {result.notes && result.notes.length > 0 ? (
              <div className="space-y-3">
                {result.notes.map((note: any) => (
                  <div key={note.id} className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38]/60 space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#A7F3D0]/60">
                      <span className="font-semibold text-[#10B981]">Maintenance Update</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[#ECFDF5] mt-1">{note.note_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-[#07130E] border border-[#1D4A38]/40 text-xs text-[#A7F3D0]/60">
                No progress notes posted yet. The maintenance team will post updates as work proceeds.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
