"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  Code2,
  Cpu,
  Database,
  Bot,
  DollarSign,
  TrendingUp,
  Target,
  FileDown,
  ExternalLink,
  Zap,
  Server,
  BarChart3,
  Users,
  Award,
} from "lucide-react";
import DivisionLayout from "../DivisionLayout";

const T = {
  profile: {
    id: {
      tagline: "Divisi Digital, Sistem & AI",
      title: "Digital",
      subtitle: "& AI",
      desc: "Divisi teknologi yang membangun dan mengelola seluruh sistem digital perusahaan — dari CRM berbasis AppStudio, AI perfume profile, otomasi internal, database customer, hingga dashboard analytics real-time.",
      visionTitle: "Visi",
      vision: "Menjadi perusahaan parfum paling terdigitalisasi di Indonesia dengan AI sebagai core competency.",
      missionTitle: "Misi",
      mission: "AppSheet CRM → AI Perfume Profile → Otomasi Internal → Customer Database → Dashboard Analytics → AI Expansion.",
    },
    en: {
      tagline: "Digital Systems & AI Division",
      title: "Digital",
      subtitle: "& AI",
      desc: "The technology division that builds and manages all digital company systems — from AppStudio-based CRM, AI perfume profile, internal automation, customer database, to real-time analytics dashboard.",
      visionTitle: "Vision",
      vision: "Become the most digitized perfume company in Indonesia with AI as a core competency.",
      missionTitle: "Mission",
      mission: "AppSheet CRM → AI Perfume Profile → Internal Automation → Customer Database → Dashboard Analytics → AI Expansion.",
    },
  },
  systems: {
    id: { title: "Sistem & Platform Aktif", subtitle: "Semua sistem yang dibangun dan dikelola divisi digital" },
    en: { title: "Active Systems & Platforms", subtitle: "All systems built and managed by the digital division" },
  },
  tech: {
    id: { title: "Tech Stack", subtitle: "Teknologi dan tools yang digunakan" },
    en: { title: "Tech Stack", subtitle: "Technologies and tools used" },
  },
  finance: {
    id: { title: "Keuangan Holding", revenue: "Pendapatan", expense: "Pengeluaran", net: "Laba/Rugi Bersih", setoran: "Alokasi Holding", month: "Bulan" },
    en: { title: "Holding Finance", revenue: "Revenue", expense: "Expenses", net: "Net Profit/Loss", setoran: "Holding Allocation", month: "Month" },
  },
  team: {
    id: { title: "Tim Digital", pic: "Penanggung Jawab", role: "Jabatan" },
    en: { title: "Digital Team", pic: "Person in Charge", role: "Role" },
  },
  milestones: {
    id: { title: "Milestone & Roadmap", done: "Selesai", ongoing: "Berjalan", upcoming: "Akan Datang" },
    en: { title: "Milestones & Roadmap", done: "Completed", ongoing: "Ongoing", upcoming: "Upcoming" },
  },
} as const;

const SYSTEMS = [
  {
    name: "AppSheet CRM",
    descId: "Sistem manajemen customer terintegrasi Google Sheets",
    descEn: "Customer management system integrated with Google Sheets",
    icon: <Database size={24} />,
    color: "from-green-500 to-teal-600",
    status: "Aktif",
    uptime: "99.8%",
  },
  {
    name: "AI Perfume Profile",
    descId: "AI rekomendasi parfum berdasarkan preferensi dan mood",
    descEn: "AI perfume recommendation based on preference and mood",
    icon: <Bot size={24} />,
    color: "from-purple-500 to-indigo-600",
    status: "Aktif",
    uptime: "99.5%",
  },
  {
    name: "Dashboard Analytics",
    descId: "Dashboard real-time keuangan, sales, dan KPI",
    descEn: "Real-time finance, sales, and KPI dashboard",
    icon: <BarChart3 size={24} />,
    color: "from-blue-500 to-cyan-600",
    status: "Aktif",
    uptime: "99.9%",
  },
  {
    name: "WhatsApp Automation",
    descId: "Chatbot dan blast message untuk customer",
    descEn: "Chatbot and message blast for customers",
    icon: <Zap size={24} />,
    color: "from-teal-500 to-teal-600",
    status: "Aktif",
    uptime: "99.7%",
  },
  {
    name: "Customer Database",
    descId: "Database terpusat semua customer dan transaksi",
    descEn: "Centralized database of all customers and transactions",
    icon: <Server size={24} />,
    color: "from-orange-500 to-red-600",
    status: "Aktif",
    uptime: "99.9%",
  },
];

const TECH_STACK = [
  { name: "Google AI Studio", kategori: "AI/ML" },
  { name: "AppSheet", kategori: "Low-code" },
  { name: "Google Sheets API", kategori: "Database" },
  { name: "Next.js", kategori: "Frontend" },
  { name: "Vercel", kategori: "Hosting" },
  { name: "Tailwind CSS", kategori: "Styling" },
  { name: "Python", kategori: "Backend/AI" },
  { name: "WhatsApp API", kategori: "Messaging" },
];

const TEAM = [
  { name: "Beriman Juliano", roleId: "Direktur Utama / Lead Developer", roleEn: "President Director / Lead Developer", icon: "👨‍💻", pic: true },
  { name: "Tim Developer", roleId: "Full-stack Development", roleEn: "Full-stack Development", icon: "💻" },
  { name: "Tim AI/ML", roleId: "Machine Learning & Data", roleEn: "Machine Learning & Data", icon: "🤖" },
];

const MILESTONES = [
  { titleId: "Konsep transformasi digital", titleEn: "Digital transformation concept", date: "2023", status: "done" as const },
  { titleId: "AppSheet CRM launch", titleEn: "AppSheet CRM launch", date: "2024", status: "done" as const },
  { titleId: "AI Perfume Profile v1", titleEn: "AI Perfume Profile v1", date: "2025", status: "done" as const },
  { titleId: "Dashboard terintegrasi", titleEn: "Integrated dashboard", date: "2026", status: "ongoing" as const },
  { titleId: "Full otomasi operasional", titleEn: "Full operational automation", date: "2026", status: "ongoing" as const },
  { titleId: "AI expansion — NLP & vision", titleEn: "AI expansion — NLP & vision", date: "2027", status: "upcoming" as const },
  { titleId: "Open API untuk partner", titleEn: "Open API for partners", date: "2028", status: "upcoming" as const },
];

const METRICS = [
  { labelId: "Sistem Aktif", labelEn: "Active Systems", value: "5+", icon: <Cpu size={20} /> },
  { labelId: "Model AI", labelEn: "AI Models", value: "10+", icon: <Bot size={20} /> },
  { labelId: "Profil Customer", labelEn: "Customer Profiles", value: "1.000+", icon: <Users size={20} /> },
  { labelId: "Uptime", labelEn: "Uptime", value: "99.8%", icon: <Award size={20} /> },
];

export default function DigitalPage() {
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

  const hldFinance = financeData?.holding || null;
  const months = hldFinance?.months || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"];
  const revenues = hldFinance?.revenue || [12000000, 13500000, 11800000, 15200000, 16800000, 14500000, 13200000, 17500000];
  const expenses = hldFinance?.expense || [8000000, 8500000, 7800000, 9200000, 9800000, 8700000, 8300000, 10000000];
  const totalRev = revenues.reduce((a: number, b: number) => a + b, 0);
  const totalExp = expenses.reduce((a: number, b: number) => a + b, 0);
  const net = totalRev - totalExp;

  return (
    <DivisionLayout
      slug="digital"
      color="amber"
      iconBg="bg-orange-500/20"
      iconColor="text-orange-400"
      tagline={T.profile[L].tagline}
      title={T.profile[L].title}
      subtitle={T.profile[L].subtitle}
      heroIcon={<Code2 size={32} className="text-orange-400" />}
    >
      {/* Profile */}
      <section className="mb-12">
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">{T.profile[L].desc}</p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={18} /> {T.profile[L].visionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].vision}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center gap-2">
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
              <div className="flex justify-center mb-2 text-orange-400">{m.icon}</div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-sm text-gray-500">{L === "id" ? m.labelId : m.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Systems */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Cpu size={24} className="text-orange-400" />
          {T.systems[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.systems[L].subtitle}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYSTEMS.map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all">
              <div className={`h-1.5 bg-gradient-to-r ${s.color}`} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-orange-400">{s.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">{s.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-3">{L === "id" ? s.descId : s.descEn}</p>
                <div className="text-xs text-gray-500">Uptime: {s.uptime}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Server size={24} className="text-orange-400" />
          {T.tech[L].title}
        </h2>
        <p className="text-gray-500 mb-4">{T.tech[L].subtitle}</p>
        <div className="flex flex-wrap gap-3">
          {TECH_STACK.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:border-orange-500/50 transition-all">
              <div className="text-white font-medium text-sm">{t.name}</div>
              <div className="text-xs text-orange-400">{t.kategori}</div>
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
            <div className="text-xl font-bold text-green-400">Rp {(totalRev / 1000000).toFixed(1)}jt</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].expense}</div>
            <div className="text-xl font-bold text-red-400">Rp {(totalExp / 1000000).toFixed(1)}jt</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].net}</div>
            <div className={`text-xl font-bold ${net >= 0 ? "text-blue-400" : "text-red-400"}`}>
              Rp {(net / 1000000).toFixed(1)}jt
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-gray-400 font-medium">{T.finance[L].month}</th>
                <th className="px-4 py-3 text-green-400 font-medium text-right">{T.finance[L].revenue}</th>
                <th className="px-4 py-3 text-red-400 font-medium text-right">{T.finance[L].expense}</th>
                <th className="px-4 py-3 text-blue-400 font-medium text-right">{T.finance[L].net}</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m: string, i: number) => {
                const rev = revenues[i] || 0;
                const exp = expenses[i] || 0;
                const n = rev - exp;
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-gray-300 font-medium">{m}</td>
                    <td className="px-4 py-3 text-green-400 text-right">Rp {rev.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-red-400 text-right">Rp {exp.toLocaleString("id-ID")}</td>
                    <td className={`px-4 py-3 text-right ${n >= 0 ? "text-blue-400" : "text-red-400"}`}>
                      Rp {n.toLocaleString("id-ID")}
                    </td>
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
          <Target size={24} className="text-orange-400" />
          {T.milestones[L].title}
        </h2>
        <div className="space-y-4">
          {MILESTONES.map((ms, i) => {
            const statusColors = {
              done: "border-green-500/50 bg-green-500/5",
              ongoing: "border-orange-500/50 bg-orange-500/5",
              upcoming: "border-gray-500/30 bg-white/5",
            };
            const statusLabels = {
              done: L === "id" ? "✅ Selesai" : "✅ Completed",
              ongoing: L === "id" ? "🔄 Berjalan" : "🔄 Ongoing",
              upcoming: L === "id" ? "📋 Akan Datang" : "📋 Upcoming",
            };
            return (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${statusColors[ms.status]}`}>
                <div className="flex-1">
                  <div className="text-white font-medium">{L === "id" ? ms.titleId : ms.titleEn}</div>
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
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl transition-colors"
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
          {L === "id" ? "Google Sheet Holding" : "Holding Google Sheet"}
        </a>
      </section>
    </DivisionLayout>
  );
}
