import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { History, User, Clock, FileCode } from "lucide-react";

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify admin authorization
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/student/dashboard");
  }

  // Fetch audit logs with actor user names
  const { data: auditLogs, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      action,
      old_state,
      new_state,
      created_at,
      actor:users!audit_logs_actor_id_fkey(full_name, role)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch users, departments & categories for human-readable lookup of UUID fields
  const { data: usersList } = await supabase.from("users").select("id, full_name");
  const { data: deptsList } = await supabase.from("departments").select("id, name");
  const { data: catsList } = await supabase.from("categories").select("id, name");

  const userMap = new Map((usersList || []).map((u) => [u.id, u.full_name]));
  const deptMap = new Map((deptsList || []).map((d) => [d.id, d.name]));
  const catMap = new Map((catsList || []).map((c) => [c.id, c.name]));

  const formatKeyLabel = (key: string) => {
    const keyMap: Record<string, string> = {
      assigned_staff_id: "Assigned Staff",
      department_id: "Department",
      reporter_id: "Reporter Student",
      category_id: "Issue Category",
      sla_due_at: "SLA Target Date",
      status: "Ticket Status",
      priority: "Priority Level",
      location: "Location Details",
    };
    return keyMap[key] || key.replace(/_/g, " ");
  };

  const formatValueLabel = (key: string, val: unknown) => {
    if (val === null || val === undefined || val === "") return "Unassigned / None";
    const strVal = String(val);

    // Format raw status/priority enums cleanly
    if (key === "status") {
      const statusPrettyMap: Record<string, string> = {
        submitted: "Submitted",
        assigned: "Assigned to Staff",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed",
      };
      return statusPrettyMap[strVal] || strVal.replace(/_/g, " ");
    }

    if (key === "priority") {
      return strVal.charAt(0).toUpperCase() + strVal.slice(1);
    }

    if (key === "assigned_staff_id" || key.includes("staff") || key.includes("reporter")) {
      return userMap.get(strVal) || strVal;
    }
    if (key === "department_id" || key.includes("department")) {
      return deptMap.get(strVal) || strVal;
    }
    if (key === "category_id" || key.includes("category")) {
      return catMap.get(strVal) || strVal;
    }
    if (userMap.has(strVal)) {
      return userMap.get(strVal)!;
    }
    if (deptMap.has(strVal)) {
      return deptMap.get(strVal)!;
    }
    if (catMap.has(strVal)) {
      return catMap.get(strVal)!;
    }
    return typeof val === "object" ? JSON.stringify(val) : strVal;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#ECFDF5] font-display">
            Immutable Audit Log Ledger
          </h1>
        </div>
        <p className="text-xs text-[#A7F3D0]/80 mt-1">
          Read-only system audit trail tracking state changes, ticket re-assignments, and user actions.
        </p>
      </div>

      <div className="care-panel rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
        <div className="px-6 py-4 border-b border-[#1D4A38] flex items-center justify-between text-xs">
          <h2 className="font-bold text-base text-[#ECFDF5] font-display">Audit Event History</h2>
          <span className="text-[#A7F3D0]/80">Showing last 100 system events</span>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-400 text-sm">
            Failed to load audit logs. Please refresh the page.
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#153326] text-[#A7F3D0]">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-[#ECFDF5] font-display">No events recorded</h3>
              <p className="text-xs text-[#A7F3D0]/80 max-w-sm mx-auto">
                The audit ledger is currently empty. Future system actions and assignments will be logged here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1D4A38]">
            {auditLogs.map((log) => {
              const actorName = Array.isArray(log.actor)
                ? log.actor[0]?.full_name
                : (log.actor as { full_name: string; role: string } | null)?.full_name || "System";
              const actorRole = Array.isArray(log.actor)
                ? log.actor[0]?.role
                : (log.actor as { full_name: string; role: string } | null)?.role || "system";

              return (
                <div key={log.id} className="p-5 space-y-3 hover:bg-[#153326]/40 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#34D399] border border-emerald-500/20">
                        {log.action}
                      </span>
                      <span className="text-[#A7F3D0]/80 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#10B981]" />
                        Actor: <strong className="text-[#ECFDF5] font-display">{actorName}</strong> ({actorRole.toUpperCase()})
                      </span>
                    </div>

                    <span className="text-[#A7F3D0]/80 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Formatted State Changes View */}
                  {(log.old_state || log.new_state) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      {log.old_state && typeof log.old_state === "object" && (
                        <div className="p-3.5 bg-[#07130E] rounded-xl border border-[#1D4A38] space-y-2">
                          <span className="text-[#A7F3D0]/80 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-red-400" />
                            Previous State
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(log.old_state as Record<string, unknown>).map(([k, v]) => (
                              <span key={k} className="px-2.5 py-1 bg-[#0E2219] border border-red-500/20 rounded-lg text-xs flex items-center gap-1.5 font-sans">
                                <span className="text-red-300/80 font-medium capitalize">{formatKeyLabel(k)}:</span>
                                <strong className="text-red-200 font-bold">{formatValueLabel(k, v)}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.new_state && typeof log.new_state === "object" && (
                        <div className="p-3.5 bg-[#07130E] rounded-xl border border-[#1D4A38] space-y-2">
                          <span className="text-[#A7F3D0]/80 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-[#34D399]" />
                            Updated State
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(log.new_state as Record<string, unknown>).map(([k, v]) => (
                              <span key={k} className="px-2.5 py-1 bg-[#0E2219] border border-emerald-500/20 rounded-lg text-xs flex items-center gap-1.5 font-sans">
                                <span className="text-[#A7F3D0]/80 font-medium capitalize">{formatKeyLabel(k)}:</span>
                                <strong className="text-[#34D399] font-bold">{formatValueLabel(k, v)}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
