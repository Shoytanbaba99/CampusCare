export default function StudentLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-[#1F2937] rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-[#111827] border border-[#1F2937] rounded-xl" />
        <div className="h-24 bg-[#111827] border border-[#1F2937] rounded-xl" />
        <div className="h-24 bg-[#111827] border border-[#1F2937] rounded-xl" />
      </div>
      <div className="h-64 bg-[#111827] border border-[#1F2937] rounded-xl" />
    </div>
  );
}
