"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import {
  Building2, Store, Calendar, FlaskConical, Code2, Globe,
  ArrowRight, ArrowUpRight, TrendingUp, Users, DollarSign, Shield,
  Layers,
} from "lucide-react";

const DIVISIONS = [
  {
    slug: "produksi", icon: <FlaskConical size={28} />, emoji: "🧪",
    titleId: "Production & Brands", titleEn: "Production & Brands",
    descId: "Larc-en-Scent, Nuscentza, Pixel Potion — formulasi, produksi, QC, packaging",
    descEn: "Larc-en-Scent, Nuscentza, Pixel Potion — formulation, production, QC, packaging",
    gradient: "from-purple-500 to-indigo-600",
    progress: 50, stats: { brands: "3", products: "25+" },
  },
  {
    slug: "store", icon: <Store size={28} />, emoji: "🏪",
    titleId: "SWI Store TIM", titleEn: "SWI Store TIM",
    descId: "Merch TIM, Parfum Experience, AI Mix, Artisan Showcase",
    descEn: "TIM Merch, Perfume Experience, AI Mix, Artisan Showcase",
    gradient: "from-emerald-500 to-teal-600",
    progress: 70, stats: { gerai: "3", siswa: "500+" },
  },
  {
    slug: "event", icon: <Calendar size={28} />, emoji: "🎭",
    titleId: "Fragrantions", titleEn: "Fragrantions",
    descId: "Fragrantions Expo, Road to Fragrantions, pameran & roadshow",
    descEn: "Fragrantions Expo, Road to Fragrantions, expos & roadshows",
    gradient: "from-blue-500 to-indigo-600",
    progress: 55, stats: { events: "50+", peserta: "10K+" },
  },
  {
    slug: "ecommerce", icon: <Globe size={28} />, emoji: "🌐",
    titleId: "Marketplace", titleEn: "Marketplace",
    descId: "sensasiwangi.id — katalog, booking, checkout, support, analytics",
    descEn: "sensasiwangi.id — catalog, booking, checkout, support, analytics",
    gradient: "from-cyan-500 to-blue-600",
    progress: 30, stats: { produk: "100+", seller: "50+" },
  },
  {
    slug: "digital", icon: <Code2 size={28} />, emoji: "🤖",
    titleId: "Digital & AI", titleEn: "Digital & AI",
    descId: "AppSheet CRM, AI Perfume Profile, otomasi, dashboard analytics",
    descEn: "AppSheet CRM, AI Perfume Profile, automation, analytics dashboard",
    gradient: "from-amber-500 to-orange-600",
    progress: 35, stats: { sistem: "5+", model: "10+" },
  },
];

export default function DivisionsPage() {
  const { lang } = useLang();
  const L = lang;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#0f7b63]/10 blur-[120px] animate-float1" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#c9a84c]/5 blur-[100px] animate-float2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8 animate-fade-up">
            <Layers size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">
              {L === "id" ? "Struktur Holding" : "Holding Structure"}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient">
              {L === "id" ? "Lima Anak Perusahaan" : "Five Subsidiaries"}
            </span>
          </h1>
          <p className="text-lg text-[#7a9e8f] max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {L === "id"
              ? "Setiap divisi beroperasi sebagai unit bisnis mandiri namun saling terhubung dalam ekosistem yang memperkuat."
              : "Each division operates as an independent business unit yet interconnected within a reinforcing ecosystem."}
          </p>
        </div>
      </section>

      {/* Division Cards */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {DIVISIONS.map((d, i) => (
              <Link
                key={i}
                href={`/divisions/${d.slug}`}
                className="group card-luxury p-7 flex flex-col animate-fade-up"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {d.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5d7068] bg-white/5 px-2 py-1 rounded-full">{d.progress}%</span>
                    <ArrowUpRight size={16} className="text-[#5d7068] group-hover:text-white group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${d.gradient} rounded-full transition-all duration-1000`} style={{ width: `${d.progress}%` }} />
                </div>

                {/* Title */}
                <div className="text-2xl mb-2">{d.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {L === "id" ? d.titleId : d.titleEn}
                </h3>
                <p className="text-[#5d7068] text-sm mb-5 flex-1">
                  {L === "id" ? d.descId : d.descEn}
                </p>

                {/* Stats */}
                <div className="flex gap-3 mb-5">
                  {Object.entries(d.stats).map(([key, val], j) => (
                    <div key={j} className="bg-white/5 rounded-lg px-3 py-1.5 text-xs">
                      <span className="font-bold text-white">{val}</span>{" "}
                      <span className="text-[#5d7068] capitalize">{key}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-semibold text-[#5d7068] group-hover:text-emerald-400 transition-colors">
                  {L === "id" ? "Jelajahi" : "Explore"}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}

            {/* Holding Office Card */}
            <Link href="/dashboard" className="group card-luxury p-7 flex flex-col animate-fade-up md:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Building2 size={28} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5d7068] bg-white/5 px-2 py-1 rounded-full">60%</span>
                  <ArrowUpRight size={16} className="text-[#5d7068] group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                Holding Office
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-5 flex-1">
                {[
                  { icon: <TrendingUp size={14} />, label: L === "id" ? "Multi-source Revenue" : "Multi-source Revenue", value: "5" },
                  { icon: <Shield size={14} />, label: L === "id" ? "Modal Dasar" : "Base Capital", value: "Rp 1M" },
                  { icon: <Users size={14} />, label: L === "id" ? "Pemegang Saham" : "Shareholders", value: "3" },
                  { icon: <DollarSign size={14} />, label: "Setoran 30%", value: "Auto" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                    <span className="text-[#5d7068]">{s.icon}</span>
                    <div>
                      <div className="font-bold text-white">{s.value}</div>
                      <div className="text-[#5d7068] text-[10px]">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#5d7068] group-hover:text-emerald-400 transition-colors">
                {L === "id" ? "Buka Dashboard" : "Open Dashboard"}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Synergy */}
          <div className="mt-20 text-center max-w-2xl mx-auto animate-fade-up">
            <div className="card-luxury p-10">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-white mb-3">
                {L === "id" ? "Sinergi Ekosistem" : "Ecosystem Synergy"}
              </h3>
              <p className="text-[#7a9e8f] text-sm leading-relaxed mb-8">
                {L === "id"
                  ? "Setiap divisi menghasilkan data dan value yang saling memperkuat: Produksi menyediakan produk, Store & Event membangun experience, Digital mengoptimalkan operasional, Marketplace membuka pasar nasional, dan Holding mengelola investasi serta strategi korporat."
                  : "Each division generates data and value that reinforce each other: Production supplies products, Store & Event build experience, Digital optimizes operations, Marketplace opens the national market, and Holding manages investments & corporate strategy."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/investor" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#0f7b63]/20 transition-all">
                  {L === "id" ? "Investor Relations" : "Investor Relations"} <ArrowRight size={16} />
                </Link>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-all">
                  {L === "id" ? "Dashboard Keuangan" : "Financial Dashboard"} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
