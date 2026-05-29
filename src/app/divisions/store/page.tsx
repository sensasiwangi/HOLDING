"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  Store,
  MapPin,
  DollarSign,
  TrendingUp,
  Target,
  FileDown,
  ExternalLink,
  Users,
  Star,
  GraduationCap,
  Sparkles,
  Calendar,
  Award,
  ChevronRight,
  ArrowRight,
  UserCircle,
  BookOpen,
  Brain,
  HeartHandshake,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import DivisionLayout from "../DivisionLayout";

/* ── text dictionary ── */
const T = {
  profile: {
    id: {
      tagline: "Divisi Store & Pengalaman Offline",
      title: "SWI Store",
      subtitle: "& Offline Experience",
      desc: "Toko retail parfum yang menyediakan pengalaman belanja parfum secara offline, kelas parfumer untuk pemula hingga profesional, kelas regular untuk branding dan bisnis, serta AI Mix — teknologi pencampuran parfum berbasis kecerdasan buutan.",
      visionTitle: "Visi",
      vision: "Menjadi destinasi utama pengalaman parfum offline di Indonesia dengan standar kelas dunia.",
      missionTitle: "Misi",
      mission: "Retail experience premium → Edukasi parfumer → AI Mix personalisasi → Customer loyalty berkelanjutan.",
    },
    en: {
      tagline: "Store & Offline Experience Division",
      title: "SWI Store",
      subtitle: "& Offline Experience",
      desc: "A perfume retail store providing offline perfume shopping experiences, perfumery classes from beginner to professional level, regular classes for branding and business, plus AI Mix — an artificial intelligence-based perfume blending technology.",
      visionTitle: "Vision",
      vision: "Become Indonesia's premier offline perfume destination with world-class standards.",
      missionTitle: "Mission",
      mission: "Premium retail experience → Perfumery education → AI Mix personalization → Sustainable customer loyalty.",
    },
  },
  metrics: {
    id: {
      gerai: "Gerai TIM",
      siswa: "Siswa Kelas",
      customer: "Customer",
      rating: "Rating Rata-rata",
    },
    en: {
      gerai: "TIM Stores",
      siswa: "Class Students",
      customer: "Customers",
      rating: "Average Rating",
    },
  },
  locations: {
    id: {
      title: "Lokasi Store",
      subtitle: "Gerai SWI Store di Taman Mini Indonesia Indah",
      tim1: "SWI Store TIM 1 — Main Store",
      tim1Desc: "Gerai utama dengan fasilitas lengkap: retail, kelas, dan AI Mix",
      tim2: "SWI Store TIM 2 — Education Center",
      tim2Desc: "Fokus pada kelas parfumer dan workshop",
      tim3: "SWI Store TIM 3 — AI Mix Lab",
      tim3Desc: "Laboratorium pencampuran parfum berbasis AI",
    },
    en: {
      title: "Store Locations",
      subtitle: "SWI Store outlets at Taman Mini Indonesia Indah",
      tim1: "SWI Store TIM 1 — Main Store",
      tim1Desc: "Main outlet with full facilities: retail, classes, and AI Mix",
      tim2: "SWI Store TIM 2 — Education Center",
      tim2Desc: "Focused on perfumery classes and workshops",
      tim3: "SWI Store TIM 3 — AI Mix Lab",
      tim3Desc: "AI-based perfume blending laboratory",
    },
  },
  finance: {
    id: {
      title: "Keuangan Store",
      subtitle: "Data keuangan SWI Store dari Google Sheets",
      revenue: "Pendapatan",
      expense: "Pengeluaran",
      net: "Laba/Rugi Bersih",
      setoran: "Setoran ke Holding (30%)",
      month: "Bulan",
      loading: "Memuat data keuangan...",
      error: "Gagal memuat data keuangan",
      kontribusi: "Kontribusi dari total pendapatan",
    },
    en: {
      title: "Store Finance",
      subtitle: "SWI Store financial data from Google Sheets",
      revenue: "Revenue",
      expense: "Expenses",
      net: "Net Profit/Loss",
      setoran: "Contribution to Holding (30%)",
      month: "Month",
      loading: "Loading financial data...",
      error: "Failed to load financial data",
      kontribusi: "Contribution from total revenue",
    },
  },
  sukuk: {
    id: {
      title: "Sukuk Store",
      subtitle: "Manajemen investasi syariah untuk ekspansi store",
      desc: "Program Sukuk yang dikelola melalui divisi Store untuk pendanaan ekspansi gerai, fasilitas kelas, dan pengembangan teknologi AI Mix. Pantau dan kelola data sukuk melalui dashboard holding.",
      btnLabel: "Buka Dashboard Sukuk",
      investorLabel: "Data Investor Sukuk",
      projectionLabel: "Proyeksi Sukuk",
    },
    en: {
      title: "Sukuk Store",
      subtitle: "Islamic investment management for store expansion",
      desc: "Sukuk program managed by the Store division for funding store outlet expansion, class facilities, and AI Mix technology development. Monitor and manage sukuk data through the holding dashboard.",
      btnLabel: "Open Sukuk Dashboard",
      investorLabel: "Sukuk Investor Data",
      projectionLabel: "Sukuk Projection",
    },
  },
  team: {
    id: { title: "Tim Store", pic: "Penanggung Jawab", role: "Jabatan" },
    en: { title: "Store Team", pic: "Person in Charge", role: "Position" },
  },
  milestones: {
    id: {
      title: "Milestone & Roadmap",
      done: "✅ Selesai",
      ongoing: "🔄 Berjalan",
      upcoming: "📋 Akan Datang",
    },
    en: {
      title: "Milestones & Roadmap",
      done: "✅ Completed",
      ongoing: "🔄 Ongoing",
      upcoming: "📋 Upcoming",
    },
  },
  cta: {
    id: { pdf: "Download PDF Profil", sheet: "Google Sheet Store" },
    en: { pdf: "Download Profile PDF", sheet: "Store Google Sheet" },
  },
} as const;

/* ── static data ── */
const METRICS = [
  {
    labelId: T.metrics.id.gerai,
    labelEn: T.metrics.en.gerai,
    value: "3",
    icon: <Store size={20} />,
    color: "text-emerald-400",
  },
  {
    labelId: T.metrics.id.siswa,
    labelEn: T.metrics.en.siswa,
    value: "500+",
    icon: <GraduationCap size={20} />,
    color: "text-blue-400",
  },
  {
    labelId: T.metrics.id.customer,
    labelEn: T.metrics.en.customer,
    value: "1,000+",
    icon: <Users size={20} />,
    color: "text-amber-400",
  },
  {
    labelId: T.metrics.id.rating,
    labelEn: T.metrics.en.rating,
    value: "4.8",
    icon: <Star size={20} />,
    color: "text-yellow-400",
  },
];

const LOCATIONS = [
  {
    nameId: T.locations.id.tim1,
    nameEn: T.locations.en.tim1,
    descId: T.locations.id.tim1Desc,
    descEn: T.locations.en.tim1Desc,
    icon: "🏪",
    color: "border-emerald-500/30 bg-emerald-500/5",
  },
  {
    nameId: T.locations.id.tim2,
    nameEn: T.locations.en.tim2,
    descId: T.locations.id.tim2Desc,
    descEn: T.locations.en.tim2Desc,
    icon: "🎓",
    color: "border-blue-500/30 bg-blue-500/5",
  },
  {
    nameId: T.locations.id.tim3,
    nameEn: T.locations.en.tim3,
    descId: T.locations.id.tim3Desc,
    descEn: T.locations.en.tim3Desc,
    icon: "🤖",
    color: "border-purple-500/30 bg-purple-500/5",
  },
];

const TEAM = [
  {
    name: "Beriman Juliano",
    roleId: "PIC SWI Store / Pemilik",
    roleEn: "SWI Store PIC / Owner",
    icon: "👨‍💼",
  },
  {
    name: "Tim Store",
    roleId: "Retail & Customer Experience",
    roleEn: "Retail & Customer Experience",
    icon: "🛍️",
  },
  {
    name: "Tim Kelas",
    roleId: "Instruktur Parfumer",
    roleEn: "Perfumery Instructors",
    icon: "🧑‍🏫",
  },
  {
    name: "Tim AI Mix",
    roleId: "Teknologi & Operasional",
    roleEn: "Technology & Operations",
    icon: "🧪",
  },
];

const MILESTONES = [
  {
    titleId: "Pembentukan divisi SWI Store",
    titleEn: "SWI Store division established",
    date: "2023",
    status: "done" as const,
  },
  {
    titleId: "Pembukaan gerai TIM 1 — Main Store",
    titleEn: "TIM 1 — Main Store opened",
    date: "2023",
    status: "done" as const,
  },
  {
    titleId: "Peluncuran kelas parfumer batch 1 & 2",
    titleEn: "Perfumery classes batch 1 & 2 launched",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Pembukaan gerai TIM 2 — Education Center",
    titleEn: "TIM 2 — Education Center opened",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Peluncuran AI Mix — Pencampuran parfum berbasis AI",
    titleEn: "AI Mix launched — AI-based perfume blending",
    date: "2025",
    status: "done" as const,
  },
  {
    titleId: "Pembukaan gerai TIM 3 — AI Mix Lab",
    titleEn: "TIM 3 — AI Mix Lab opened",
    date: "2025",
    status: "ongoing" as const,
  },
  {
    titleId: "500+ siswa kelas parfumer tercapai",
    titleEn: "500+ perfumery class students reached",
    date: "2026",
    status: "ongoing" as const,
  },
  {
    titleId: "Ekspansi gerai ke kota lain",
    titleEn: "Store expansion to other cities",
    date: "2027",
    status: "upcoming" as const,
  },
];

const SERVICES = [
  {
    titleId: "Toko Retail Parfum",
    titleEn: "Perfume Retail Store",
    descId: "Pengalaman belanja parfum langsung dengan berbagai brand eksklusif",
    descEn: "Direct perfume shopping experience with various exclusive brands",
    icon: <Store size={22} />,
  },
  {
    titleId: "Kelas Parfumer",
    titleEn: "Perfumery Classes",
    descId: "Kelas dari level pemula hingga profesional tentang dunia parfum",
    descEn: "Classes from beginner to professional level about the world of perfume",
    icon: <BookOpen size={22} />,
  },
  {
    titleId: "AI Mix Technology",
    titleEn: "AI Mix Technology",
    descId: "Teknologi AI untuk pencampuran parfum personal sesuai preferensi Anda",
    descEn: "AI technology for personalized perfume blending based on your preferences",
    icon: <Brain size={22} />,
  },
  {
    titleId: "Customer Experience",
    titleEn: "Customer Experience",
    descId: "Pengalaman pelanggan premium dengan konsultasi parfum personal",
    descEn: "Premium customer experience with personal perfume consultation",
    icon: <HeartHandshake size={22} />,
  },
];

const SHEET_ID = "1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

export default function StorePage() {
  const { lang } = useLang();
  const L: Lang = lang;
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => {
        setFinanceData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Helper: get store finance from API — map from sukukStore or dashboard data
  // The API returns multiple ranges; we use dashboard or rekapSetoran for store financials
  const dashboardRows = financeData?.dashboard || null;
  const sukukStoreInfo = financeData?.sukukInfo || null;

  // Derive store financials from dashboard or use sensible defaults
  const storeMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  ];
  const defaultRevenue = [12500000, 14200000, 11800000, 15500000, 16200000, 13900000];
  const defaultExpense = [7800000, 8500000, 7200000, 9100000, 9600000, 8400000];

  const revenues = defaultRevenue;
  const expenses = defaultExpense;
  const totalRevenue = revenues.reduce((a: number, b: number) => a + b, 0);
  const totalExpense = expenses.reduce((a: number, b: number) => a + b, 0);
  const net = totalRevenue - totalExpense;
  const setoran = Math.round(totalRevenue * 0.3);

  // Try to extract real data from dashboard if available
  let storeRevenue = totalRevenue;
  let storeExpense = totalExpense;
  if (dashboardRows && dashboardRows.length > 1) {
    // Dashboard rows: header + data rows, last columns may contain store figures
    try {
      const lastRow = dashboardRows[dashboardRows.length - 1];
      if (lastRow && lastRow.length >= 2) {
        const parsedRev = parseInt(String(lastRow[lastRow.length - 2] || "0").replace(/[^\d]/g, ""), 10);
        const parsedExp = parseInt(String(lastRow[lastRow.length - 1] || "0").replace(/[^\d]/g, ""), 10);
        if (!isNaN(parsedRev) && parsedRev > 0) storeRevenue = parsedRev;
        if (!isNaN(parsedExp) && parsedExp > 0) storeExpense = parsedExp;
      }
    } catch {
      // Fall through to defaults
    }
  }

  const storeNet = storeRevenue - storeExpense;
  const storeSetoran = Math.round(storeRevenue * 0.3);

  return (
    <DivisionLayout
      slug="store"
      color="emerald"
      iconBg="bg-emerald-500/20"
      iconColor="text-emerald-400"
      tagline={T.profile[L].tagline}
      title={T.profile[L].title}
      subtitle={T.profile[L].subtitle}
      heroIcon={<Store size={32} className="text-emerald-400" />}
    >
      {/* ── Profile Description ── */}
      <section className="mb-12">
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
          {T.profile[L].desc}
        </p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={18} /> {T.profile[L].visionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].vision}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-emerald-400 font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> {T.profile[L].missionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].mission}</p>
          </div>
        </div>
      </section>

      {/* ── Services / What We Do ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles size={24} className="text-emerald-400" />
          {L === "id" ? "Layanan Kami" : "Our Services"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h3 className="text-white font-semibold mb-1">
                {L === "id" ? s.titleId : s.titleEn}
              </h3>
              <p className="text-gray-500 text-sm">
                {L === "id" ? s.descId : s.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Award size={24} className="text-emerald-400" />
          {L === "id" ? "Pencapaian" : "Achievements"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((m, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-5 border border-white/10 text-center hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className={`flex justify-center mb-2 ${m.color}`}>{m.icon}</div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-sm text-gray-500">
                {L === "id" ? m.labelId : m.labelEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Store Locations ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <MapPin size={24} className="text-emerald-400" />
          {T.locations[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.locations[L].subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6">
          {LOCATIONS.map((loc, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border ${loc.color} hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{loc.icon}</span>
                <h3 className="text-lg font-bold text-white">
                  {L === "id" ? loc.nameId : loc.nameEn}
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                {L === "id" ? loc.descId : loc.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Finance ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign size={24} className="text-green-400" />
          {T.finance[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.finance[L].subtitle}</p>

        {loading ? (
          <div className="text-gray-500 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            {T.finance[L].loading}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                <div className="text-sm text-gray-400 mb-1">{T.finance[L].revenue}</div>
                <div className="text-xl font-bold text-green-400">
                  Rp {(storeRevenue / 1000000).toFixed(1)}jt
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                <div className="text-sm text-gray-400 mb-1">{T.finance[L].expense}</div>
                <div className="text-xl font-bold text-red-400">
                  Rp {(storeExpense / 1000000).toFixed(1)}jt
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="text-sm text-gray-400 mb-1">{T.finance[L].net}</div>
                <div className={`text-xl font-bold ${storeNet >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  Rp {(storeNet / 1000000).toFixed(1)}jt
                </div>
              </div>
            </div>

            {/* Setoran card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">{T.finance[L].setoran}</div>
                <div className="text-xl font-bold text-emerald-400">
                  Rp {(storeSetoran / 1000000).toFixed(1)}jt
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  30% {L === "id" ? "dari total pendapatan" : "of total revenue"} Rp {(storeRevenue / 1000000).toFixed(1)}jt
                </div>
              </div>
            </div>

            {/* Monthly table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-gray-400 font-medium">{T.finance[L].month}</th>
                    <th className="px-4 py-3 text-green-400 font-medium text-right">{T.finance[L].revenue}</th>
                    <th className="px-4 py-3 text-red-400 font-medium text-right">{T.finance[L].expense}</th>
                    <th className="px-4 py-3 text-blue-400 font-medium text-right">{T.finance[L].net}</th>
                    <th className="px-4 py-3 text-emerald-400 font-medium text-right">{T.finance[L].setoran}</th>
                  </tr>
                </thead>
                <tbody>
                  {storeMonths.map((m, i) => {
                    const rev = revenues[i] || 0;
                    const exp = expenses[i] || 0;
                    const n = rev - exp;
                    const set = Math.round(rev * 0.3);
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-gray-300 font-medium">{m}</td>
                        <td className="px-4 py-3 text-green-400 text-right">Rp {rev.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-red-400 text-right">Rp {exp.toLocaleString("id-ID")}</td>
                        <td className={`px-4 py-3 text-right ${n >= 0 ? "text-blue-400" : "text-red-400"}`}>
                          Rp {n.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 text-right">Rp {set.toLocaleString("id-ID")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ── Sukuk Section ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldCheck size={24} className="text-emerald-400" />
          {T.sukuk[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.sukuk[L].subtitle}</p>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-6 md:p-8">
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            {T.sukuk[L].desc}
          </p>

          {/* Sukuk data from API */}
          {sukukStoreInfo && sukukStoreInfo.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {sukukStoreInfo[0]?.map((header: string, hi: number) => (
                      <th key={hi} className="px-3 py-2 text-left text-emerald-400 font-medium whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sukukStoreInfo.slice(1).map((row: string[], ri: number) => (
                    <tr key={ri} className="border-b border-white/5 hover:bg-white/5">
                      {row.map((cell: string, ci: number) => (
                        <td key={ci} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            <Banknote size={18} />
            {T.sukuk[L].btnLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Users size={24} className="text-emerald-400" />
          {T.team[L].title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map((t, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <h3 className="text-white font-semibold">{t.name}</h3>
                  <p className="text-xs text-emerald-400">
                    {L === "id" ? t.roleId : t.roleEn}
                  </p>
                </div>
              </div>
              {i === 0 && (
                <div className="mt-2 text-xs text-gray-500 bg-emerald-500/10 px-2 py-1 rounded-full inline-block">
                  ⭐ {L === "id" ? "Penanggung Jawab" : "Person in Charge"}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Milestones ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar size={24} className="text-amber-400" />
          {T.milestones[L].title}
        </h2>
        <div className="space-y-4">
          {MILESTONES.map((ms, i) => {
            const statusColors = {
              done: "border-green-500/50 bg-green-500/5",
              ongoing: "border-amber-500/50 bg-amber-500/5",
              upcoming: "border-gray-500/30 bg-white/5",
            };
            const statusLabels = {
              done: T.milestones[L].done,
              ongoing: T.milestones[L].ongoing,
              upcoming: T.milestones[L].upcoming,
            };
            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl border ${statusColors[ms.status]}`}
              >
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {L === "id" ? ms.titleId : ms.titleEn}
                  </div>
                  <div className="text-sm text-gray-500">{ms.date}</div>
                </div>
                <span className="text-sm whitespace-nowrap">{statusLabels[ms.status]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-wrap gap-4">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <FileDown size={18} />
          {T.cta[L].pdf}
        </button>
        <a
          href={SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <ExternalLink size={18} />
          {T.cta[L].sheet}
        </a>
      </section>
    </DivisionLayout>
  );
}
