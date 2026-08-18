import { Suspense } from "react";
import TrackClient from "./TrackClient";

export const metadata = {
  title: "Track Anonymous Ticket | CampusCare",
  description: "Track status, SLA repair countdown, and resolution progress for anonymous campus complaints.",
};

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[#04120B] text-[#ECFDF5] py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-[#A7F3D0]/60 py-12">Loading tracking portal...</div>}>
        <TrackClient />
      </Suspense>
    </div>
  );
}
