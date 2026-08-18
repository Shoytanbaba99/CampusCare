import Link from "next/link";
import Interactive3DHero from "@/components/Interactive3DHero";
import {
  HeartHandshake,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Users,
  Wrench,
  Building2,
  ChevronRight,
  Zap,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#07130E] text-[#ECFDF5] selection:bg-[#10B981] selection:text-black">
      {/* Background Emerald Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#0E2219]/90 backdrop-blur-md border-b border-[#1D4A38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-md shadow-emerald-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-xl text-[#ECFDF5] font-display">
                Campus<span className="text-[#10B981]">Care</span>
              </span>
            </div>

            <div className="flex items-center gap-3 font-sans text-xs" suppressHydrationWarning>
              <Link
                href="/track"
                suppressHydrationWarning
                className="px-3.5 py-2 rounded-xl text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 font-bold border border-[#10B981]/30 transition-all flex items-center gap-1.5"
              >
                <span>Track Ticket</span>
              </Link>
              <Link
                href="/login"
                suppressHydrationWarning
                className="px-4 py-2 rounded-xl text-[#A7F3D0] hover:text-[#ECFDF5] hover:bg-[#153326] font-semibold transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                suppressHydrationWarning
                className="px-4.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold shadow-md shadow-emerald-500/20 btn-care"
              >
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#34D399] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>CAMPUS FACILITY HELPDESK ONLINE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#ECFDF5] font-display leading-tight">
            Fast, Caring Campus Maintenance & Repair
          </h1>

          <p className="text-base sm:text-lg text-[#A7F3D0]/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Report classroom, lab, or hostel breakdowns, track repair deadlines in real time, and get issues resolved with zero hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-sm font-sans">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-base shadow-xl shadow-emerald-500/20 btn-care"
            >
              <span>Access Helpdesk Portal</span>
              <ArrowRight className="w-5 h-5 text-[#042014]" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0E2219] hover:bg-[#153326] border border-[#1D4A38] text-[#ECFDF5] font-semibold text-base btn-care"
            >
              <span>Register Student Account</span>
            </Link>
          </div>
        </div>

        {/* 3D Interactive Viewport Component */}
        <Interactive3DHero />
      </section>

      {/* Role Action Desks */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">
            Role-Based Action Desks
          </h2>
          <p className="text-sm text-[#A7F3D0]/80">
            Select your portal desk to submit tickets, resolve repairs, or manage campus operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Kiosk */}
          <div className="relative p-7 rounded-2xl care-panel care-panel-hover space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#ECFDF5] font-display">Student Intake Kiosk</h3>
              <p className="text-xs text-[#A7F3D0]/80 leading-relaxed">
                Report classroom or hostel issues, attach photo proof, and confirm resolved repairs.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-[#10B981] font-bold after:absolute after:inset-0"
            >
              <span>Access Student Kiosk</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Staff Resolver Queue */}
          <div className="relative p-7 rounded-2xl care-panel care-panel-hover space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#ECFDF5] font-display">Staff Resolver Desk</h3>
              <p className="text-xs text-[#A7F3D0]/80 leading-relaxed">
                Departmental repair queues (Electrical, IT, Plumbing, Facilities), overdue alerts, and work logs.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold after:absolute after:inset-0"
            >
              <span>Open Work Queue</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Admin Dispatch Switchboard */}
          <div className="relative p-7 rounded-2xl care-panel care-panel-hover space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#ECFDF5] font-display">Admin Master Switchboard</h3>
              <p className="text-xs text-[#A7F3D0]/80 leading-relaxed">
                Re-assign tickets, manage staff department roles, create divisions, and inspect audit logs.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-[#10B981] font-bold after:absolute after:inset-0"
            >
              <span>Enter Switchboard</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Target Repair Deadline Breakdown */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1D4A38] space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#34D399] text-xs font-semibold">
              <Zap className="w-4 h-4" />
              <span>GUARANTEED REPAIR DEADLINES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ECFDF5] font-display">
              Strict Priority Repair Timelines
            </h2>

            <p className="text-sm text-[#A7F3D0]/80 leading-relaxed">
              Every complaint is assigned a guaranteed Service Level Agreement (SLA) fix deadline based on urgency. Overdue tickets flag immediately to alert department leaders.
            </p>

            <div className="grid grid-cols-2 gap-4 text-left font-sans">
              <div className="p-4 rounded-xl bg-[#0E2219] border border-red-500/30 space-y-1">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">4h Urgent / Critical</span>
                <p className="text-xl font-bold text-[#ECFDF5]">4 Hours</p>
                <p className="text-xs text-[#A7F3D0]/80">Power outages, main pipe burst</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0E2219] border border-amber-500/30 space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">24h High Priority</span>
                <p className="text-xl font-bold text-[#ECFDF5]">24 Hours</p>
                <p className="text-xs text-[#A7F3D0]/80">AC failure, network router down</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl care-panel space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#1D4A38] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span className="font-bold text-[#ECFDF5] font-display">SYSTEM OPERATIONAL STATS</span>
              </div>
              <span className="text-[#34D399]">99.8% ONLINE</span>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[#A7F3D0]/80">Average Resolution Time</span>
                <span className="font-bold text-[#ECFDF5]">3.2 Hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A7F3D0]/80">Student Satisfaction Rating</span>
                <span className="font-bold text-[#34D399]">4.9 / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A7F3D0]/80">PostgreSQL RLS Latency</span>
                <span className="font-bold text-[#ECFDF5]">&lt;8ms Query</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
