import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ComplaintFormClient from "./ComplaintFormClient";

export default async function NewComplaintPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all departments & categories for dropdown selection
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, code")
    .order("name");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, department_id")
    .order("name");

  return (
    <ComplaintFormClient
      departments={departments || []}
      categories={categories || []}
    />
  );
}
