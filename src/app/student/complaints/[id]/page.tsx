import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import VerificationPrompt from "./VerificationPrompt";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  FileImage,
  ShieldCheck,
  User,
} from "lucide-react";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id: complaintId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch complaint details
  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      departments(name, code),
      categories(name)
    `,
    )
    .eq("id", complaintId)
    .eq("reporter_id", user.id)
    .single();

  if (error || !complaint) {
    notFound();
  }

  // Fetch progress notes timeline (public notes only)
  const { data: progressNotes } = await supabase
    .from("progress_notes")
    .select(
      `
      id,
      note_text,
      created_at,
      users(full_name, role)
    `,
    )
    .eq("complaint_id", complaintId)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  // Fetch attachments (evidence photos)
  const { data: attachments } = await supabase
    .from("attachments")
    .select("*")
    .eq("complaint_id", complaintId);

  const deptName = Array.isArray(complaint.departments)
    ? complaint.departments[0]?.name
    : (complaint.departments as { name: string } | null)?.name || "General";
  const catName = Array.isArray(complaint.categories)
    ? complaint.categories[0]?.name
    : (complaint.categories as { name: string } | null)?.name || "General";

  const isResolved = complaint.status === "resolved";
  const isClosed = complaint.status === "closed";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Navigation & Ticket Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#111827] border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#6366F1]">
              {complaint.ticket_number}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB] mt-1">
            {complaint.title}
          </h1>
        </div>
      </div>

      {/* Verification Prompt (If Status is 'resolved') */}
      {isResolved && <VerificationPrompt complaintId={complaint.id} />}

      {/* Ticket Details Panel */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-base font-semibold text-[#F9FAFB] border-b border-[#1F2937] pb-3">
          Complaint Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#6366F1]" />
              Department & Category
            </span>
            <p className="font-semibold text-[#F9FAFB]">{deptName}</p>
            <p className="text-[#9CA3AF]">{catName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
              Physical Location
            </span>
            <p className="font-semibold text-[#F9FAFB]">{complaint.location}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#6366F1]" />
              Date Submitted
            </span>
            <p className="font-semibold text-[#F9FAFB]">
              {new Date(complaint.created_at).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Target SLA Resolution
            </span>
            <p className="font-semibold text-[#F9FAFB]">
              {new Date(complaint.sla_due_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-2 pt-2 border-t border-[#1F2937]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Detailed Description
          </span>
          <p className="text-sm text-[#F9FAFB] leading-relaxed bg-[#090D16] p-4 rounded-lg border border-[#1F2937]">
            {complaint.description}
          </p>
        </div>

        {/* Attached Evidence Photos */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#1F2937]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-[#6366F1]" />
              Attached Photographic Evidence
            </span>
            <div className="flex flex-wrap gap-4">
              {attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block rounded-lg overflow-hidden border border-[#1F2937] bg-[#090D16]"
                >
                  <Image
                    src={att.file_url}
                    alt="Evidence photo"
                    width={160}
                    height={112}
                    className="w-40 h-28 object-cover group-hover:scale-105 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium text-white transition-all">
                    View Full Image
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chronological Progress Notes Timeline */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-base font-semibold text-[#F9FAFB] border-b border-[#1F2937] pb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#6366F1]" />
          Maintenance Progress Timeline
        </h2>

        {!progressNotes || progressNotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9CA3AF] space-y-1">
            <p>No progress updates logged yet by staff resolvers.</p>
            <p className="text-[10px] text-[#9CA3AF]/60">
              Updates will appear here chronologically as staff accept and work on your complaint.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#1F2937] space-y-6">
            {progressNotes.map((note) => {
              const authorName = Array.isArray(note.users)
                ? note.users[0]?.full_name
                : (note.users as { full_name: string; role: string } | null)?.full_name || "Staff";
              const authorRole = Array.isArray(note.users)
                ? note.users[0]?.role
                : (note.users as { full_name: string; role: string } | null)?.role || "staff";

              return (
                <div key={note.id} className="relative space-y-1.5">
                  <div className="absolute -left-7.75 top-0.5 w-4 h-4 rounded-full bg-[#6366F1] border-4 border-[#111827]" />

                  <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span className="font-semibold text-[#F9FAFB] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#6366F1]" />
                      {authorName} ({authorRole.toUpperCase()})
                    </span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>

                  <div className="p-3 bg-[#090D16] rounded-lg border border-[#1F2937] text-xs text-[#F9FAFB]">
                    {note.note_text}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isClosed && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>This ticket has been confirmed resolved and closed.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    submitted: {
      label: "Submitted",
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-400",
    },
    assigned: {
      label: "Assigned",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      text: "text-indigo-400",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-400",
    },
    resolved: {
      label: "Resolved (Action Required)",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-400",
    },
    closed: { label: "Closed", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400" },
    reopened: { label: "Reopened", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-400" },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<
    string,
    { label: string; bg: string; text: string; pulse?: boolean }
  > = {
    low: { label: "Low", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400" },
    medium: { label: "Medium", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    high: { label: "High", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    critical: {
      label: "Critical (4h SLA)",
      bg: "bg-red-500/20 border-red-500/40",
      text: "text-red-400",
      pulse: true,
    },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${
        config.pulse ? "animate-pulse shadow-sm shadow-red-500/50" : ""
      }`}
    >
      {config.label}
    </span>
  );
}
