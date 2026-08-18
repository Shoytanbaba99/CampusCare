import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import StaffActionPanel from "./StaffActionPanel";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Building2,
  User,
  AlertTriangle,
  FileImage,
  MessageSquare,
} from "lucide-react";

interface StaffComplaintPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffComplaintDetailPage({ params }: StaffComplaintPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Complaint details with department, category, attachments, progress notes, and reporter
  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(`
      *,
      departments (id, name, code),
      categories (id, name),
      attachments (*),
      progress_notes (*, users (full_name, role)),
      reporter:users!reporter_id(full_name, email)
    `)
    .eq("id", id)
    .single();

  if (error || !complaint) {
    notFound();
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from("users")
    .select("role, department_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    redirect("/student/dashboard");
  }

  const deptName = Array.isArray(complaint.departments)
    ? complaint.departments[0]?.name
    : (complaint.departments as { name: string } | null)?.name || "General Maintenance";

  const catName = Array.isArray(complaint.categories)
    ? complaint.categories[0]?.name
    : (complaint.categories as { name: string } | null)?.name || "General Issue";

  const attachments = complaint.attachments || [];
  const progressNotes = complaint.progress_notes || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Back Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#0E2219] border border-[#1D4A38] text-[#A7F3D0]/80 hover:text-[#ECFDF5] hover:border-[#10B981] btn-care"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs text-[#10B981] font-mono font-bold tracking-wider">
            WORK TICKET #{complaint.ticket_number || complaint.id.substring(0, 8).toUpperCase()}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">
            {complaint.title}
          </h1>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="care-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Status & Priority Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1D4A38]">
          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A7F3D0]/80">
            <Clock className="w-4 h-4 text-[#10B981]" />
            <span>
              SLA Repair Target:{" "}
              <strong className="text-[#ECFDF5]">
                {complaint.sla_due_at ? new Date(complaint.sla_due_at).toLocaleString() : "N/A"}
              </strong>
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-sans text-xs">
          <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38] space-y-1">
            <span className="text-[#A7F3D0]/70 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#10B981]" />
              REPORTER
            </span>
            <p className="font-bold text-[#ECFDF5] text-sm">
              {complaint.is_anonymous
                ? "Anonymous Student"
                : (Array.isArray(complaint.reporter) ? complaint.reporter[0]?.full_name : complaint.reporter?.full_name) || "Student User"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38] space-y-1">
            <span className="text-[#A7F3D0]/70 font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
              DEPARTMENT
            </span>
            <p className="font-bold text-[#ECFDF5] text-sm">{deptName}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38] space-y-1">
            <span className="text-[#A7F3D0]/70 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#10B981]" />
              CATEGORY
            </span>
            <p className="font-bold text-[#ECFDF5] text-sm">{catName}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#07130E] border border-[#1D4A38] space-y-1">
            <span className="text-[#A7F3D0]/70 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              LOCATION
            </span>
            <p className="font-bold text-[#ECFDF5] text-sm">{complaint.location}</p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#A7F3D0] font-display">Student Issue Report</h3>
          <div className="p-5 rounded-xl bg-[#07130E] border border-[#1D4A38] text-xs text-[#ECFDF5] leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Photo Evidence */}
        {attachments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#A7F3D0] font-display flex items-center gap-2">
              <FileImage className="w-4 h-4 text-[#10B981]" />
              Attached Photo Proof
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attachments.map((att: { id: string; file_url: string; attachment_type: string }) => (
                <div key={att.id} className="relative group overflow-hidden rounded-xl border border-[#1D4A38]">
                  <img
                    src={att.file_url}
                    alt="Evidence photo"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] text-[#A7F3D0] capitalize font-medium">
                      {att.attachment_type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Staff Action Desk (Assign, Update Status, Add Work Log) */}
      <StaffActionPanel
        complaintId={complaint.id}
        currentStatus={complaint.status}
        assignedStaffId={complaint.assigned_staff_id}
        currentUserId={user.id}
      />

      {/* Progress Notes & Audit History */}
      <div className="care-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1D4A38] pb-4">
          <h2 className="text-lg font-bold text-[#ECFDF5] font-display flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#10B981]" />
            Work Log & Audit Timeline
          </h2>
          <span className="text-xs text-[#34D399] font-mono">
            {progressNotes.length} AUDIT LOGS
          </span>
        </div>

        {progressNotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A7F3D0]/70 space-y-1">
            <p>No work logs added yet.</p>
            <p className="text-[11px] text-[#A7F3D0]/50">Use the action panel above to post work updates.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1D4A38]">
            {progressNotes.map((note: { id: string; created_at: string; note_text: string; is_internal?: boolean; users: unknown }) => {
              const authorName = Array.isArray(note.users)
                ? note.users[0]?.full_name
                : (note.users as { full_name: string; role: string } | null)?.full_name || "Staff";
              const authorRole = Array.isArray(note.users)
                ? note.users[0]?.role
                : (note.users as { full_name: string; role: string } | null)?.role || "staff";

              return (
                <div key={note.id} className="relative space-y-2">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#10B981] border-4 border-[#07130E] ring-4 ring-[#10B981]/20" />

                  <div className="flex items-center justify-between text-xs text-[#A7F3D0]/70">
                    <span className="font-semibold text-[#ECFDF5] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#10B981]" />
                      {authorName} ({authorRole.toUpperCase()})
                      {note.is_internal && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          INTERNAL NOTE
                        </span>
                      )}
                    </span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>

                  <div
                    className={`p-4 rounded-xl border text-xs text-[#ECFDF5] leading-relaxed ${
                      note.is_internal
                        ? "bg-amber-500/10 border-amber-500/25"
                        : "bg-[#07130E] border-[#1D4A38]"
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
    submitted: { label: "Unassigned", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-[#34D399]" },
    assigned: { label: "Assigned", bg: "bg-[#10B981]/20 border-[#10B981]/40", text: "text-[#ECFDF5]" },
    in_progress: { label: "In Progress", bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-300" },
    resolved: { label: "Resolved", bg: "bg-emerald-500/20 border-emerald-500/40", text: "text-emerald-300" },
    closed: { label: "Closed", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-[#34D399]" },
    reopened: { label: "Reopened", bg: "bg-rose-500/15 border-rose-500/30", text: "text-rose-300" },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${config.bg} ${config.text} uppercase tracking-wider`}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; bg: string; text: string }> = {
    low: { label: "Low Priority", bg: "bg-slate-500/15 border-slate-500/30", text: "text-slate-300" },
    medium: { label: "Medium Priority", bg: "bg-teal-500/15 border-teal-500/30", text: "text-teal-300" },
    high: { label: "High Priority", bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-300" },
    critical: { label: "Critical Priority", bg: "bg-red-500/15 border-red-500/30", text: "text-red-300" },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${config.bg} ${config.text} uppercase tracking-wider`}>
      {config.label}
    </span>
  );
}
