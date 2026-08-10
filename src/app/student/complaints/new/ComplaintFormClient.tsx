"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createComplaintAction } from "../actions";
import {
  ShieldAlert,
  ArrowLeft,
  Upload,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  Send,
  X,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Category {
  id: string;
  name: string;
  department_id: string;
}

interface ComplaintFormProps {
  departments: Department[];
  categories: Category[];
}

export default function ComplaintFormClient({ departments, categories }: ComplaintFormProps) {
  const [state, formAction, isPending] = useActionState(createComplaintAction, null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || "");
  const [selectedPriority, setSelectedPriority] = useState<string>("medium");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Filter categories based on selected department
  const filteredCategories = categories.filter((cat) => cat.department_id === selectedDeptId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Back Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#111827] border border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">Submit New Complaint</h1>
          <p className="text-xs text-[#9CA3AF]">
            Report facility, hardware, or infrastructure issues to campus maintenance
          </p>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
        {state?.error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Complaint Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]"
            >
              Issue Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. AC Unit In Lab 302 Blowing Warm Air"
              className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
            />
          </div>

          {/* Department & Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="departmentId"
                className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]"
              >
                Department *
              </label>
              <div className="relative">
                <select
                  id="departmentId"
                  name="departmentId"
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all appearance-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-[#111827]">
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="categoryId"
                className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]"
              >
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all appearance-none"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#111827]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Physical Location */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]"
            >
              Physical Campus Location *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                required
                placeholder="e.g. Building B, 3rd Floor, Room 302"
                className="w-full pl-10 pr-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Priority Level Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Priority & Target SLA *
            </label>
            <input type="hidden" name="priority" value={selectedPriority} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PriorityOption
                value="low"
                label="Low"
                sla="7 Days SLA"
                active={selectedPriority === "low"}
                onClick={() => setSelectedPriority("low")}
              />
              <PriorityOption
                value="medium"
                label="Medium"
                sla="3 Days SLA"
                active={selectedPriority === "medium"}
                onClick={() => setSelectedPriority("medium")}
              />
              <PriorityOption
                value="high"
                label="High"
                sla="24h SLA"
                active={selectedPriority === "high"}
                onClick={() => setSelectedPriority("high")}
              />
              <PriorityOption
                value="critical"
                label="Critical"
                sla="4h SLA Pulse"
                active={selectedPriority === "critical"}
                onClick={() => setSelectedPriority("critical")}
                pulse={true}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]"
            >
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              placeholder="Describe the issue, specific damage details, or symptoms..."
              className="w-full p-3 bg-[#090D16] border border-[#1F2937] rounded-lg text-sm text-[#F9FAFB] placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          {/* Optional 5MB Photo Evidence Uploader */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Photographic Evidence (Optional — Max 5MB JPG/PNG/WEBP)
            </label>

            <div className="relative border-2 border-dashed border-[#1F2937] hover:border-[#6366F1]/50 rounded-xl p-6 text-center transition-all bg-[#090D16]">
              {previewUrl ? (
                <div className="relative inline-block h-48 w-full max-w-sm">
                  <Image
                    src={previewUrl}
                    alt="Evidence preview"
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="rounded-lg object-contain border border-[#1F2937]"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="evidenceFile" className="cursor-pointer space-y-2 block">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1F2937] text-[#6366F1]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-[#9CA3AF]">
                    <span className="text-[#6366F1] font-medium">Click to upload</span> or drag and
                    drop photo
                  </div>
                  <p className="text-[10px] text-[#9CA3AF]/60">PNG, JPG, WEBP up to 5MB</p>
                </label>
              )}

              <input
                id="evidenceFile"
                name="evidenceFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-medium text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 focus:outline-none focus:ring-2 focus:ring-[#6366F1] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <span>Submitting Complaint...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint Ticket</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PriorityOption({
  label,
  sla,
  active,
  onClick,
  pulse,
}: {
  value: string;
  label: string;
  sla: string;
  active: boolean;
  onClick: () => void;
  pulse?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border text-left transition-all ${
        active
          ? "bg-[#6366F1]/10 border-[#6366F1] text-[#F9FAFB] ring-1 ring-[#6366F1]"
          : "bg-[#090D16] border-[#1F2937] text-[#9CA3AF] hover:border-[#1F2937]/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#F9FAFB]">{label}</span>
        {pulse && <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
      </div>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#9CA3AF]">
        <Clock className="w-3 h-3" />
        <span>{sla}</span>
      </div>
    </button>
  );
}
