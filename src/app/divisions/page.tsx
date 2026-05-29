"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  Building2,
  Store,
  Calendar,
  FlaskConical,
  Code2,
  Globe,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
} from "lucide-react";

const T = {
  title: { id: "Struktur Holding SWI", en: "SWI Holding Structure" },
  desc: {
    id: "Setiap divisi beroperasi sebagai anak perusahaan mandiri namun saling terhubung dalam ekosistem yang memperkuat.",
    en: "Each division operates as an independent subsidiary yet interconnected within a reinforcing ecosystem.",
  },
  subtitle: { id: "Anak Perusahaan", en: "Subsidiaries" },
  explore: { id: "Jelajahi Divisi", en: "Explore Division" },
  synergy: { id: "Sinergi Ekosistem", en: "Ecosystem Synergy" },
  synergyDesc: {
    id: "Setiap divisi menghasilkan data dan value yang saling memperkuat: Produksi menyediakan produk, Store & Event membangun experience, Digital mengoptimalkan operasional & pembukuan, Ecommerse membuka pasar nasional, dan Holding mengelola investasi serta strategi korporat.",
    en: "Each division generates data and value that reinforce each other: Production supplies products, Store & Event build experience, Digital optimizes operations & accounting, Ecommerse opens the national market, and Holding manages investments & corporate strategy.",
  },
  backTo: { id: "Kembali ke", en: "Back to" },
} as const;

const DIVISIONS = [
  {
    slug: "produksi",
    icon: <FlaskConical size={28} />,
    titleId: "Production & Brands",
    titleEn: "Production & Brands",
    descId: "Larc-en-Scent, Nuscentza, Pixel Potion — formulasi, produksi, QC, packaging",
    descEn: "Larc-en-Scent, Nuscentza, Pixel Potion — formulation, production, QC, packaging",
    gradient: "from-purple-600 to-indigo-700",
    hoverBorder: "hover:border-purple-500",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    progress: 50,
    stats: { brands: "3", products: "25+" },
  },
  {
    slug: "store",
    icon: <Store size={28} />,
    titleId: "SWI Store & Pengalaman Offline",
    titleEn: "SWI Store & Offline Experience",
    descId: "Toko retail parfum, kelas parfumer, AI Mix, customer experience",
    descEn: "Perfume retail store, perfumery classes, AI Mix, customer experience",
    gradient: "from-emerald-600 to-teal-700",
    hoverBorder: "hover:border-emerald-500",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    progress: 70,
    stats: { gerai: "3", siswa: "500+" },
  },
  {
    slug: "event",
    icon: <Calendar size={28} />,
    titleId: "Event Organizer & Fragrantions",
    titleEn: "Event Organizer & Fragrantions",
    descId: "Fragrantions Expo, Road to Fragrantions, pameran & roadshow nasional",
    descEn: "Fragrantions Expo, Road to Fragrantions, national expos & roadshows",
    gradient: "from-blue-600 to-indigo-700",
    hoverBorder: "hover:border-blue-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    progress: 55,
    stats: { events: "50+", peserta: "10K+" },
  },
  {
    slug: "ecommerce",
    icon: <Globe size={28} />,
    titleId: "Ecommerse & Marketplace",
    titleEn: "Ecommerse & Marketplace",
    descId: "sensasiwangi.id — katalog, booking, checkout, support, analytics",
    descEn: "sensasiwangi.id — catalog, booking, checkout, support, analytics",
    gradient: "from-cyan-600 to-blue-700",
    hoverBorder: "hover:border-cyan-500",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-700",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    progress: 30,
    stats: { produk: "100+", seller: "50+" },
  },
  {
    slug: "digital",
    icon: <Code2 size={28} />,
    titleId: "Digital Systems & AI",
    titleEn: "Digital Systems & AI",
    descId: "AppSheet CRM, AI Perfume Profile, otomasi, dashboard analytics",
    descEn: "AppSheet CRM, AI Perfume Profile, automation, analytics dashboard",
    gradient: "from-amber-600 to-orange-700",
    hoverBorder: "hover:border-amber-500",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    progress: 35,
    stats: { sistem: "5+", model: "10+" },
  },
];

const HOLDING_STATS = [
  { icon: <TrendingUp size={20} />, labelId: "Pendapatan Holding", labelEn: "Holding Revenue", value: "Multi-source" },
  { icon: <Shield size={20} />, labelId: "Modal Dasar", labelEn: "Base Capital", value: "Rp 1M" },
  { icon: <Users size={20} />, labelId: "Pemegang Saham", labelEn: "Shareholders", value: "3" },
  { icon: <DollarSign size={20} />, labelId: "Setoran 30%", labelEn: "Contribution 30%", value: "Otomatis" },
];

export default function DivisionsPage() {
  const { lang } = useLang();
  const L: Lang = lang;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase tracking-widest text-sm font-semibold text-white/70 mb-3">
            {T.subtitle[L]}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            {T.title[L]}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">{T.desc[L]}</p>
        </div>
      </section>

      {/* Division Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {DIVISIONS.map((d, i) => (
              <Link
                key={i}
                href={`/divisions/${d.slug}`}
                className={`group bg-white rounded-2xl border-2 border-transparent ${d.hoverBorder} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`}
              >
                {/* Color top bar */}
                <div className={`h-2 bg-gradient-to-r ${d.gradient}`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Icon + progress */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${d.iconBg} p-3 rounded-xl ${d.iconColor}`}>
                      {d.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {d.progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${d.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${d.progress}%` }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#10201d] mb-2 group-hover:text-[#0f7b63] transition-colors">
                    {L === "id" ? d.titleId : d.titleEn}
                  </h3>

                  {/* Desc */}
                  <p className="text-gray-500 text-sm mb-4 flex-1">
                    {L === "id" ? d.descId : d.descEn}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4 text-xs">
                    {Object.entries(d.stats).map(([key, val], j) => (
                      <div key={j} className={`${d.bgLight} px-3 py-1.5 rounded-lg`}>
                        <span className={`font-bold ${d.textColor}`}>{val}</span>{" "}
                        <span className="text-gray-500 capitalize">{key}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0f7b63] group-hover:gap-3 transition-all">
                    {T.explore[L]} <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}

            {/* Holding Office Card (Dashboard link) */}
            <Link
              href="/dashboard"
              className="group bg-white rounded-2xl border-2 border-transparent hover:border-gray-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="h-2 bg-gradient-to-r from-gray-600 to-gray-800" />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                    <Building2 size={28} />
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">60%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gray-500 to-gray-700 rounded-full" style={{ width: "60%" }} />
                </div>
                <h3 className="text-xl font-bold text-[#10201d] mb-2">Holding Office</h3>
                <p className="text-gray-500 text-sm mb-4 flex-1">
                  {L === "id"
                    ? "Legal, keuangan, strategi korporat, investor relations, dan Sukuk"
                    : "Legal, finance, corporate strategy, investor relations & Sukuk"}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  {HOLDING_STATS.map((s, i) => (
                    <div key={i} className="bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2">
                      <span className="text-gray-400">{s.icon}</span>
                      <div>
                        <div className="font-bold text-gray-700">{s.value}</div>
                        <div className="text-gray-400">{L === "id" ? s.labelId : s.labelEn}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 group-hover:gap-3 transition-all">
                  {L === "id" ? "Buka Dashboard" : "Open Dashboard"} <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </div>

          {/* Synergy */}
          <div className="mt-16 bg-white rounded-xl border border-gray-200 p-8 sm:p-10 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-[#10201d] mb-3">
              {T.synergy[L]}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {T.synergyDesc[L]}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/investor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f7b63] text-white font-bold rounded-full hover:bg-[#0d6b56] transition-colors"
              >
                {L === "id" ? "Investor Relations" : "Investor Relations"}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                {L === "id" ? "Dashboard Keuangan" : "Financial Dashboard"}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
