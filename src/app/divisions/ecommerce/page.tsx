"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  Globe,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Target,
  FileDown,
  ExternalLink,
  Users,
  Award,
  ChevronRight,
  ArrowRight,
  Store,
  BarChart3,
  CreditCard,
  Headphones,
  Sparkles,
  PackageCheck,
  Truck,
} from "lucide-react";
import DivisionLayout from "../DivisionLayout";

/* ── text dictionary ── */
const T = {
  profile: {
    id: {
      tagline: "Divisi Ecommerse & Marketplace",
      title: "Ecommerse",
      subtitle: "& Marketplace",
      desc: "Divisi Ecommerse & Marketplace mengelola platform digital sensasiwangi.id — marketplace parfum Indonesia yang menghubungkan produk, layanan, dan pengalaman fragrance dalam satu ekosistem online. Platform ini menjadi tulang punggung transaksi digital, repeat order, dan customer engagement PT SWI.",
      visionTitle: "Visi",
      vision: "Menjadi marketplace parfum terdepan di Indonesia yang menghubungkan kreator, penjual, dan pecinta parfum dalam satu platform digital terintegrasi.",
      missionTitle: "Misi",
      mission: "Pengembangan platform → Onboarding seller & brand → Customer experience → Analytics & growth → Monetisasi marketplace.",
    },
    en: {
      tagline: "Ecommerse & Marketplace Division",
      title: "Ecommerse",
      subtitle: "& Marketplace",
      desc: "The Ecommerse & Marketplace division manages the sensasiwangi.id digital platform — an Indonesian fragrance marketplace connecting products, services, and fragrance experiences in one online ecosystem. This platform is the backbone of digital transactions, repeat orders, and customer engagement for PT SWI.",
      visionTitle: "Vision",
      vision: "Become Indonesia's leading fragrance marketplace connecting creators, sellers, and perfume enthusiasts in one integrated digital platform.",
      missionTitle: "Mission",
      mission: "Platform development → Seller & brand onboarding → Customer experience → Analytics & growth → Marketplace monetization.",
    },
  },
  features: {
    id: { title: "Fitur Platform", subtitle: "Fitur utama yang tersedia di sensasiwangi.id" },
    en: { title: "Platform Features", subtitle: "Key features available on sensasiwangi.id" },
  },
  finance: {
    id: { title: "Keuangan Ecommerse", revenue: "Pendapatan", expense: "Pengeluaran", net: "Laba/Rugi Bersih", setoran: "Setoran ke Holding (30%)", month: "Bulan" },
    en: { title: "Ecommerse Finance", revenue: "Revenue", expense: "Expenses", net: "Net Profit/Loss", setoran: "Contribution to Holding (30%)", month: "Month" },
  },
  team: {
    id: { title: "Tim Ecommerse", pic: "Penanggung Jawab", role: "Jabatan" },
    en: { title: "Ecommerse Team", pic: "Person in Charge", role: "Role" },
  },
  milestones: {
    id: { title: "Milestone & Roadmap", done: "Selesai", ongoing: "Berjalan", upcoming: "Akan Datang" },
    en: { title: "Milestones & Roadmap", done: "Completed", ongoing: "Ongoing", upcoming: "Upcoming" },
  },
  stats: {
    id: { title: "Statistik Platform", subtitle: "Data performa marketplace sensasiwangi.id" },
    en: { title: "Platform Statistics", subtitle: "sensasiwangi.id marketplace performance data" },
  },
  cta: {
    id: { downloadPdf: "Download PDF Profil", visitMarketplace: "Kunjungi sensasiwangi.id", googleSheet: "Google Sheet Ecommerse" },
    en: { downloadPdf: "Download Profile PDF", visitMarketplace: "Visit sensasiwangi.id", googleSheet: "Ecommerse Google Sheet" },
  },
} as const;

/* ── static data ── */
const FEATURES = [
  {
    icon: <ShoppingCart size={24} />,
    titleId: "Katalog Produk",
    titleEn: "Product Catalog",
    descId: "Jelajahi seluruh produk brand SWI dengan informasi detail, foto, dan review.",
    descEn: "Browse the complete SWI brand product catalog with detailed info, photos, and reviews.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: <CreditCard size={24} />,
    titleId: "Booking & Checkout",
    titleEn: "Booking & Checkout",
    descId: "Pesan kelas, workshop, atau produk parfum secara online dengan pembayaran aman.",
    descEn: "Book classes, workshops, or order perfume products online with secure payment.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: <Sparkles size={24} />,
    titleId: "AI Scent Recommendation",
    titleEn: "AI Scent Recommendation",
    descId: "Rekomendasi parfum personal berdasarkan AI analysis preferensi aroma.",
    descEn: "Personalized perfume recommendations based on AI analysis of scent preferences.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: <Headphones size={24} />,
    titleId: "Customer Support",
    titleEn: "Customer Support",
    descId: "Layanan pelanggan responsif melalui WhatsApp, chat, dan email.",
    descEn: "Responsive customer service via WhatsApp, chat, and email.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: <Truck size={24} />,
    titleId: "Pengiriman Nasional",
    titleEn: "Nationwide Shipping",
    descId: "Pengiriman ke seluruh Indonesia dengan berbagai pilihan ekspedisi.",
    descEn: "Shipping across Indonesia with multiple courier options.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: <PackageCheck size={24} />,
    titleId: "Seller Dashboard",
    titleEn: "Seller Dashboard",
    descId: "Dashboard penjual untuk mengelola produk, pesanan, dan analytics.",
    descEn: "Seller dashboard to manage products, orders, and analytics.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

const TEAM = [
  { name: "Beriman Juliano", roleId: "Penanggung Jawab / PIC Ecommerse", roleEn: "Person in Charge / Ecommerse PIC", icon: "👨‍💼" },
  { name: "Tim Developer", roleId: "Pengembangan Platform & Teknis", roleEn: "Platform Development & Technical", icon: "💻" },
  { name: "Tim Content", roleId: "Konten & Katalog Produk", roleEn: "Content & Product Catalog", icon: "📸" },
  { name: "Tim CS & Support", roleId: "Customer Service & Support", roleEn: "Customer Service & Support", icon: "🎧" },
];

const MILESTONES = [
  {
    titleId: "Riset & perencanaan marketplace",
    titleEn: "Marketplace research & planning",
    date: "2023",
    status: "done" as const,
  },
  {
    titleId: "Pengembangan MVP sensasiwangi.id",
    titleEn: "MVP development of sensasiwangi.id",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Soft launch marketplace",
    titleEn: "Marketplace soft launch",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Integrasi pembayaran digital",
    titleEn: "Digital payment integration",
    date: "2025",
    status: "done" as const,
  },
  {
    titleId: "Fitur AI Scent Recommendation",
    titleEn: "AI Scent Recommendation feature",
    date: "2025",
    status: "ongoing" as const,
  },
  {
    titleId: "Onboarding 50+ seller",
    titleEn: "Onboarding 50+ sellers",
    date: "2026",
    status: "ongoing" as const,
  },
  {
    titleId: "Mobile app launch",
    titleEn: "Mobile app launch",
    date: "2027",
    status: "upcoming" as const,
  },
  {
    titleId: "Ekspansi regional ASEAN",
    titleEn: "ASEAN regional expansion",
    date: "2027",
    status: "upcoming" as const,
  },
];

const METRICS = [
  {
    labelId: "Produk Terdaftar",
    labelEn: "Listed Products",
    value: "100+",
    icon: <ShoppingCart size={20} />,
  },
  {
    labelId: "Pengguna Terdaftar",
    labelEn: "Registered Users",
    value: "1,200+",
    icon: <Users size={20} />,
  },
  {
    labelId: "Transaksi",
    labelEn: "Transactions",
    value: "3,500+",
    icon: <BarChart3 size={20} />,
  },
  {
    labelId: "Rating Platform",
    labelEn: "Platform Rating",
    value: "4.6/5",
    icon: <Award size={20} />,
  },
];

const PLATFORM_STATS = [
  { labelId: "Total Seller", labelEn: "Total Sellers", value: "15+" },
  { labelId: "Kategori Produk", labelEn: "Product Categories", value: "8" },
  { labelId: "Kota Terjangkau", labelEn: "Cities Covered", value: "25+" },
  { labelId: "Repeat Order Rate", labelEn: "Repeat Order Rate", value: "35%" },
  { labelId: "Avg. Order Value", labelEn: "Avg. Order Value", value: "Rp 250K" },
  { labelId: "Monthly Visitors", labelEn: "Monthly Visitors", value: "5,000+" },
];

export default function EcommercePage() {
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

  // Helper: get ecommerce finance from API (with fallback defaults)
  const ecoFinance = financeData?.ecommerce || null;
  const months =
    ecoFinance?.months || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"];
  const revenues = ecoFinance?.revenue || [4200000, 5100000, 4800000, 6200000, 5900000, 7100000, 6500000, 7800000];
  const expenses = ecoFinance?.expense || [2800000, 3200000, 2900000, 3500000, 3100000, 3800000, 3400000, 4100000];
  const totals = {
    revenue: revenues.reduce((a: number, b: number) => a + b, 0),
    expense: expenses.reduce((a: number, b: number) => a + b, 0),
  };
  totals.revenue = totals.revenue || 47600000;
  totals.expense = totals.expense || 26800000;
  const net = totals.revenue - totals.expense;
  const setoran = Math.round(totals.revenue * 0.3);

  return (
    <DivisionLayout
      slug="ecommerce"
      color="cyan"
      iconBg="bg-cyan-500/20"
      iconColor="text-cyan-400"
      tagline={T.profile[L].tagline}
      title={T.profile[L].title}
      subtitle={T.profile[L].subtitle}
      heroIcon={<Globe size={32} className="text-cyan-400" />}
    >
      {/* Profile Description */}
      <section className="mb-12">
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
          {T.profile[L].desc}
        </p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-cyan-400 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={18} /> {T.profile[L].visionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].vision}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-cyan-400 font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> {T.profile[L].missionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].mission}</p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((m, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">
              <div className="flex justify-center mb-2 text-cyan-400">{m.icon}</div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-sm text-gray-500">{L === "id" ? m.labelId : m.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Store size={24} className="text-cyan-400" />
          {T.features[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.features[L].subtitle}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <div className={`${f.bg} ${f.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {L === "id" ? f.titleId : f.titleEn}
              </h3>
              <p className="text-gray-400 text-sm">
                {L === "id" ? f.descId : f.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Finance */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign size={24} className="text-green-400" />
          {T.finance[L].title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].revenue}</div>
            <div className="text-xl font-bold text-green-400">
              Rp {(totals.revenue / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].expense}</div>
            <div className="text-xl font-bold text-red-400">
              Rp {(totals.expense / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].net}</div>
            <div className={`text-xl font-bold ${net >= 0 ? "text-blue-400" : "text-red-400"}`}>
              Rp {(net / 1000000).toFixed(1)}jt
            </div>
          </div>
        </div>

        {/* Setoran card */}
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].setoran}</div>
            <div className="text-xl font-bold text-cyan-400">Rp {(setoran / 1000000).toFixed(1)}jt</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              30% dari total pendapatan Rp {(totals.revenue / 1000000).toFixed(1)}jt
            </div>
          </div>
        </div>

        {/* Monthly table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-gray-400 font-medium">{T.finance[L].month}</th>
                <th className="px-4 py-3 text-green-400 font-medium text-right">{T.finance[L].revenue}</th>
                <th className="px-4 py-3 text-red-400 font-medium text-right">{T.finance[L].expense}</th>
                <th className="px-4 py-3 text-blue-400 font-medium text-right">{T.finance[L].net}</th>
                <th className="px-4 py-3 text-cyan-400 font-medium text-right">{T.finance[L].setoran}</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m: string, i: number) => {
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
                    <td className="px-4 py-3 text-cyan-400 text-right">Rp {set.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <BarChart3 size={24} className="text-cyan-400" />
          {T.stats[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.stats[L].subtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PLATFORM_STATS.map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-xl font-bold text-cyan-400">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{L === "id" ? s.labelId : s.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Users size={24} className="text-cyan-400" />
          {T.team[L].title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map((t, i) => (
            <div
              key={i}
              className={`bg-white/5 rounded-xl p-5 border text-center transition-all duration-300 hover:scale-105 ${
                i === 0
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : "border-white/10"
              }`}
            >
              <div className="text-4xl mb-3">{t.icon}</div>
              <h3 className="text-white font-bold text-base mb-1">{t.name}</h3>
              <p className="text-sm text-gray-400">
                {L === "id" ? t.roleId : t.roleEn}
              </p>
              {i === 0 && (
                <span className="inline-block mt-2 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                  {T.team[L].pic}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Target size={24} className="text-amber-400" />
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
              done: L === "id" ? "✅ Selesai" : "✅ Completed",
              ongoing: L === "id" ? "🔄 Berjalan" : "🔄 Ongoing",
              upcoming: L === "id" ? "📋 Akan Datang" : "📋 Upcoming",
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
                <span className="text-sm">{statusLabels[ms.status]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-wrap gap-4">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <FileDown size={18} />
          {T.cta[L].downloadPdf}
        </button>
        <a
          href="https://sensasiwangi.id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <ExternalLink size={18} />
          {T.cta[L].visitMarketplace}
        </a>
        <a
          href="https://docs.google.com/spreadsheets/d/1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA/edit#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <ExternalLink size={18} />
          {T.cta[L].googleSheet}
        </a>
      </section>
    </DivisionLayout>
  );
}
