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

      <div className="care-panel rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#1D4A38] flex items-center justify-between text-xs">
          <h2 className="font-bold text-base text-[#ECFDF5] font-display">Audit Event History</h2>
          <span className="text-[#A7F3D0]/80">Showing last 100 system events</span>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-400 text-sm">
            Failed to load audit logs. Please refresh the page.
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A7F3D0]/70">
            No audit log events recorded yet.
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

                  {/* JSON State Diff View */}
                  {(log.old_state || log.new_state) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                      {log.old_state && (
                        <div className="p-3 bg-[#07130E] rounded-xl border border-[#1D4A38] space-y-1">
                          <span className="text-[#A7F3D0]/80 font-bold uppercase flex items-center gap-1">
                            <FileCode className="w-3 h-3 text-red-400" />
                            Previous State (JSON)
                          </span>
                          <pre className="text-red-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.old_state, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.new_state && (
                        <div className="p-3 bg-[#07130E] rounded-xl border border-[#1D4A38] space-y-1">
                          <span className="text-[#A7F3D0]/80 font-bold uppercase flex items-center gap-1">
                            <FileCode className="w-3 h-3 text-[#34D399]" />
                            New State (JSON)
                          </span>
                          <pre className="text-[#34D399] font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.new_state, null, 2)}
                          </pre>
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
