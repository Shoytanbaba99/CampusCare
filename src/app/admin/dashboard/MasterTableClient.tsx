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
  MessageSquare,
} from "lucide-react";
import FloatingLiveChat from "@/components/FloatingLiveChat";

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
  is_anonymous?: boolean;
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
  currentAdminName?: string;
  activeChatIds?: string[];
}

export default function MasterTableClient({
  complaints,
  departments,
  staffList,
  currentAdminName = "System Administrator",
  activeChatIds = [],
}: MasterTableClientProps) {
  "use no memo";

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<MasterComplaintRow | null>(null);
  const [selectedChatTicket, setSelectedChatTicket] = useState<MasterComplaintRow | null>(null);

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
          <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#34D399]">
            {row.original.ticket_number}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title & Location",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-[#ECFDF5] line-clamp-1 font-display">{row.original.title}</p>
            <p className="text-[11px] text-[#A7F3D0]/70">{row.original.location}</p>
          </div>
        ),
      },
      {
        accessorKey: "department_name",
        header: "Department",
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-medium text-[#ECFDF5]">{row.original.department_name}</p>
            <p className="text-[11px] text-[#A7F3D0]/70">{row.original.category_name}</p>
          </div>
        ),
      },
      {
        accessorKey: "reporter_name",
        header: "Reporter",
        cell: ({ row }) => (
          <span className="text-xs text-[#A7F3D0]">
            {row.original.is_anonymous ? "Anonymous Student" : row.original.reporter_name}
          </span>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "assigned_staff_name",
        header: "Assigned Staff",
        cell: ({ row }) => (
          <span className="text-xs text-[#A7F3D0]">
            {row.original.assigned_staff_name || "Unassigned"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const hasActiveChat = activeChatIds.includes(row.original.id);
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedTicket(row.original)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#153326] text-[#10B981] hover:border-[#10B981] border border-[#1D4A38] btn-care active:scale-[0.98] transition-transform duration-150 ease-out"
              >
                Re-assign
              </button>
              <button
                onClick={() => setSelectedChatTicket(row.original)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border btn-care active:scale-[0.98] transition-all duration-150 ease-out flex items-center gap-1 ${
                  hasActiveChat
                    ? "bg-[#10B981] text-[#042014] border-[#10B981] animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)] font-extrabold"
                    : "bg-[#10B981]/15 text-[#34D399] hover:bg-[#10B981] hover:text-[#042014] border-[#10B981]/30"
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>{hasActiveChat ? "💬 Active Chat" : "Chat"}</span>
              </button>
            </div>
          );
        },
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls Toolbar */}
      <div className="care-panel rounded-2xl p-4 sm:p-6 space-y-3 font-sans text-xs shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Global Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#A7F3D0]/70 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search title, ticket #..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="reopened">Reopened</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical (4h SLA)</option>
            <option value="high">High (24h SLA)</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* TanStack Master Data Table */}
      <div className="care-panel rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-[#07130E] border-b border-[#1D4A38] text-[#A7F3D0]/80 uppercase tracking-wider text-[11px]">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3.5 px-4 font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#1D4A38]/60">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#153326] text-[#A7F3D0]">
                        <Search className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[#ECFDF5] font-medium">No matching tickets found</p>
                        <p className="text-[#A7F3D0]/80">Adjust your search or filter criteria to see more results.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#153326]/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4">
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
        <div className="px-6 py-4 border-t border-[#1D4A38] flex items-center justify-between text-xs text-[#A7F3D0]/80">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-[#1D4A38] bg-[#07130E] text-[#A7F3D0] hover:text-[#ECFDF5] disabled:opacity-40 btn-care active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-[#1D4A38] bg-[#07130E] text-[#A7F3D0] hover:text-[#ECFDF5] disabled:opacity-40 btn-care active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reassign Ticket Modal */}
      {selectedTicket && (
        <ReassignModal
          ticket={selectedTicket}
          departments={departments}
          staffList={staffList}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {selectedChatTicket && (
        <FloatingLiveChat
          complaintId={selectedChatTicket.id}
          userRole="admin"
          userName={currentAdminName}
          ticketContext={{
            ticketNumber: selectedChatTicket.ticket_number,
            title: selectedChatTicket.title,
            departmentName: selectedChatTicket.department_name,
            categoryName: selectedChatTicket.category_name,
            location: selectedChatTicket.location,
            priority: selectedChatTicket.priority,
            status: selectedChatTicket.status,
            slaDueAt: selectedChatTicket.sla_due_at,
            reporterName: selectedChatTicket.is_anonymous ? "Anonymous Student" : selectedChatTicket.reporter_name,
            isAnonymous: selectedChatTicket.is_anonymous,
          }}
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
  const [targetDeptId, setTargetDeptId] = useState(ticket.department_id);
  const [targetStaffId, setTargetStaffId] = useState(ticket.assigned_staff_id || "");
  const [state, formAction, isPending] = useActionState(reassignTicketAction, null);

  // Filter staff by selected department
  const filteredStaff = staffList.filter(
    (s) => !s.department_id || s.department_id === targetDeptId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-cascade">
      <div className="care-panel w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-200 ease-out">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A7F3D0]/70 hover:text-[#ECFDF5] btn-care"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
            ADMIN TICKET DISPATCH
          </span>
          <h3 className="text-lg font-bold text-[#ECFDF5] font-display">{ticket.title}</h3>
          <p className="text-xs text-[#A7F3D0]/80">Ticket #{ticket.ticket_number}</p>
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4 font-sans">
          <input type="hidden" name="complaintId" value={ticket.id} />

          {/* Department Selection */}
          <div className="space-y-1.5">
            <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">
              Re-assign Department *
            </label>
            <select
              name="departmentId"
              value={targetDeptId}
              onChange={(e) => {
                setTargetDeptId(e.target.value);
                setTargetStaffId("");
              }}
              className="w-full px-3.5 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Staff Selection */}
          <div className="space-y-1.5">
            <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">
              Assigned Staff Resolver
            </label>
            <select
              name="staffId"
              value={targetStaffId}
              onChange={(e) => setTargetStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
            >
              <option value="">Unassigned (Department Pool)</option>
              {filteredStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">
              Dispatch Audit Note
            </label>
            <input
              type="text"
              name="note"
              placeholder="Reason for ticket re-assignment..."
              className="w-full px-3.5 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#07130E] border border-[#1D4A38] text-[#A7F3D0]/80 hover:text-[#ECFDF5] btn-care active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
            >
              <Send className="w-3.5 h-3.5" />
              <span>CONFIRM DISPATCH</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: "Submitted", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-300" },
  assigned: { label: "Assigned", bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-300" },
  in_progress: { label: "In Progress", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300" },
  resolved: { label: "Resolved", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-[#34D399]" },
  closed: { label: "Closed", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-300" },
  reopened: { label: "Reopened", bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-300" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  low: { label: "Low", bg: "bg-slate-500/10 border-slate-500/20", text: "text-slate-300" },
  medium: { label: "Medium", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-300" },
  high: { label: "High", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-300" },
  critical: { label: "Critical", bg: "bg-red-500/20 border-red-500/40", text: "text-red-300" },
};

function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
