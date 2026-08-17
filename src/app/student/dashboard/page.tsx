import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  ChevronRight,
  Building2,
  Calendar,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch complaints reported by this student
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(`
      id,
      ticket_number,
      title,
      location,
      priority,
      status,
      created_at,
      sla_due_at,
      departments(name),
      categories(name)
    `)
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false });

  const totalCount = complaints?.length || 0;
  const activeCount =
    complaints?.filter(
      (c) => c.status === "submitted" || c.status === "assigned" || c.status === "in_progress" || c.status === "reopened"
    ).length || 0;
  const resolvedCount =
    complaints?.filter((c) => c.status === "resolved" || c.status === "closed").length || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ECFDF5] font-display">
            Student Intake Dashboard
          </h1>
          <p className="text-xs text-[#A7F3D0]/80">
            Track reported issues, monitor target repair deadlines, and verify completed repairs.
          </p>
        </div>
        <Link
          href="/student/complaints/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-xs shadow-md shadow-emerald-500/20 btn-care self-start sm:self-auto active:scale-[0.98] transition-transform duration-150 ease-out"
        >
          <Plus className="w-4 h-4 text-[#042014]" />
          <span>NEW TICKET REPORT</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
            <FileText className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{totalCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Active / Pending</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{activeCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved / Closed</span>
            <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{resolvedCount}</p>
        </div>
      </div>

      {/* Complaints List Table */}
      <div className="care-panel rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
        <div className="px-6 py-4 border-b border-[#1D4A38] flex items-center justify-between">
          <h2 className="font-semibold text-base text-[#ECFDF5] font-display">Recent Ticket Feed</h2>
          <span className="text-xs text-[#A7F3D0]/80">
            TOTAL RECORDS: {totalCount}
          </span>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-400 text-sm">
            Failed to load complaints. Please refresh the page.
          </div>
        ) : !complaints || complaints.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#153326] text-[#A7F3D0]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-[#ECFDF5] font-display">No complaints reported yet</h3>
              <p className="text-xs text-[#A7F3D0]/80 max-w-sm mx-auto">
                Have an issue with classroom tech, plumbing, or broken equipment? Submit a ticket to notify maintenance.
              </p>
            </div>
            <Link
              href="/student/complaints/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] btn-care active:scale-[0.98] transition-transform duration-150 ease-out shadow-[0_8px_30px_rgb(16,185,129,0.08)]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit First Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1D4A38]">
            {complaints.map((item) => {
              const deptName = Array.isArray(item.departments)
                ? item.departments[0]?.name
                : (item.departments as { name: string } | null)?.name || "General";
              const catName = Array.isArray(item.categories)
                ? item.categories[0]?.name
                : (item.categories as { name: string } | null)?.name || "General";

              return (
                <div
                  key={item.id}
                  className="p-6 sm:p-8 hover:bg-[#153326]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#34D399]">
                        {item.ticket_number}
                      </span>
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <h3 className="font-semibold text-base text-[#ECFDF5] font-display">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#A7F3D0]/80">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
                        {deptName} • {catName}
                      </span>
                      <span>Location: {item.location}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/student/complaints/${item.id}`}
                    className="group inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline shrink-0"
                  >
                    <span>View Timeline</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ease-out" />
                  </Link>
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
    submitted: { label: "Submitted", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-300" },
    assigned: { label: "Assigned", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-300" },
    in_progress: { label: "In Progress", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300" },
    resolved: { label: "Resolved (Action Required)", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-[#34D399]" },
    closed: { label: "Closed", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-300" },
    reopened: { label: "Reopened", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-300" },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; bg: string; text: string; pulse?: boolean }> = {
    low: { label: "Low", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-300" },
    medium: { label: "Medium", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-300" },
    high: { label: "High", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300" },
    critical: { label: "Critical (4h SLA)", bg: "bg-red-500/20 border-red-500/40", text: "text-red-300", pulse: true },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${
        config.pulse ? "animate-pulse shadow-sm shadow-red-500/50" : ""
      }`}
    >
      {config.label}
    </span>
  );
}
