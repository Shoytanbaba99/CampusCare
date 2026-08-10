"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "../actions";
import { Shield, KeyRound, Mail, User, AlertCircle, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-[#090D16] text-[#F9FAFB] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
            Create Student Account
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Register to submit and track campus maintenance complaints
          </p>
        </div>

        {/* Card Housing */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {state?.error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Rudro Antony Mrong"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                University Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="student@uits.edu.bd"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 focus:outline-none focus:ring-2 focus:ring-[#6366F1] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 border-t border-[#1F2937]">
            <p className="text-xs text-[#9CA3AF]">
              Already registered?{" "}
              <Link href="/login" className="text-[#6366F1] hover:underline font-medium">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
