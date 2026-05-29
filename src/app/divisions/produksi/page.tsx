"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  FlaskConical,
  Package,
  DollarSign,
  TrendingUp,
  Target,
  FileDown,
  ExternalLink,
  Users,
  ShoppingCart,
  Award,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import DivisionLayout from "../DivisionLayout";

/* ── text dictionary ── */
const T = {
  profile: {
    id: {
      tagline: "Divisi Produksi & Brand",
      title: "Production",
      subtitle: "& Brands",
      desc: "Divisi inti yang merancang, merumuskan, dan memproduksi semua produk parfum PT SWI. Meliputi riset formula, pengadaan bahan baku, produksi, quality control, packaging, dan manajemen brand portfolio!",
      visionTitle: "Visi",
      vision: "Menjadi produsen parfum lokal terkemuka dengan formula original yang diakui nasional dan internasional.",
      missionTitle: "Misi",
      mission: "Riset formula original → Produksi berkelanjutan → Quality control ketat → Packaging premium → Brand building berkelanjutan.",
    },
    en: {
      tagline: "Production & Brand Division",
      title: "Production",
      subtitle: "& Brands",
      desc: "The core division that designs, formulates, and produces all PT SWI perfume products. Covers formula research, raw material sourcing, production, quality control, packaging, and brand portfolio management!",
      visionTitle: "Vision",
      vision: "Become a leading local perfume manufacturer with original formulas recognized nationally and internationally.",
      missionTitle: "Mission",
      mission: "Original formula research → Sustainable production → Strict quality control → Premium packaging → Continuous brand building.",
    },
  },
  brands: {
    id: { title: "Brand Portfolio", subtitle: "Semua brand yang dikelola divisi produksi" },
    en: { title: "Brand Portfolio", subtitle: "All brands managed by the production division" },
  },
  finance: {
    id: { title: "Keuangan Produksi", revenue: "Pendapatan", expense: "Pengeluaran", net: "Laba/Rugi Bersih", setoran: "Setoran ke Holding (30%)", month: "Bulan" },
    en: { title: "Production Finance", revenue: "Revenue", expense: "Expenses", net: "Net Profit/Loss", setoran: "Contribution to Holding (30%)", month: "Month" },
  },
  team: {
    id: { title: "Tim Produksi", pic: "Penanggung Jawab", role: "Jabatan" },
    en: { title: "Production Team", pic: "Person in Charge", role: "Role" },
  },
  milestones: {
    id: { title: "Milestone & Roadmap", done: "Selesai", ongoing: "Berjalan", upcoming: "Akan Datang" },
    en: { title: "Milestones & Roadmap", done: "Completed", ongoing: "Ongoing", upcoming: "Upcoming" },
  },
} as const;

/* ── static data ── */
const BRANDS = [
  {
    name: "Larc-en-Scent",
    category: "Parfum Original",
    descId: "Brand flagship parfum original Indonesia dengan formula eksklusif",
    descEn: "Flagship original Indonesian perfume brand with exclusive formulas",
    color: "from-purple-600 to-indigo-600",
    icon: "🌸",
    products: 12,
    rating: 4.8,
  },
  {
    name: "Nuscentza",
    category: "Parfum Inspirasi",
    descId: "Parfum terinspirasi dari aroma Nusantara",
    descEn: "Perfume inspired by the aromas of the Indonesian archipelago",
    color: "from-amber-500 to-orange-600",
    icon: "🌺",
    products: 8,
    rating: 4.6,
  },
  {
    name: "Pixel Potion",
    category: "Parfum Lifestyle",
    descId: "Parfum kreatif & eclectic untuk generasi muda",
    descEn: "Creative & eclectic perfume for the younger generation",
    color: "from-cyan-500 to-blue-600",
    icon: "🧪",
    products: 5,
    rating: 4.5,
  },
];

const TEAM = [
  { name: "Beriman Juliano", roleId: "Direktur Utama / Formulator", roleEn: "President Director / Formulator", icon: "👨‍🔬" },
  { name: "Tim Produksi", roleId: "Quality Control & Operasional", roleEn: "Quality Control & Operations", icon: "🏭" },
  { name: "Tim Packaging", roleId: "Desain & Kemasan", roleEn: "Design & Packaging", icon: "📦" },
];

const MILESTONES = [
  {
    titleId: "Risket formula original dimulai",
    titleEn: "Original formula research started",
    date: "2023",
    status: "done" as const,
  },
  {
    titleId: "Peluncuran Larc-en-Scent",
    titleEn: "Larc-en-Scent launch",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Peluncuran Nuscentza",
    titleEn: "Nuscentza launch",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Peluncuran Pixel Potion",
    titleEn: "Pixel Potion launch",
    date: "2025",
    status: "done" as const,
  },
  {
    titleId: "ISO/Quality Certification",
    titleEn: "ISO/Quality Certification",
    date: "2026",
    status: "ongoing" as const,
  },
  {
    titleId: "Ekspor perdana",
    titleEn: "First export",
    date: "2027",
    status: "upcoming" as const,
  },
  {
    titleId: "Pabrik mandiri",
    titleEn: "Own production facility",
    date: "2028",
    status: "upcoming" as const,
  },
];

const METRICS = [
  {
    labelId: "Total Brand", labelEn: "Total Brands",
    value: "3", icon: <FlaskConical size={20} />,
  },
  {
    labelId: "Total Produk", labelEn: "Total Products",
    value: "25+", icon: <Package size={20} />,
  },
  {
    labelId: "Pelanggan Aktif", labelEn: "Active Customers",
    value: "500+", icon: <Users size={20} />,
  },
  {
    labelId: "Rating Rata-rata", labelEn: "Average Rating",
    value: "4.7/5", icon: <Award size={20} />,
  },
];

export default function ProduksiPage() {
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

  // Helper: get production finance from API
  const prodFinance = financeData?.produksi || null;
  const months =
    prodFinance?.months || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"];
  const revenues = prodFinance?.revenue || [8500000, 9200000, 7800000, 10500000, 11200000, 9800000];
  const expenses = prodFinance?.expense || [5200000, 5800000, 4900000, 6100000, 6500000, 5700000];
  const totals = {
    revenue: revenues.reduce((a: number, b: number) => a + b, 0),
    expense: expenses.reduce((a: number, b: number) => a + b, 0),
  };
  totals.revenue = totals.revenue || 57000000;
  totals.expense = totals.expense || 34200000;
  const net = totals.revenue - totals.expense;
  const setoran = Math.round(totals.revenue * 0.3);

  return (
    <DivisionLayout
      slug="produksi"
      color="purple"
      iconBg="bg-purple-500/20"
      iconColor="text-purple-400"
      tagline={T.profile[L].tagline}
      title={T.profile[L].title}
      subtitle={T.profile[L].subtitle}
      heroIcon={<FlaskConical size={32} className="text-purple-400" />}
    >
      {/* Profile Description */}
      <section className="mb-12">
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
          {T.profile[L].desc}
        </p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-purple-400 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={18} /> {T.profile[L].visionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].vision}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-purple-400 font-bold text-lg mb-3 flex items-center gap-2">
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
              <div className="flex justify-center mb-2 text-purple-400">{m.icon}</div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-sm text-gray-500">{L === "id" ? m.labelId : m.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <FlaskConical size={24} className="text-purple-400" />
          {T.brands[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.brands[L].subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6">
          {BRANDS.map((b, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden group hover:border-purple-500/50 transition-all duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${b.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{b.name}</h3>
                    <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                      {b.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {L === "id" ? b.descId : b.descEn}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    <Package size={14} className="inline mr-1" />
                    {b.products} produk
                  </span>
                  <span className="text-yellow-400">
                    ★ {b.rating}
                  </span>
                </div>
              </div>
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
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].setoran}</div>
            <div className="text-xl font-bold text-purple-400">Rp {(setoran / 1000000).toFixed(1)}jt</div>
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
                <th className="px-4 py-3 text-purple-400 font-medium text-right">{T.finance[L].setoran}</th>
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
                    <td className="px-4 py-3 text-purple-400 text-right">Rp {set.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <FileDown size={18} />
          {L === "id" ? "Download PDF Profil" : "Download Profile PDF"}
        </button>
        <a
          href="https://docs.google.com/spreadsheets/d/1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA/edit#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <ExternalLink size={18} />
          {L === "id" ? "Google Sheet Produksi" : "Production Google Sheet"}
        </a>
      </section>
    </DivisionLayout>
  );
}
