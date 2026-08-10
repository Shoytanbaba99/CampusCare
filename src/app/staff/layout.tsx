import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { LayoutDashboard, LogOut, Wrench } from "lucide-react";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#090D16] text-[#F9FAFB]">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#111827]/80 backdrop-blur-md border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Branding */}
            <div className="flex items-center gap-3">
              <Link href="/staff/dashboard" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-tight text-lg text-[#F9FAFB]">
                  CampusCare
                </span>
              </Link>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Staff Resolver Portal
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/staff/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Department Queue</span>
              </Link>

              {/* Logout Button */}
              <form action={logoutAction} className="ml-2">
                <button
                  type="submit"
                  title="Sign Out"
                  className="flex items-center justify-center p-2 rounded-lg text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
