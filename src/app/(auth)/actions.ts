"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export async function loginAction(prevState: unknown, formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input." };
  }

  const { email, password } = validated.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed: User not found." };
  }

  // Fetch authoritative role from public.users table
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const userRole = profile?.role || (data.user?.user_metadata?.role as string) || "student";
  const targetDashboard =
    userRole === "admin"
      ? "/admin/dashboard"
      : userRole === "staff"
        ? "/staff/dashboard"
        : "/student/dashboard";

  redirect(targetDashboard);
}

export async function signupAction(prevState: unknown, formData: FormData) {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = signupSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input." };
  }

  const { fullName, email, password } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "student",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/student/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
