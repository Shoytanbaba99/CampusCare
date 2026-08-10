import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";
import { HeartHandshake, LayoutDashboard, PlusCircle, LogOut } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#07130E] text-[#ECFDF5] selection:bg-[#10B981] selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#0E2219]/90 backdrop-blur-md border-b border-[#1D4A38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Branding */}
            <div className="flex items-center gap-3">
              <Link href="/student/dashboard" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-md shadow-emerald-500/20">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-tight text-lg text-[#ECFDF5] font-display">
                  Campus<span className="text-[#10B981]">Care</span>
                </span>
              </Link>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#34D399]">
                Student Portal
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#A7F3D0] hover:text-[#ECFDF5] hover:bg-[#153326] transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-[#10B981]" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/student/complaints/new"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#10B981] hover:bg-[#059669] text-white shadow-md shadow-emerald-500/20 btn-care"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Complaint</span>
              </Link>

              {/* Logout Button */}
              <form action={logoutAction} className="ml-2">
                <button
                  type="submit"
                  title="Sign Out"
                  className="flex items-center justify-center p-2 rounded-lg text-[#A7F3D0] hover:text-red-300 hover:bg-red-500/10 transition-all btn-care"
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
