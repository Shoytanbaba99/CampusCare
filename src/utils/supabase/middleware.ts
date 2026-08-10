import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ROUTE PROTECTION GUARD (RBAC):
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/student");

  // 1. Unauthenticated users -> redirect to /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users -> enforce role boundaries & redirect away from auth pages
  if (user) {
    const userRole = (user.user_metadata?.role as string) || "student";

    if (isAuthRoute) {
      const redirectPath =
        userRole === "admin"
          ? "/admin/dashboard"
          : userRole === "staff"
          ? "/staff/dashboard"
          : "/student/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/staff") && userRole !== "staff" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}
