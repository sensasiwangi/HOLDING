"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import { Home, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface DivisionLayoutProps {
  slug: string;
  color: "purple" | "emerald" | "blue" | "cyan" | "amber";
  iconBg: string;
  iconColor: string;
  tagline: string;
  title: string;
  subtitle: string;
  heroIcon: ReactNode;
  children: ReactNode;
}

const DIVISIONS = [
  { slug: "produksi", color: "purple" as const, label: "Production & Brands" },
  { slug: "store", color: "emerald" as const, label: "SWI Store" },
  { slug: "event", color: "blue" as const, label: "Event & Fragrantions" },
  { slug: "ecommerce", color: "cyan" as const, label: "Ecommerse" },
  { slug: "digital", color: "amber" as const, label: "Digital & AI" },
];

export default function DivisionLayout({
  slug,
  color,
  iconBg,
  iconColor,
  tagline,
  title,
  subtitle,
  heroIcon,
  children,
}: DivisionLayoutProps) {
  const { lang } = useLang();
  const L: Lang = lang;
  const colorMap: Record<string, string> = {
    purple: "from-purple-500/20 to-transparent border-purple-500/30",
    emerald: "from-emerald-500/20 to-transparent border-emerald-500/30",
    blue: "from-blue-500/20 to-transparent border-blue-500/30",
    cyan: "from-cyan-500/20 to-transparent border-cyan-500/30",
    amber: "from-amber-500/20 to-transparent border-amber-500/30",
  };
  const activeColor = colorMap[color] || colorMap.purple;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Breadcrumb + PDF */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 flex flex-wrap items-center justify-between gap-4 text-sm">
        <nav className="flex items-center gap-2 text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">
            <Home size={14} />
          </Link>
          <ChevronRight size={14} />
          <Link href="/divisions" className="hover:text-white transition-colors">
            {L === "id" ? "Divisi" : "Divisions"}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-300">{title}</span>
        </nav>
        <button
          onClick={() => window.print()}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          🖨️ {L === "id" ? "Cetak / PDF" : "Print / PDF"}
        </button>
      </div>

      {/* Divider line */}
      <div className="max-w-6xl mx-auto px-4">
        <div className={`h-px bg-gradient-to-r ${activeColor}`} />
      </div>

      {/* Hero */}
      <div className={`max-w-6xl mx-auto px-4 py-12 md:py-20`}>
        <div
          className={`bg-gradient-to-br ${activeColor} rounded-2xl p-8 md:p-12 border`}
        >
          <div className="flex items-start gap-6">
            <div className={`${iconBg} p-4 rounded-xl flex-shrink-0`}>
              {heroIcon}
            </div>
            <div>
              <div className={`text-sm font-medium ${iconColor} mb-1 uppercase tracking-wider`}>
                {tagline}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white">
                {title}{" "}
                <span className={iconColor}>{subtitle}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">{children}</div>

      {/* Bottom nav — other divisions */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h3 className="text-sm text-gray-500 mb-4 uppercase tracking-wider">
            {L === "id" ? "Divisi Lainnya" : "Other Divisions"}
          </h3>
          <div className="flex flex-wrap gap-3">
            {DIVISIONS.map((d, i) => (
              <Link
                key={i}
                href={`/divisions/${d.slug}`}
                className={`px-4 py-2 rounded-full text-sm border transition-colors hover:bg-white/10 ${
                  d.slug === slug
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
