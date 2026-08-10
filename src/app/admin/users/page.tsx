import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import UserManagementClient, {
  type UserDirectoryRow,
} from "./UserManagementClient";

export default async function AdminUserManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Admin RBAC verification
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/student/dashboard");
  }

  // Fetch all departments
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, code")
    .order("name");

  // Fetch all registered users with departmental join
  const { data: usersRaw } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      role,
      department_id,
      created_at,
      departments(name)
    `)
    .order("created_at", { ascending: false });

  const users: UserDirectoryRow[] = (usersRaw || []).map((u) => {
    const deptName = Array.isArray(u.departments)
      ? u.departments[0]?.name
      : (u.departments as { name: string } | null)?.name || null;

    return {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      department_id: u.department_id,
      department_name: deptName,
      created_at: u.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F0F6FC] font-display">
          User Directory & Staff Promotion Desk
        </h1>
        <p className="text-xs text-[#8B949E]">
          Manage user permissions, promote registered students to staff resolvers, and assign service departments.
        </p>
      </div>

      <UserManagementClient
        users={users}
        departments={departments || []}
      />
    </div>
  );
}
