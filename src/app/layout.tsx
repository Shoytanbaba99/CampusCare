import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusCare: Campus Maintenance & Student Helpdesk",
  description: "Welcoming, efficient campus issue reporting and resolution portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${jakarta.variable} ${inter.variable}`}
    >
      <body className="bg-[#07130E] text-[#ECFDF5] font-sans min-h-dvh antialiased selection:bg-[#10B981] selection:text-white">
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
