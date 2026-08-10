import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CampusCare — University Helpdesk System",
  description: "Centralized campus complaint management & maintenance tracking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-[#F9FAFB] min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
