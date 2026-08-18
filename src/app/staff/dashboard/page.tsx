import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getActiveChatComplaintIds } from "@/lib/chatStore";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Building2,
  Calendar,
  User,
} from "lucide-react";

export default async function StaffDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch staff user profile to get their assigned department
  const { data: profile } = await supabase
    .from("users")
    .select("role, department_id, departments(name)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "staff" && profile?.role !== "admin") {
    redirect("/student/dashboard");
  }

  const deptName = Array.isArray(profile?.departments)
    ? profile.departments[0]?.name
    : (profile?.departments as { name: string } | null)?.name || "All Departments";

  // Fetch complaints assigned to this staff member or their department
  let query = supabase
    .from("complaints")
    .select(`
      id,
      ticket_number,
      title,
      location,
      priority,
      status,
      is_anonymous,
      created_at,
      sla_due_at,
      departments(name),
      categories(name),
      reporter:users!reporter_id(full_name)
    `)
    .order("created_at", { ascending: false });

  if (profile.role === "staff" && profile.department_id) {
    query = query.eq("department_id", profile.department_id);
  }

  const { data: complaints, error } = await query;
  const activeChatIds = await getActiveChatComplaintIds();

  const now = new Date();
  const totalCount = complaints?.length || 0;
  const pendingCount =
    complaints?.filter(
      (c) => c.status === "submitted" || c.status === "assigned" || c.status === "in_progress" || c.status === "reopened"
    ).length || 0;
  const resolvedCount =
    complaints?.filter((c) => c.status === "resolved" || c.status === "closed").length || 0;
  const overdueCount =
    complaints?.filter(
      (c) => new Date(c.sla_due_at) < now && c.status !== "closed" && c.status !== "resolved"
    ).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#ECFDF5] font-display">
            Staff Resolver Queue
          </h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#34D399]">
            {deptName}
          </span>
        </div>
        <p className="text-xs text-[#A7F3D0]/80 mt-1">
          Manage repair tickets assigned to your department, update fix status, and track target repair timelines.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Total</span>
            <Wrench className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{totalCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Work</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{pendingCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{resolvedCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-6 sm:p-8 space-y-2 shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue SLA</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-red-400 font-display">{overdueCount}</p>
        </div>
      </div>

      {/* Main Table / List */}
      <div className="care-panel rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
        <div className="p-6 sm:p-8 border-b border-[#1D4A38] bg-[#0E2219]/60">
          <h2 className="text-base font-bold text-[#ECFDF5] font-display">
            Assigned Complaints Queue
          </h2>
          <p className="text-xs text-[#A7F3D0]/80 mt-0.5">
            Click any ticket to update progress status, add work logs, or mark as resolved.
          </p>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-400 text-sm">
            Failed to load department complaints. Please refresh.
          </div>
        ) : !complaints || complaints.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#153326] text-[#A7F3D0]">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-[#ECFDF5] font-display">No tickets assigned yet</h3>
              <p className="text-xs text-[#A7F3D0]/80 max-w-sm mx-auto">
                Your queue is currently clear. Any new maintenance requests routed to your department will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1D4A38]">
            {complaints.map((item) => {
              const rawName = Array.isArray(item.reporter)
                ? item.reporter[0]?.full_name
                : (item.reporter as { full_name: string } | null)?.full_name;
              const reporterName = item.is_anonymous ? "Anonymous Student" : (rawName || "Student User");
              const isOverdue =
                new Date(item.sla_due_at) < now && item.status !== "closed" && item.status !== "resolved";

              return (
                <div
                  key={item.id}
                  className={`p-6 sm:p-8 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOverdue ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-[#153326]/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#34D399]">
                        {item.ticket_number}
                      </span>
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                      {activeChatIds.includes(item.id) && (
                        <span className="px-2 py-0.5 text-xs font-extrabold rounded bg-[#10B981] text-[#042014] animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                          💬 ACTIVE CHAT
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                          OVERDUE SLA
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-base text-[#ECFDF5] font-display">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#A7F3D0]/80">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#10B981]" />
                        Reporter: {reporterName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
                        Location: {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                        Fix Target: {new Date(item.sla_due_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/staff/complaints/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:underline shrink-0"
                  >
                    <span>Update Status & Logs</span>
                    <ChevronRight className="w-4 h-4" />
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
    resolved: { label: "Resolved", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-[#34D399]" },
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
  const priorityConfig: Record<string, { label: string; bg: string; text: string }> = {
    low: { label: "Low", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-300" },
    medium: { label: "Medium", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-300" },
    high: { label: "High", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300" },
    critical: { label: "Critical", bg: "bg-red-500/20 border-red-500/40", text: "text-red-300" },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
