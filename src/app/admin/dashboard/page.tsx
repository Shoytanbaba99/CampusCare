import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import MasterTableClient, { type MasterComplaintRow } from "./MasterTableClient";
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch admin user profile verification
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/student/dashboard");
  }

  // Fetch departments & staff list for modal selectors
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, code")
    .order("name");

  const { data: staffList } = await supabase
    .from("users")
    .select("id, full_name, department_id")
    .eq("role", "staff");

  // Fetch master complaints list with relational joins
  const { data: complaintsRaw } = await supabase
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
      department_id,
      assigned_staff_id,
      departments(name),
      categories(name),
      reporter:users!reporter_id(full_name),
      assigned_staff:users!assigned_staff_id(full_name)
    `)
    .order("created_at", { ascending: false });

  // Map raw relational joins to flat table rows
  const complaints: MasterComplaintRow[] = (complaintsRaw || []).map((item) => {
    const deptName = Array.isArray(item.departments)
      ? item.departments[0]?.name
      : (item.departments as { name: string } | null)?.name || "General";
    const catName = Array.isArray(item.categories)
      ? item.categories[0]?.name
      : (item.categories as { name: string } | null)?.name || "General";
    const rawReporter = Array.isArray(item.reporter)
      ? item.reporter[0]?.full_name
      : (item.reporter as { full_name: string } | null)?.full_name;
    const reporterName = item.is_anonymous ? "Anonymous Student" : (rawReporter || "Student User");
    const staffName = Array.isArray(item.assigned_staff)
      ? item.assigned_staff[0]?.full_name
      : (item.assigned_staff as { full_name: string } | null)?.full_name || null;

    return {
      id: item.id,
      ticket_number: item.ticket_number,
      title: item.title,
      location: item.location,
      priority: item.priority,
      status: item.status,
      is_anonymous: item.is_anonymous,
      created_at: item.created_at,
      sla_due_at: item.sla_due_at,
      department_id: item.department_id,
      assigned_staff_id: item.assigned_staff_id,
      department_name: deptName,
      category_name: catName,
      reporter_name: reporterName,
      assigned_staff_name: staffName,
    };
  });

  const now = new Date();
  const totalCount = complaints.length;
  const activeCount = complaints.filter(
    (c) => c.status === "submitted" || c.status === "assigned" || c.status === "in_progress" || c.status === "reopened"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved" || c.status === "closed").length;
  const overdueCount = complaints.filter(
    (c) => new Date(c.sla_due_at) < now && c.status !== "closed" && c.status !== "resolved"
  ).length;
  const slaComplianceRate = totalCount > 0 ? Math.round(((totalCount - overdueCount) / totalCount) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#ECFDF5] font-display">
          Admin Command Dashboard & Telemetry
        </h1>
        <p className="text-xs text-[#A7F3D0]/80">
          System-wide operational KPIs, target repair compliance, and master ticket dispatch controls.
        </p>
      </div>

      {/* Operational KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="care-panel care-panel-hover rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Campus Tickets</span>
            <FileText className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{totalCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">{activeCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Rate</span>
            <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#34D399] font-display">{resolvedCount}</p>
        </div>

        <div className="care-panel care-panel-hover rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#A7F3D0]/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Repair Compliance</span>
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-[#34D399] font-display">{slaComplianceRate}%</p>
        </div>
      </div>

      {/* Master Data Table */}
      <MasterTableClient
        complaints={complaints}
        departments={departments || []}
        staffList={staffList || []}
      />
    </div>
  );
}
