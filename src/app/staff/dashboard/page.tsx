import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  Wrench,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Building2,
  ChevronRight,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default async function StaffDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch staff profile for department & role info
  const { data: profile } = await supabase
    .from("users")
    .select("id, role, department_id, full_name, departments(name, code)")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "staff";
  const deptId = profile?.department_id;
  const deptName = Array.isArray(profile?.departments)
    ? profile?.departments[0]?.name
    : (profile?.departments as unknown as { name: string } | null)?.name || "All Departments";

  // Build Complaints Query based on Department ID & Assigned Staff ID
  let query = supabase
    .from("complaints")
    .select(
      `
      id,
      ticket_number,
      title,
      location,
      priority,
      status,
      created_at,
      sla_due_at,
      assigned_staff_id,
      departments(name),
      categories(name),
      reporter:users!complaints_reporter_id_fkey(full_name)
    `,
    )
    .order("created_at", { ascending: false });

  if (userRole !== "admin" && deptId) {
    query = query.or(`department_id.eq.${deptId},assigned_staff_id.eq.${user.id}`);
  }

  const { data: complaints, error } = await query;

  const now = new Date();
  const queueList = complaints || [];

  const totalDeptCount = queueList.length;
  const assignedToMeCount = queueList.filter((c) => c.assigned_staff_id === user.id).length;
  const criticalSlaCount = queueList.filter(
    (c) => c.priority === "critical" && c.status !== "closed",
  ).length;
  const overdueCount = queueList.filter(
    (c) => new Date(c.sla_due_at) < now && c.status !== "closed" && c.status !== "resolved",
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
              Department Maintenance Queue
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {deptName}
            </span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Accept assigned complaints, track SLA deadlines, and submit repair completion updates.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Department Queue</span>
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#F9FAFB]">{totalDeptCount}</p>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned to Me</span>
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#F9FAFB]">{assignedToMeCount}</p>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Critical (4h SLA)
            </span>
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-red-400">{criticalSlaCount}</p>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Breaches</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-amber-400">{overdueCount}</p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between">
          <h2 className="font-semibold text-base text-[#F9FAFB]">Active Complaints Queue</h2>
          <span className="text-xs text-[#9CA3AF]">{queueList.length} tickets in queue</span>
        </div>

        {error && (
          <div className="p-6 text-center text-red-400 text-sm">
            Failed to load department queue. Please refresh the page.
          </div>
        )}

        {queueList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1F2937] text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-[#F9FAFB]">Department Queue Clear!</h3>
            <p className="text-xs text-[#9CA3AF]">
              There are currently no active complaints assigned to your department.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1F2937]">
            {queueList.map((item) => {
              const reporterName = Array.isArray(item.reporter)
                ? item.reporter[0]?.full_name
                : (item.reporter as { full_name: string } | null)?.full_name || "Student";
              const catName = Array.isArray(item.categories)
                ? item.categories[0]?.name
                : (item.categories as { name: string } | null)?.name || "General";

              const isOverdue =
                new Date(item.sla_due_at) < now &&
                item.status !== "closed" &&
                item.status !== "resolved";

              return (
                <div
                  key={item.id}
                  className={`p-5 hover:bg-[#1F2937]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOverdue ? "border-l-4 border-amber-500 bg-amber-500/5" : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#1F2937] text-[#6366F1]">
                        {item.ticket_number}
                      </span>
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                      {isOverdue && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-base text-[#F9FAFB]">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#9CA3AF]">
                      <span>
                        Reporter: <strong className="text-[#F9FAFB]">{reporterName}</strong>
                      </span>
                      <span>Category: {catName}</span>
                      <span>Location: {item.location}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        SLA Due:{" "}
                        {new Date(item.sla_due_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({new Date(item.sla_due_at).toLocaleDateString()})
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/staff/complaints/${item.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs font-medium transition-all shrink-0"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Manage Ticket</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
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
    submitted: {
      label: "Unassigned",
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
      label: "Resolved",
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
