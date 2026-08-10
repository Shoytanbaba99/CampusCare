/* eslint-disable react-hooks/incompatible-library */
"use client";
"use no memo";

import { useState, useMemo, useActionState } from "react";
import { reassignTicketAction } from "../actions";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

export interface MasterComplaintRow {
  id: string;
  ticket_number: string;
  title: string;
  location: string;
  priority: string;
  status: string;
  created_at: string;
  sla_due_at: string;
  department_id: string;
  assigned_staff_id: string | null;
  department_name: string;
  category_name: string;
  reporter_name: string;
  assigned_staff_name: string | null;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface StaffUser {
  id: string;
  full_name: string;
  department_id: string | null;
}

interface MasterTableClientProps {
  complaints: MasterComplaintRow[];
  departments: Department[];
  staffList: StaffUser[];
}

export default function MasterTableClient({
  complaints,
  departments,
  staffList,
}: MasterTableClientProps) {
  "use no memo";

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<MasterComplaintRow | null>(null);

  // Filter complaints list based on dropdown selectors
  const filteredData = useMemo(() => {
    return complaints.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (priorityFilter !== "all" && item.priority !== priorityFilter) return false;
      if (deptFilter !== "all" && item.department_id !== deptFilter) return false;
      return true;
    });
  }, [complaints, statusFilter, priorityFilter, deptFilter]);

  // Define TanStack Table columns
  const columns = useMemo<ColumnDef<MasterComplaintRow>[]>(
    () => [
      {
        accessorKey: "ticket_number",
        header: "Ticket ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#1F2937] text-[#6366F1]">
            {row.original.ticket_number}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title & Location",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[#F9FAFB] line-clamp-1">{row.original.title}</p>
            <p className="text-xs text-[#9CA3AF]">{row.original.location}</p>
          </div>
        ),
      },
      {
        accessorKey: "department_name",
        header: "Department",
        cell: ({ row }) => (
          <div>
            <p className="text-xs font-medium text-[#F9FAFB]">{row.original.department_name}</p>
            <p className="text-[10px] text-[#9CA3AF]">{row.original.category_name}</p>
          </div>
        ),
      },
      {
        accessorKey: "reporter_name",
        header: "Reporter",
        cell: ({ row }) => <span className="text-xs text-[#F9FAFB]">{row.original.reporter_name}</span>,
      },
      {
        accessorKey: "assigned_staff_name",
        header: "Assigned Staff",
        cell: ({ row }) => (
          <span className="text-xs text-[#9CA3AF]">
            {row.original.assigned_staff_name || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority & SLA",
        cell: ({ row }) => {
          const isCritical = row.original.priority === "critical";
          const isOverdue =
            new Date(row.original.sla_due_at) < new Date() &&
            row.original.status !== "closed" &&
            row.original.status !== "resolved";

          return (
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${
                  isCritical
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}
              >
                {row.original.priority}
              </span>
              {isOverdue && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-400">
                  OVERDUE
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Dispatch Action",
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedTicket(row.original)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white transition-all"
          >
            Reassign
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Controls & Filters Bar */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Text Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search ticket ID, title, student..."
              className="w-full pl-9 pr-4 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (Unassigned)</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical (4h SLA Pulse)</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TanStack Table Render */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#090D16] text-[#9CA3AF] uppercase tracking-wider font-semibold border-b border-[#1F2937]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-4 font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-[#9CA3AF]">
                    No matching complaint records found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#1F2937]/50 transition-all">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3 border-t border-[#1F2937] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg bg-[#090D16] border border-[#1F2937] disabled:opacity-40 hover:text-[#F9FAFB]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg bg-[#090D16] border border-[#1F2937] disabled:opacity-40 hover:text-[#F9FAFB]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {selectedTicket && (
        <ReassignModal
          ticket={selectedTicket}
          departments={departments}
          staffList={staffList}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

function ReassignModal({
  ticket,
  departments,
  staffList,
  onClose,
}: {
  ticket: MasterComplaintRow;
  departments: Department[];
  staffList: StaffUser[];
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(reassignTicketAction, null);
  const [targetDept, setTargetDept] = useState(ticket.department_id);

  const filteredStaff = staffList.filter(
    (s) => !s.department_id || s.department_id === targetDept
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <h3 className="font-bold text-base text-[#F9FAFB]">
            Reassign Ticket #{ticket.ticket_number}
          </h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#F9FAFB]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="complaintId" value={ticket.id} />

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Target Department
            </label>
            <select
              name="targetDepartmentId"
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB]"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Assigned Staff Resolver
            </label>
            <select
              name="targetStaffId"
              defaultValue={ticket.assigned_staff_id || "unassigned"}
              className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB]"
            >
              <option value="unassigned">Unassigned (Pool Queue)</option>
              {filteredStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Priority Override
            </label>
            <select
              name="priority"
              defaultValue={ticket.priority}
              className="w-full px-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-lg text-xs text-[#F9FAFB]"
            >
              <option value="low">Low (7 Days SLA)</option>
              <option value="medium">Medium (3 Days SLA)</option>
              <option value="high">High (24h SLA)</option>
              <option value="critical">Critical (4h SLA Pulse)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-[#9CA3AF] hover:text-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366F1] text-white text-xs font-medium hover:bg-[#6366F1]/90 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPending ? "Reassigning..." : "Confirm Reassign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    submitted: { label: "Submitted", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    assigned: { label: "Assigned", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-400" },
    in_progress: { label: "In Progress", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    resolved: { label: "Resolved", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
    closed: { label: "Closed", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-400" },
    reopened: { label: "Reopened", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-400" },
  };

  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
