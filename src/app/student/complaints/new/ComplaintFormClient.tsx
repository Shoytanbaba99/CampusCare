"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createComplaintAction } from "../actions";
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  Building2,
  MapPin,
  Send,
  X,
  HelpCircle,
  Zap,
  Wrench,
  Laptop,
  Droplet,
  ChevronDown,
  Check,
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

  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isCatOpen, setIsCatOpen] = useState(false);

  // Derived state computed directly during render (prevents React 19 cascading render warnings)
  const activeDeptId = (selectedDeptId && departments.some((d) => d.id === selectedDeptId))
    ? selectedDeptId
    : (departments[0]?.id || "");
  const activeDept = departments.find((d) => d.id === activeDeptId) || departments[0];

  // Filter categories based on active department
  const filteredCategories = categories.filter((cat) => cat.department_id === activeDeptId);
  const displayCategories = filteredCategories.length > 0 ? filteredCategories : categories;

  const activeCatId = (selectedCategoryId && displayCategories.some((c) => c.id === selectedCategoryId))
    ? selectedCategoryId
    : (displayCategories[0]?.id || "");
  const activeCat = displayCategories.find((c) => c.id === activeCatId) || displayCategories[0];

  const [selectedPriority, setSelectedPriority] = useState<string>("medium");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const getDeptIcon = (code: string) => {
    switch (code?.toUpperCase()) {
      case "ELEC":
        return <Zap className="w-5 h-5" />;
      case "FAC":
        return <Wrench className="w-5 h-5" />;
      case "IT":
        return <Laptop className="w-5 h-5" />;
      case "PLUMB":
        return <Droplet className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Back Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#0E2219] border border-[#1D4A38] text-[#A7F3D0]/80 hover:text-[#ECFDF5] hover:border-[#10B981] btn-care"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#ECFDF5] font-display">Submit New Complaint</h1>
          <p className="text-sm text-[#A7F3D0]/80 mt-0.5">
            Report facility, hardware, or infrastructure issues directly to campus maintenance teams.
          </p>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="care-panel rounded-2xl p-7 sm:p-10 shadow-2xl space-y-7">
        {state?.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-7">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animated Department Dropdown */}
            <div className="space-y-3 relative">
              <label className="block text-base font-bold text-[#A7F3D0]">
                1. Maintenance Department *
              </label>
              <input type="hidden" name="departmentId" value={activeDeptId} />
              
              <button
                type="button"
                onClick={() => { setIsDeptOpen(!isDeptOpen); setIsCatOpen(false); }}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#07130E] border border-[#1D4A38] rounded-xl text-left hover:border-[#10B981]/80 transition-colors focus:ring-2 focus:ring-[#10B981] focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#10B981]">
                    {activeDept ? getDeptIcon(activeDept.code) : <Building2 className="w-5 h-5" />}
                  </div>
                  <span className="text-[#ECFDF5] font-bold text-base">
                    {activeDept ? activeDept.name : "Select Department"}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-[#A7F3D0]/60 transition-transform duration-300 ${isDeptOpen ? "rotate-180 text-[#10B981]" : "group-hover:text-[#10B981]"}`} />
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute z-30 w-full mt-2 bg-[#0E2219] border border-[#1D4A38] rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${isDeptOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                <div className="max-h-60 overflow-y-auto">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        setIsDeptOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#153326] transition-colors border-b border-[#1D4A38]/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-[#10B981] opacity-80">{getDeptIcon(dept.code)}</div>
                        <span className={`text-base ${activeDeptId === dept.id ? "text-[#10B981] font-bold" : "text-[#ECFDF5]"}`}>
                          {dept.name}
                        </span>
                      </div>
                      {activeDeptId === dept.id && <Check className="w-5 h-5 text-[#10B981]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Animated Category Dropdown */}
            <div className="space-y-3 relative">
              <label className="block text-base font-bold text-[#A7F3D0]">
                2. Issue Category *
              </label>
              <input type="hidden" name="categoryId" value={activeCatId} />
              
              <button
                type="button"
                onClick={() => { setIsCatOpen(!isCatOpen); setIsDeptOpen(false); }}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#07130E] border border-[#1D4A38] rounded-xl text-left hover:border-[#10B981]/80 transition-colors focus:ring-2 focus:ring-[#10B981] focus:outline-none group"
              >
                <span className="text-[#ECFDF5] font-bold text-base truncate pr-4">
                  {activeCat ? activeCat.name : "Select Issue Type"}
                </span>
                <ChevronDown className={`w-5 h-5 text-[#A7F3D0]/60 transition-transform duration-300 shrink-0 ${isCatOpen ? "rotate-180 text-[#10B981]" : "group-hover:text-[#10B981]"}`} />
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute z-20 w-full mt-2 bg-[#0E2219] border border-[#1D4A38] rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${isCatOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                <div className="max-h-60 overflow-y-auto">
                  {displayCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setIsCatOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#153326] transition-colors border-b border-[#1D4A38]/50 last:border-0"
                    >
                      <span className={`text-base ${activeCatId === cat.id ? "text-[#10B981] font-bold" : "text-[#ECFDF5]"}`}>
                        {cat.name}
                      </span>
                      {activeCatId === cat.id && <Check className="w-5 h-5 text-[#10B981]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-base font-bold text-[#A7F3D0]">
              3. Complaint Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Air conditioner in Lab 302 is not cooling"
              className="w-full px-4 py-3.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-base text-[#ECFDF5] placeholder-[#A7F3D0]/70 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-base font-bold text-[#A7F3D0]">
              4. Specific Campus Location *
            </label>
            <div className="relative">
              <input
                id="location"
                name="location"
                type="text"
                required
                placeholder="e.g. Science Building, 3rd Floor, Room 302"
                className="w-full pl-11 pr-4 py-3.5 bg-[#07130E] border border-[#1D4A38] rounded-xl text-base text-[#ECFDF5] placeholder-[#A7F3D0]/70 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
              <MapPin className="w-5 h-5 text-[#10B981] absolute left-3.5 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-base font-bold text-[#A7F3D0]">
                5. Urgency / Priority Level *
              </label>
              <div className="flex items-center gap-1.5 text-xs text-[#34D399]">
                <HelpCircle className="w-4 h-4" />
                <span>Target repair deadline is based on priority</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "low", label: "Low (7 Days Fix)" },
                { id: "medium", label: "Medium (3 Days Fix)" },
                { id: "high", label: "High (24h Fix)" },
                { id: "critical", label: "Critical (4h Fix)" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPriority(p.id)}
                  className={`py-3 px-3 rounded-xl border text-center font-bold text-xs sm:text-sm btn-care transition-all ${
                    selectedPriority === p.id
                      ? "bg-[#10B981] border-[#10B981] text-[#042014] shadow-md shadow-emerald-500/20"
                      : "bg-[#07130E] border-[#1D4A38] text-[#A7F3D0]/80 hover:border-[#10B981]/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="priority" value={selectedPriority} />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-base font-bold text-[#A7F3D0]">
              6. Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Explain what is broken, when it started, and any relevant details..."
              className="w-full p-4 bg-[#07130E] border border-[#1D4A38] rounded-xl text-base text-[#ECFDF5] placeholder-[#A7F3D0]/70 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
          </div>

          {/* Photo Proof Upload */}
          <div className="space-y-2">
            <label className="block text-base font-bold text-[#A7F3D0]">
              7. Photo Attachment (Optional)
            </label>
            <div className="relative border-2 border-dashed border-[#1D4A38] hover:border-[#10B981] rounded-2xl p-7 text-center transition-colors bg-[#07130E]">
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {previewUrl ? (
                <div className="relative inline-block">
                  <Image
                    src={previewUrl}
                    alt="Uploaded issue preview"
                    width={220}
                    height={160}
                    className="rounded-xl object-cover max-h-48 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pointer-events-none">
                  <Upload className="w-9 h-9 mx-auto text-[#10B981]" />
                  <p className="text-sm text-[#ECFDF5] font-semibold">Click to upload photo or drag and drop image file</p>
                  <p className="text-xs text-[#A7F3D0]/60">Supports PNG, JPG, JPEG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#10B981] hover:bg-[#059669] text-[#042014] font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 btn-care disabled:opacity-50"
          >
            {isPending ? (
              <span>Submitting complaint...</span>
            ) : (
              <>
                <Send className="w-5 h-5 text-[#042014]" />
                <span>Submit Ticket to Maintenance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
