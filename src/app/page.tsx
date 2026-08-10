import Link from "next/link";
import { Shield, ArrowRight, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-[#090D16] text-[#F9FAFB] px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>University Premises Operational Desk</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F9FAFB]">
          CampusCare Helpdesk & Maintenance Platform
        </h1>

        <p className="text-lg text-[#9CA3AF] max-w-xl mx-auto">
          Centralized ticket reporting, SLA urgency tracking, and departmental resolution pipeline for campus facilities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium text-base shadow-lg shadow-[#6366F1]/20 transition-all"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] text-[#F9FAFB] font-medium text-base transition-all"
          >
            <span>Register Student Account</span>
          </Link>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left border-t border-[#1F2937]/50">
          <div className="space-y-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm text-[#F9FAFB]">SLA Tracking</h3>
            <p className="text-xs text-[#9CA3AF]">
              Targeted resolution timeframes ranging from 4-hour critical outages to 7-day minor jobs.
            </p>
          </div>
          <div className="space-y-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-sm text-[#F9FAFB]">Real-Time Timeline</h3>
            <p className="text-xs text-[#9CA3AF]">
              Track progress notes, staff assignments, and resolution status in real time.
            </p>
          </div>
          <div className="space-y-2">
            <AlertTriangle className="w-5 h-5 text-[#6366F1]" />
            <h3 className="font-semibold text-sm text-[#F9FAFB]">Department Dispatch</h3>
            <p className="text-xs text-[#9CA3AF]">
              Automatic routing to Electrical, IT Cell, Plumbing, and Facilities teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
