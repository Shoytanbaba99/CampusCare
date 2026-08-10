import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import StaffActionPanel from "./StaffActionPanel";
import {
  ArrowLeft,
  Building2,
  Clock,
  MapPin,
  MessageSquare,
  FileImage,
  User,
  AlertTriangle,
} from "lucide-react";

interface StaffTicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffTicketPage({ params }: StaffTicketPageProps) {
  const { id: complaintId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch staff user profile
  const { data: profile } = await supabase
    .from("users")
    .select("id, role, department_id")
    .eq("id", user.id)
    .single();

  // Fetch complaint details
  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(`
      *,
      departments(name, code),
      categories(name),
      reporter:users!complaints_reporter_id_fkey(full_name, email)
    `)
    .eq("id", complaintId)
    .single();

  if (error || !complaint) {
    notFound();
  }

  // Verify staff department boundary
  const userRole = profile?.role || "staff";
  if (
    userRole !== "admin" &&
    profile?.department_id !== complaint.department_id &&
    complaint.assigned_staff_id !== user.id
  ) {
    redirect("/staff/dashboard");
  }

  // Fetch progress notes (All notes including internal notes for staff)
  const { data: progressNotes } = await supabase
    .from("progress_notes")
    .select(`
      id,
      note_text,
      is_internal,
      created_at,
      users(full_name, role)
    `)
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });

  // Fetch attachments (initial evidence & repair proof)
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
  const reporterName = Array.isArray(complaint.reporter)
    ? complaint.reporter[0]?.full_name
    : (complaint.reporter as { full_name: string } | null)?.full_name || "Student";

  const now = new Date();
  const isOverdue = new Date(complaint.sla_due_at) < now && complaint.status !== "closed" && complaint.status !== "resolved";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#111827] border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#6366F1]">
              {complaint.ticket_number}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {isOverdue && (
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                OVERDUE SLA BREACH
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB] mt-1">
            {complaint.title}
          </h1>
        </div>
      </div>

      {/* Staff Action Panel (Accept, Append Log Note, Resolve) */}
      <StaffActionPanel
        complaintId={complaint.id}
        status={complaint.status}
        assignedStaffId={complaint.assigned_staff_id}
        currentUserId={user.id}
      />

      {/* Ticket Specification Panel */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-base font-semibold text-[#F9FAFB] border-b border-[#1F2937] pb-3">
          Complaint Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Reporting Student
            </span>
            <p className="font-semibold text-[#F9FAFB]">{reporterName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Department & Category
            </span>
            <p className="font-semibold text-[#F9FAFB]">{deptName}</p>
            <p className="text-[#9CA3AF]">{catName}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[#9CA3AF] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Location
            </span>
            <p className="font-semibold text-[#F9FAFB]">{complaint.location}</p>
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
            Issue Description
          </span>
          <p className="text-sm text-[#F9FAFB] leading-relaxed bg-[#090D16] p-4 rounded-lg border border-[#1F2937]">
            {complaint.description}
          </p>
        </div>

        {/* Attached Evidence & Repair Proof Photos */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#1F2937]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-blue-400" />
              Attached Media & Repair Proof
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
                  {/* eslint-disable-next-next/no-img-element */}
                  <img
                    src={att.file_url}
                    alt="Attached media"
                    className="w-40 h-28 object-cover group-hover:scale-105 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium text-white transition-all">
                    {att.attachment_type === "repair_proof" ? "Repair Proof" : "Evidence"}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete Progress Log Timeline */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-base font-semibold text-[#F9FAFB] border-b border-[#1F2937] pb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          Progress Log & Maintenance Notes
        </h2>

        {!progressNotes || progressNotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9CA3AF]">
            No progress notes logged yet. Use the control panel above to append work logs.
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
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#111827]" />

                  <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span className="font-semibold text-[#F9FAFB] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      {authorName} ({authorRole.toUpperCase()})
                      {note.is_internal && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          INTERNAL NOTE
                        </span>
                      )}
                    </span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>

                  <div
                    className={`p-3 rounded-lg border text-xs text-[#F9FAFB] ${
                      note.is_internal
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-[#090D16] border-[#1F2937]"
                    }`}
                  >
                    {note.note_text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    submitted: { label: "Unassigned", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    assigned: { label: "Assigned", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-400" },
    in_progress: { label: "In Progress", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    resolved: { label: "Resolved", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
    closed: { label: "Closed", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400" },
    reopened: { label: "Reopened", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-400" },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; bg: string; text: string; pulse?: boolean }> = {
    low: { label: "Low", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400" },
    medium: { label: "Medium", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    high: { label: "High", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    critical: { label: "Critical (4h SLA)", bg: "bg-red-500/20 border-red-500/40", text: "text-red-400", pulse: true },
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
