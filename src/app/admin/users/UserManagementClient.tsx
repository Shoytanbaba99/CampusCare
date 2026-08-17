"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { updateUserRoleAction, createDepartmentAction } from "./actions";
import { createClient } from "@/utils/supabase/client";
import {
  Users,
  Search,
  UserCheck,
  Wrench,
  Shield,
  Building2,
  X,
  Check,
  Sparkles,
  Plus,
} from "lucide-react";

export interface UserDirectoryRow {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "staff" | "admin";
  department_id: string | null;
  department_name: string | null;
  created_at: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

interface UserManagementClientProps {
  users: UserDirectoryRow[];
  departments: DepartmentOption[];
}

export default function UserManagementClient({
  users,
  departments,
}: UserManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserDirectoryRow | null>(null);
  const [targetRole, setTargetRole] = useState<"student" | "staff" | "admin">("staff");
  const [targetDeptId, setTargetDeptId] = useState<string>(departments[0]?.id || "");

  // Create Department Modal state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");

  const [isPending, startTransition] = useTransition();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const searchLower = searchQuery.toLowerCase();
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openPromotionModal = (u: UserDirectoryRow) => {
    setSelectedUser(u);
    setTargetRole(u.role);
    setTargetDeptId(u.department_id || departments[0]?.id || "");
  };

  const handleRoleUpdate = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const res = await updateUserRoleAction(
        selectedUser.id,
        targetRole,
        targetRole === "staff" ? targetDeptId : undefined
      );

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Updated permissions for ${selectedUser.full_name}`);
        setSelectedUser(null);
      }
    });
  };

  const handleCreateDepartment = () => {
    if (!newDeptName.trim() || !newDeptCode.trim()) {
      toast.error("Please enter a department name and short code.");
      return;
    }

    startTransition(async () => {
      const res = await createDepartmentAction(newDeptName, newDeptCode);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Created department: ${newDeptName} (${newDeptCode.toUpperCase()})`);
        setIsDeptModalOpen(false);
        setNewDeptName("");
        setNewDeptCode("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A7F3D0]/70 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Create Department Button (WCAG AAA High Contrast Text) */}
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#042014] text-xs font-extrabold shadow-[0_8px_30px_rgb(16,185,129,0.08)] btn-care"
          >
            <Plus className="w-4 h-4 text-[#042014]" />
            <span>CREATE DEPARTMENT</span>
          </button>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["all", "student", "staff", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl border capitalize font-semibold btn-care active:scale-[0.98] transition-[opacity,transform,background-color,border-color] duration-200 ease-out ${
                  roleFilter === r
                    ? "bg-[#10B981] border-[#10B981] text-white font-bold"
                    : "bg-[#07130E] border-[#1D4A38] text-[#A7F3D0]/80 hover:border-[#10B981]"
                }`}
              >
                {r === "all" ? "All Users" : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Data Table */}
      <div className="care-panel rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(16,185,129,0.08)]">
        <div className="px-6 py-4 border-b border-[#1D4A38] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#ECFDF5]">
            <Users className="w-4 h-4 text-[#10B981]" />
            <span className="font-bold font-display text-sm">Registered User Directory</span>
          </div>
          <span className="text-[#A7F3D0]/80">
            TOTAL RECORDS: {filteredUsers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-[#07130E] border-b border-[#1D4A38] text-[#A7F3D0]/80 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Assigned Department</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D4A38]/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#153326] text-[#A7F3D0]">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[#ECFDF5] font-medium">No users found</p>
                        <p className="text-[#A7F3D0]/80">Try adjusting your search query or role filter.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#153326]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#ECFDF5] font-display">{u.full_name}</span>
                        <span className="text-[11px] text-[#A7F3D0]/70">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      {u.role === "admin" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#34D399] text-[11px] font-bold">
                          <Shield className="w-3 h-3" />
                          ADMIN
                        </span>
                      )}
                      {u.role === "staff" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                          <Wrench className="w-3 h-3" />
                          STAFF
                        </span>
                      )}
                      {u.role === "student" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold">
                          <UserCheck className="w-3 h-3" />
                          STUDENT
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#A7F3D0]/80">
                      {u.department_name ? (
                        <span className="text-[#ECFDF5] font-medium">{u.department_name}</span>
                      ) : (
                        <span className="text-[#A7F3D0]/40">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#A7F3D0]/80">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openPromotionModal(u)}
                        className="px-3 py-1 rounded-lg bg-[#153326] border border-[#1D4A38] text-[#10B981] text-[11px] font-bold hover:border-[#10B981] btn-care active:scale-[0.98] transition-[opacity,transform,background-color,border-color] duration-200 ease-out"
                      >
                        Manage Role
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-cascade">
          <div className="care-panel w-full max-w-md rounded-2xl p-7 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ease-out">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 text-[#A7F3D0]/70 hover:text-[#ECFDF5] btn-care"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>USER PERMISSION DESK</span>
              </div>
              <h3 className="text-xl font-bold text-[#ECFDF5] font-display">
                {selectedUser.full_name}
              </h3>
              <p className="text-xs text-[#A7F3D0]/80">{selectedUser.email}</p>
            </div>

            <div className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2 text-xs">
                <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">Target System Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["student", "staff", "admin"] as const).map((r) => {
                    const isSelfDemotion = selectedUser.id === currentUserId && r !== "admin";
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={isSelfDemotion}
                        onClick={() => setTargetRole(r)}
                        className={`py-2.5 px-3 rounded-xl border capitalize font-bold btn-care active:scale-[0.98] transition-[opacity,transform,background-color,border-color] duration-200 ease-out ${
                          targetRole === r
                            ? "bg-[#10B981] border-[#10B981] text-white"
                            : "bg-[#07130E] border-[#1D4A38] text-[#A7F3D0]/80"
                        } ${isSelfDemotion ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department Assignment (Mandatory for Staff) */}
              {targetRole === "staff" && (
                <div className="space-y-2 text-xs">
                  <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">
                    Assigned Service Department *
                  </label>
                  <div className="relative">
                    <select
                      value={targetDeptId}
                      onChange={(e) => setTargetDeptId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] appearance-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#0E2219]">
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                    <Building2 className="w-4 h-4 text-[#10B981] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 rounded-xl bg-[#07130E] border border-[#1D4A38] text-[#A7F3D0]/80 hover:text-[#ECFDF5] btn-care font-semibold active:scale-[0.98] transition-transform duration-150 ease-out"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleRoleUpdate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
              >
                <Check className="w-4 h-4" />
                <span>SAVE PERMISSIONS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-cascade">
          <div className="care-panel w-full max-w-md rounded-2xl p-7 space-y-6 shadow-[0_8px_30px_rgb(16,185,129,0.08)] relative animate-in fade-in zoom-in-95 duration-200 ease-out">
            <button
              onClick={() => setIsDeptModalOpen(false)}
              className="absolute top-5 right-5 text-[#A7F3D0]/70 hover:text-[#ECFDF5] btn-care"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>NEW DEPARTMENT KIOSK</span>
              </div>
              <h3 className="text-xl font-bold text-[#ECFDF5] font-display">
                Create Service Department
              </h3>
              <p className="text-xs text-[#A7F3D0]/80">
                Add a new campus facilities division for staff assignments and complaint routing.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">Department Name *</label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. HVAC Maintenance"
                  className="w-full px-4 py-3 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[#A7F3D0]/80 font-bold uppercase tracking-wider">Short Code *</label>
                <input
                  type="text"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="e.g. HVAC"
                  className="w-full px-4 py-3 bg-[#07130E] border border-[#1D4A38] rounded-xl text-xs text-[#ECFDF5] placeholder-[#A7F3D0]/40 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#07130E] border border-[#1D4A38] text-[#A7F3D0]/80 hover:text-[#ECFDF5] btn-care font-semibold active:scale-[0.98] transition-transform duration-150 ease-out"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCreateDepartment}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-md shadow-emerald-500/20 btn-care disabled:opacity-50 active:scale-[0.98] transition-transform duration-150 ease-out"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE DEPARTMENT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
