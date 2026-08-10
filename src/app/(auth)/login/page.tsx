"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { HeartHandshake, KeyRound, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-[#07130E] text-[#ECFDF5] px-4 py-12 selection:bg-[#10B981] selection:text-black">
      {/* Background Emerald Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#10B981] shadow-lg shadow-emerald-500/20 mb-1">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#ECFDF5] font-display">
            Welcome Back to CampusCare
          </h1>
          <p className="text-sm sm:text-base text-[#A7F3D0]/80 max-w-md mx-auto leading-relaxed">
            Sign in to report facility issues, track repair timelines, or manage campus helpdesk tickets.
          </p>
        </div>

        {/* Card Housing */}
        <div className="care-panel rounded-2xl p-7 sm:p-10 shadow-2xl space-y-6">
          {state?.error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold tracking-wide text-[#A7F3D0]">
                University Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6EE7B7]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. alex.student@campus.edu"
                  className="w-full pl-11 pr-4 py-3 bg-[#07130E] border border-[#1D4A38] rounded-xl text-base text-[#ECFDF5] placeholder-[#A7F3D0]/70 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold tracking-wide text-[#A7F3D0]">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6EE7B7]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your account password"
                  className="w-full pl-11 pr-4 py-3 bg-[#07130E] border border-[#1D4A38] rounded-xl text-base text-[#ECFDF5] placeholder-[#A7F3D0]/70 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button (WCAG AAA High Contrast Text) */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 btn-care disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Helpdesk</span>
                  <ArrowRight className="w-5 h-5 text-[#042014]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-3 border-t border-[#1D4A38] text-sm">
            <p className="text-[#A7F3D0]/80">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#10B981] hover:text-[#34D399] underline font-bold">
                Register Student Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
