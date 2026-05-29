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

export default function DivisionLayout({ slug, color, iconBg, iconColor, tagline, title, subtitle, heroIcon, children }: DivisionLayoutProps) {
  const { lang } = useLang();
  const L: Lang = lang;

  const gradientMap: Record<string, string> = {
    purple: "from-purple-500/20 via-purple-500/5 to-transparent",
    emerald: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    blue: "from-blue-500/20 via-blue-500/5 to-transparent",
    cyan: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    amber: "from-amber-500/20 via-amber-500/5 to-transparent",
  };
  const lineMap: Record<string, string> = {
    purple: "from-purple-500/40 to-transparent",
    emerald: "from-emerald-500/40 to-transparent",
    blue: "from-blue-500/40 to-transparent",
    cyan: "from-cyan-500/40 to-transparent",
    amber: "from-amber-500/40 to-transparent",
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Animated bg orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 animate-float1`} style={{ background: `radial-gradient(circle, var(--brand), transparent)` }} />
        <div className={`absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full blur-[120px] opacity-8 animate-float2`} style={{ background: `radial-gradient(circle, var(--brand-2), transparent)` }} />
      </div>

      {/* Breadcrumb */}
      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <nav className="flex items-center gap-2 text-[#5d7068] animate-fade-up">
          <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
          <ChevronRight size={14} />
          <Link href="/divisions" className="hover:text-white transition-colors">
            {L === "id" ? "Divisi" : "Divisions"}
          </Link>
          <ChevronRight size={14} />
          <span className="text-white/60">{title}</span>
        </nav>
      </div>

      {/* Ornament line */}
      <div className="relative max-w-6xl mx-auto px-6">
        <div className={`h-px bg-gradient-to-r ${lineMap[color] || lineMap.emerald}`} />
      </div>

      {/* Hero */}
      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${gradientMap[color] || gradientMap.emerald} border border-white/5 p-8 md:p-12`}>
          <div className="flex items-start gap-6">
            <div className={`${iconBg} p-4 rounded-2xl flex-shrink-0`}>{heroIcon}</div>
            <div className="animate-fade-up">
              <div className={`text-sm font-semibold ${iconColor} mb-2 uppercase tracking-[0.2em]`}>{tagline}</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black">
                {title}{" "}
                <span className={iconColor}>{subtitle}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">{children}</div>

      {/* Bottom nav */}
      <div className="relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-xs text-[#5d7068] mb-4 uppercase tracking-[0.2em] font-semibold">
            {L === "id" ? "Divisi Lainnya" : "Other Divisions"}
          </div>
          <div className="flex flex-wrap gap-3">
            {DIVISIONS.map((d, i) => (
              <Link
                key={i}
                href={`/divisions/${d.slug}`}
                className={`px-5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                  d.slug === slug
                    ? "bg-white/10 text-white border border-white/20"
                    : "glass-light text-[#7a9e8f] hover:text-white hover:bg-white/10"
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
