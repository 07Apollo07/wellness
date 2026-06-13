import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Serenity - GenAI Student Wellness Companion",
  description: "AI-powered stress tracker & coping companion for competitive exam students (NEET, JEE, UPSC, GATE, CAT, CUET). Analyze journal entries, track mood levels, and chat with Serenity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-slate-100 selection:bg-[#7ec8a4]/30 selection:text-emerald-300">
        {/* Floating background decorative orbs */}
        <div className="bg-orb orb-sage" />
        <div className="bg-orb orb-lavender" />
        <div className="bg-orb orb-amber" />
        
        <Nav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 z-10 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
