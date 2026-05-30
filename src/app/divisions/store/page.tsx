"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  Store, MapPin, DollarSign, TrendingUp, Target, FileDown, ExternalLink,
  Users, Star, GraduationCap, Sparkles, Calendar, Award, ArrowRight,
  BookOpen, Brain, HeartHandshake, ShieldCheck, Banknote, Package,
  Palette, Lightbulb, AlertTriangle, CheckCircle2, Clock, Rocket, ShoppingBag,
} from "lucide-react";
import DivisionLayout from "../DivisionLayout";

/* ── text dictionary ── */
const T = {
  profile: {
    id: {
      tagline: "Divisi Store & Pengalaman Offline",
      title: "SWI Store",
      subtitle: "TIM Creative Hub",
      desc: "Official Merchandise Store & Scent Experience Hub di Taman Ismail Marzuki. SWI Store bukan sekadar toko parfum — tetapi creative retail hub yang menerjemahkan seni, budaya, dan aroma menjadi pengalaman yang bisa diulang dan dibagikan.",
      vision: "Menjadi official merchandise & scent experience hub yang merepresentasikan TIM dan budaya Jakarta secara modern, artistik, dan bernilai ekonomi.",
      mission: "Kreatif • Kuratif • Teknologi • Kolaboratif → Experience-driven retail.",
    },
    en: {
      tagline: "Store & Offline Experience Division",
      title: "SWI Store",
      subtitle: "TIM Creative Hub",
      desc: "Official Merchandise Store & Scent Experience Hub at Taman Ismail Marzuki. SWI Store is not just a perfume shop — but a creative retail hub that translates art, culture, and scent into repeatable, shareable experiences.",
      vision: "Become the official merchandise & scent experience hub representing TIM and Jakarta culture in a modern, artistic, and economically valuable way.",
      mission: "Creative • Curative • Technology • Collaborative → Experience-driven retail.",
    },
  },
  pillars: {
    id: {
      title: "Empat Pilar Utama",
      subtitle: "Satu ruang retail kreatif dengan empat sumber pendapatan",
      p1: "Merchandise TIM", p1Desc: "Apparel, tas, topi, boneka ondel-ondel, clay, anyaman, karya khas Jakarta yang dikurasi — bukan souvenir murah.",
      p2: "Parfum Experience", p2Desc: "Pengunjung membuat parfum sendiri dengan bantuan staff dan AI system menggunakan 100–400 raw material.",
      p3: "Artisan Showcase", p3Desc: "Etalase sewa bulanan untuk artisan parfum dan kreator lokal, dengan sistem display dan penjualan.",
      p4: "Digital Ecosystem", p4Desc: "POS, inventory, marketplace sensasiwangi.id, database pelanggan, dan software parfum.",
    },
    en: {
      title: "Four Main Pillars",
      subtitle: "One creative retail space with four revenue streams",
      p1: "TIM Merchandise", p1Desc: "Apparel, bags, hats, ondel-ondel dolls, clay, weaving, curated Jakarta crafts — not cheap souvenirs.",
      p2: "Perfume Experience", p2Desc: "Visitors create their own perfume with staff assistance and AI system using 100–400 raw materials.",
      p3: "Artisan Showcase", p3Desc: "Monthly rental display for perfume artisans and local creators, with display and sales system.",
      p4: "Digital Ecosystem", p4Desc: "POS, inventory, sensasiwangi.id marketplace, customer database, and perfume software.",
    },
  },
  layout: {
    id: {
      title: "Layout & Zoning",
      subtitle: "Pembagian fungsi ruang TIM agar experience dan operasional berjalan rapi",
      main: "Area Utama", mainDesc: "Merchandise TIM + parfum display + experience table sebagai wajah utama toko.",
      etalase: "Etalase Sewa", etalaseDesc: "Display modular untuk artisan parfum, craft, clay, anyaman, dan karya lokal.",
      gudang: "Gudang Sempit", gudangDesc: "Rak vertikal, kode inventory, jalur bersih, pemisahan stok parfum/merch.",
      kasir: "Kasir & Digital Hub", kasirDesc: "POS, registrasi workshop, pickup online order, customer database.",
      studio: "Studio SWI", studioDesc: "Studio meracik parfum, kelas offline, test raw material.",
    },
    en: {
      title: "Layout & Zoning",
      subtitle: "TIM space function division for smooth experience and operations",
      main: "Main Area", mainDesc: "TIM merchandise + perfume display + experience table as the store's main face.",
      etalase: "Rental Display", etalaseDesc: "Modular display for perfume artisans, crafts, clay, weaving, and local works.",
      gudang: "Compact Warehouse", gudangDesc: "Vertical racks, inventory codes, clear aisles, perfume/merch stock separation.",
      kasir: "Cashier & Digital Hub", kasirDesc: "POS, workshop registration, online order pickup, customer database.",
      studio: "SWI Studio", studioDesc: "Perfume blending studio, offline classes, raw material testing.",
    },
  },
  keuangan: {
    id: {
      title: "Ringkasan Keuangan",
      subtitle: "Data keuangan SWI Store dari proposal dan Google Sheets",
      capex: "CAPEX Awal", capexDesc: "Fit-out, alat, raw material, sistem, inventory awal",
      opex: "OPEX Bulanan", opexDesc: "SDM, bahan habis pakai, marketing, operasional",
      revenue: "Omzet Realistis", revenueDesc: "2-4 workshop/hari + retail + merch + etalase",
      payback: "Payback Target", paybackDesc: "Skenario konservatif dengan pertumbuhan bertahap",
      base: "Base", stable: "Stable", peak: "Peak/Event",
    },
    en: {
      title: "Financial Summary",
      subtitle: "SWI Store financial data from proposal and Google Sheets",
      capex: "Initial CAPEX", capexDesc: "Fit-out, equipment, raw materials, systems, initial inventory",
      opex: "Monthly OPEX", opexDesc: "HR, consumables, marketing, operations",
      revenue: "Realistic Revenue", revenueDesc: "2-4 workshops/day + retail + merch + display",
      payback: "Payback Target", paybackDesc: "Conservative scenario with gradual growth",
      base: "Base", stable: "Stable", peak: "Peak/Event",
    },
  },
  skema: {
    id: {
      title: "Skema Kerja Sama TIM",
      subtitle: "Revenue share dengan evaluasi berkala",
      revenueShare: "Revenue Share", revenueShareDesc: "10% untuk fase awal, evaluasi berkala setelah bisnis stabil.",
      nonFinansial: "Kontribusi Non-Finansial", nonFinansialDesc: "Aktivasi ruang, konten digital, promosi TIM, platform artisan, pengalaman baru.",
      investor: "Investor Option", investorDesc: "Jika investor masuk, skema profit sharing berbatas waktu, bukan langsung equity.",
      note: "Catatan", noteDesc: "Kami bukan tenant biasa; kami adalah partner aktivasi ruang TIM.",
    },
    en: {
      title: "TIM Partnership Scheme",
      subtitle: "Revenue share with periodic evaluation",
      revenueShare: "Revenue Share", revenueShareDesc: "10% for initial phase, periodic evaluation after business stabilizes.",
      nonFinansial: "Non-Financial Contribution", nonFinansialDesc: "Space activation, digital content, TIM promotion, artisan platform, new experiences.",
      investor: "Investor Option", investorDesc: "If investor joins, time-bound profit sharing scheme, not direct equity.",
      note: "Note", noteDesc: "We are not ordinary tenants; we are TIM space activation partners.",
    },
  },
  proposal: {
    id: {
      title: "Proposal Bisnis TIM",
      subtitle: "Download proposal lengkap SWI Store di Taman Ismail Marzuki",
      desc: "Proposal 16 halaman berisi konsep bisnis lengkap: visi & misi, 4 pilar, layout zoning, proyeksi keuangan, skema kerja sama, dan roadmap implementasi.",
      download: "Download PDF Proposal",
      highlights: "Highlights Proposal",
    },
    en: {
      title: "TIM Business Proposal",
      subtitle: "Download the complete SWI Store proposal at Taman Ismail Marzuki",
      desc: "16-page proposal containing complete business concept: vision & mission, 4 pillars, layout zoning, financial projections, partnership scheme, and implementation roadmap.",
      download: "Download PDF Proposal",
      highlights: "Proposal Highlights",
    },
  },
  roadmap: {
    id: {
      title: "Roadmap & Next Steps", step1: "Finalisasi konsep & RAB", step1Desc: "Layout, vendor, pricing, share TIM",
      step2: "Produksi awal & kurasi artisan", step2Desc: "Merch, scent products, etalase", step3: "Soft Opening", step3Desc: "Validasi traffic, konten, feedback",
      step4: "Launch Resmi", step4Desc: "Event TIM, workshop, marketplace", step5: "Scale", step5Desc: "AI system, B2B, pop-up, kolaborasi",
    },
    en: {
      title: "Roadmap & Next Steps", step1: "Concept finalization & budget", step1Desc: "Layout, vendors, pricing, TIM share",
      step2: "Initial production & artisan curation", step2Desc: "Merch, scent products, displays", step3: "Soft Opening", step3Desc: "Traffic validation, content, feedback",
      step4: "Official Launch", step4Desc: "TIM event, workshop, marketplace", step5: "Scale", step5Desc: "AI system, B2B, pop-up, collaboration",
    },
  },
  produk: {
    id: {
      title: "Kategori Produk",
      subtitle: "Merchandise TIM bernuansa Jakarta — modern, hangat, premium",
      items: "T-shirt, hoodie, topi, apparel official TIM; Tote bag, scarf, pouch motif Betawi modern; Boneka ondel-ondel, collectible art toys; Clay, anyaman, gantungan kunci, postcard, mug, notebook; Karya artisan lokal yang dikurasi",
    },
    en: {
      title: "Product Categories",
      subtitle: "Jakarta-themed TIM merchandise — modern, warm, premium",
      items: "T-shirts, hoodies, hats, official TIM apparel; Tote bags, scarves, Betawi modern motif pouches; Ondel-ondel dolls, collectible art toys; Clay, weaving, keychains, postcards, mugs, notebooks; Curated local artisan works",
    },
  },
};

/* ── CAPEX / OPEX data from proposal ── */
const CAPEX_ITEMS = [
  { labelId: "Fit-out & Renovasi", labelEn: "Fit-out & Renovation", min: 100, max: 200 },
  { labelId: "Peralatan & Furnitur", labelEn: "Equipment & Furniture", min: 50, max: 80 },
  { labelId: "Raw Material Awal", labelEn: "Initial Raw Materials", min: 40, max: 70 },
  { labelId: "Sistem & Software", labelEn: "Systems & Software", min: 30, max: 50 },
  { labelId: "Inventory Merch", labelEn: "Merch Inventory", min: 50, max: 80 },
  { labelId: "Marketing Launch", labelEn: "Launch Marketing", min: 30, max: 70 },
];

const OPEX_ITEMS = [
  { labelId: "SDM (4-6 orang)", labelEn: "HR (4-6 people)", amount: 25 },
  { labelId: "Bahan Habis Pakai", labelEn: "Consumables", amount: 8 },
  { labelId: "Marketing & Konten", labelEn: "Marketing & Content", amount: 7 },
  { labelId: "Utilitas & Maintenance", labelEn: "Utilities & Maintenance", amount: 5 },
];

const SHEET_ID = "1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

/* ── Financial projections from proposal ── */
const FINANCIAL_SCENARIOS = [
  { label: T.keuangan.id.base, enLabel: T.keuangan.en.base, revenue: 60, expense: 45, net: 15 },
  { label: T.keuangan.id.stable, enLabel: T.keuangan.en.stable, revenue: 90, expense: 60, net: 30 },
  { label: T.keuangan.id.peak, enLabel: T.keuangan.en.peak, revenue: 140, expense: 80, net: 60 },
];

export default function StorePage() {
  const { lang } = useLang();
  const L: Lang = lang;
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => { setFinanceData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const sukukStoreInfo = financeData?.sukukInfo || null;

  // CAPEX total
  const capexMin = CAPEX_ITEMS.reduce((a, b) => a + b.min, 0);
  const capexMax = CAPEX_ITEMS.reduce((a, b) => a + b.max, 0);
  const opexTotal = OPEX_ITEMS.reduce((a, b) => a + b.amount, 0);

  return (
    <DivisionLayout
      slug="store" color="emerald"
      iconBg="bg-teal-500/20" iconColor="text-teal-400"
      tagline={T.profile[L].tagline}
      title={T.profile[L].title}
      subtitle={T.profile[L].subtitle}
      heroIcon={<Store size={32} className="text-teal-400" />}
    >
      {/* ── Profile ── */}
      <section className="mb-12">
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">{T.profile[L].desc}</p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-teal-400 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={18} /> {L === "id" ? "Visi" : "Vision"}
            </h3>
            <p className="text-gray-300 text-sm">{T.profile[L].vision}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-teal-400 font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> {L === "id" ? "Misi" : "Mission"}
            </h3>
            <p className="text-gray-300 text-sm">{T.profile[L].mission}</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 italic">
          {L === "id"
            ? '"Kami tidak menjual souvenir budaya. Kami menerjemahkan budaya menjadi pengalaman aroma dan produk kreatif."'
            : '"We don\'t sell cultural souvenirs. We translate culture into scent experiences and creative products."'}
        </p>
      </section>

      {/* ── 4 Pillars ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles size={24} className="text-teal-400" /> {T.pillars[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.pillars[L].subtitle}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Package size={22} />, title: T.pillars[L].p1, desc: T.pillars[L].p1Desc, color: "text-teal-400" },
            { icon: <Brain size={22} />, title: T.pillars[L].p2, desc: T.pillars[L].p2Desc, color: "text-purple-400" },
            { icon: <Palette size={22} />, title: T.pillars[L].p3, desc: T.pillars[L].p3Desc, color: "text-orange-400" },
            { icon: <HeartHandshake size={22} />, title: T.pillars[L].p4, desc: T.pillars[L].p4Desc, color: "text-blue-400" },
          ].map((p, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-teal-500/30 transition-all group">
              <div className={`${p.color} mb-3 group-hover:scale-110 transition-transform`}>{p.icon}</div>
              <h3 className="text-white font-semibold mb-1 text-sm">{p.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Layout Zoning ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <MapPin size={24} className="text-teal-400" /> {T.layout[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.layout[L].subtitle}</p>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: T.layout[L].main, desc: T.layout[L].mainDesc, emoji: "🏪" },
            { name: T.layout[L].etalase, desc: T.layout[L].etalaseDesc, emoji: "🎨" },
            { name: T.layout[L].gudang, desc: T.layout[L].gudangDesc, emoji: "📦" },
            { name: T.layout[L].kasir, desc: T.layout[L].kasirDesc, emoji: "💳" },
            { name: T.layout[L].studio, desc: T.layout[L].studioDesc, emoji: "🧪" },
          ].map((z, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-3xl mb-2">{z.emoji}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{z.name}</h3>
              <p className="text-gray-500 text-xs">{z.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-600 text-center italic">
          {L === "id"
            ? "Tengah = Engagement. Dinding = Monetisasi. Belakang = Efisiensi. Ruang = Pengalaman."
            : "Center = Engagement. Walls = Monetization. Back = Efficiency. Space = Experience."}
        </p>
      </section>

      {/* ── Product Categories ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Package size={24} className="text-teal-400" /> {T.produk[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.produk[L].subtitle}</p>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex flex-wrap gap-3">
            {T.produk[L].items.split("; ").map((item, i) => (
              <span key={i} className="bg-teal-500/10 text-teal-400 px-4 py-2 rounded-full text-sm border border-teal-500/20">
                {item.trim()}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Lightbulb size={14} className="text-orange-400" />
            {L === "id"
              ? "Strategi visual: Jakarta modern, hangat, premium melalui kayu, hitam, emas, dan motif budaya yang disederhanakan."
              : "Visual strategy: Modern, warm, premium Jakarta through wood, black, gold, and simplified cultural motifs."}
          </div>
        </div>
      </section>

      {/* ── Financial Summary from Proposal ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign size={24} className="text-green-400" /> {T.keuangan[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.keuangan[L].subtitle}</p>

        {/* CAPEX & OPEX Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{T.keuangan[L].capex}</div>
            <div className="text-lg font-bold text-orange-400">Rp {capexMin}-{capexMax}jt</div>
            <div className="text-xs text-gray-500 mt-1">{T.keuangan[L].capexDesc}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{T.keuangan[L].opex}</div>
            <div className="text-lg font-bold text-red-400">Rp {opexTotal}jt/bln</div>
            <div className="text-xs text-gray-500 mt-1">{T.keuangan[L].opexDesc}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{T.keuangan[L].revenue}</div>
            <div className="text-lg font-bold text-green-400">Rp 60-120jt/bln</div>
            <div className="text-xs text-gray-500 mt-1">{T.keuangan[L].revenueDesc}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{T.keuangan[L].payback}</div>
            <div className="text-lg font-bold text-blue-400">18-30 bulan</div>
            <div className="text-xs text-gray-500 mt-1">{T.keuangan[L].paybackDesc}</div>
          </div>
        </div>

        {/* CAPEX Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-400" />
            {L === "id" ? "Breakdown CAPEX" : "CAPEX Breakdown"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">{L === "id" ? "Item" : "Item"}</th>
                  <th className="px-4 py-3 text-right text-orange-400 font-medium">Min (jt)</th>
                  <th className="px-4 py-3 text-right text-red-400 font-medium">Max (jt)</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">{L === "id" ? "Progress" : "Progress"}</th>
                </tr>
              </thead>
              <tbody>
                {CAPEX_ITEMS.map((item, i) => {
                  const pct = Math.round(((item.min + item.max) / 2 / capexMax) * 100);
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-gray-300">{L === "id" ? item.labelId : item.labelEn}</td>
                      <td className="px-4 py-3 text-orange-400 text-right">Rp {item.min}jt</td>
                      <td className="px-4 py-3 text-red-400 text-right">Rp {item.max}jt</td>
                      <td className="px-4 py-3">
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-white/20">
                  <td className="px-4 py-3 text-white font-bold">{L === "id" ? "TOTAL" : "TOTAL"}</td>
                  <td className="px-4 py-3 text-orange-400 text-right font-bold">Rp {capexMin}jt</td>
                  <td className="px-4 py-3 text-red-400 text-right font-bold">Rp {capexMax}jt</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* OPEX Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">{L === "id" ? "Breakdown OPEX Bulanan" : "Monthly OPEX Breakdown"}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {OPEX_ITEMS.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-xs text-gray-500">{L === "id" ? item.labelId : item.labelEn}</div>
                <div className="text-lg font-bold text-red-400">Rp {item.amount}jt</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Scenarios */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">{L === "id" ? "Skenario Omzet Bulanan" : "Monthly Revenue Scenarios"}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">{L === "id" ? "Skenario" : "Scenario"}</th>
                  <th className="px-4 py-3 text-right text-green-400 font-medium">{L === "id" ? "Omzet" : "Revenue"}</th>
                  <th className="px-4 py-3 text-right text-red-400 font-medium">{L === "id" ? "Biaya" : "Expenses"}</th>
                  <th className="px-4 py-3 text-right text-blue-400 font-medium">{L === "id" ? "Laba Bersih" : "Net Profit"}</th>
                  <th className="px-4 py-3 text-right text-teal-400 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {FINANCIAL_SCENARIOS.map((s, i) => {
                  const margin = Math.round((s.net / s.revenue) * 100);
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-gray-300 font-medium">{L === "id" ? s.label : s.enLabel}</td>
                      <td className="px-4 py-3 text-green-400 text-right">Rp {s.revenue}jt</td>
                      <td className="px-4 py-3 text-red-400 text-right">Rp {s.expense}jt</td>
                      <td className="px-4 py-3 text-blue-400 text-right font-bold">Rp {s.net}jt</td>
                      <td className="px-4 py-3 text-teal-400 text-right">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Setoran ke Holding */}
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">{L === "id" ? "Setoran ke Holding (30%)" : "Contribution to Holding (30%)"}</div>
            <div className="text-xl font-bold text-teal-400">
              {L === "id" ? "Rp 18-36jt/bulan" : "Rp 18-36jt/month"}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            {L === "id" ? "30% dari omzet Rp 60-120jt/bulan (Base-Stable)" : "30% of Rp 60-120jt/month revenue (Base-Stable)"}
          </div>
        </div>
      </section>

      {/* ── Partnership Scheme ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <HeartHandshake size={24} className="text-teal-400" /> {T.skema[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.skema[L].subtitle}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-5">
            <div className="text-teal-400 font-bold text-2xl mb-1">10%</div>
            <div className="text-sm text-gray-400 mb-2">{T.skema[L].revenueShare}</div>
            <p className="text-xs text-gray-500">{T.skema[L].revenueShareDesc}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex flex-col">
            <div className="text-blue-400 font-bold mb-1">{T.skema[L].nonFinansial}</div>
            <p className="text-xs text-gray-500 flex-1">{T.skema[L].nonFinansialDesc}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex flex-col">
            <div className="text-orange-400 font-bold mb-1">{T.skema[L].investor}</div>
            <p className="text-xs text-gray-500 flex-1">{T.skema[L].investorDesc}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 flex flex-col">
            <div className="text-purple-400 font-bold mb-1">{T.skema[L].note}</div>
            <p className="text-xs text-gray-500 flex-1">{T.skema[L].noteDesc}</p>
          </div>
        </div>

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              {L === "id"
                ? "Asumsi sehat: revenue share 10% pada fase awal. Di atas itu akan memperpanjang ROI dan menekan kualitas experience."
                : "Healthy assumption: 10% revenue share in early phase. Above that would extend ROI and compromise experience quality."}
            </p>
          </div>
        </div>
      </section>

      {/* ── Proposal Download ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <FileDown size={24} className="text-teal-400" /> {T.proposal[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.proposal[L].subtitle}</p>

        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-500/20 rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Proposal_Bisnis_SENSASIWANGI_TIM_Lengkap.pdf</h3>
              <p className="text-gray-400 text-sm mb-4 max-w-xl">{T.proposal[L].desc}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full">16 Halaman</span>
                <span className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full">23.4 MB</span>
                <span className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full">PDF</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-teal-400" /> {T.proposal[L].highlights}
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-400">
              {[L === "id" ? "✅ Konsep bisnis 4 pilar dengan layout zoning detail" : "✅ 4-pillar business concept with detailed layout zoning",
                L === "id" ? "✅ Proyeksi keuangan CAPEX Rp 300-500jt, OPEX Rp 45-80jt/bln" : "✅ Financial projections CAPEX Rp 300-500jt, OPEX Rp 45-80jt/mo",
                L === "id" ? "✅ Skenario omzet: Base Rp 60jt / Stable Rp 90jt / Peak Rp 140jt" : "✅ Revenue scenarios: Base 60jt / Stable 90jt / Peak 140jt",
                L === "id" ? "✅ Skema revenue share 10% + kontribusi non-finansial" : "✅ 10% revenue share + non-financial contribution scheme",
                L === "id" ? "✅ Roadmap 5 langkah: Konsep → Produksi → Soft Open → Launch → Scale" : "✅ 5-step roadmap: Concept → Production → Soft Open → Launch → Scale",
                L === "id" ? "✅ Payback period 18-30 bulan (skenario konservatif)" : "✅ Payback period 18-30 months (conservative scenario)",
              ].map((h, i) => (
                <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2">{h}</div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
            >
              <FileDown size={18} /> {T.proposal[L].download}
            </button>
            <a href={SHEET_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors">
              <ExternalLink size={18} /> {L === "id" ? "Google Sheet Store" : "Store Google Sheet"}
            </a>
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Rocket size={24} className="text-orange-400" /> {T.roadmap[L].title}
        </h2>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { step: 1, title: T.roadmap[L].step1, desc: T.roadmap[L].step1Desc, color: "from-teal-500 to-teal-700", status: "done" },
            { step: 2, title: T.roadmap[L].step2, desc: T.roadmap[L].step2Desc, color: "from-blue-500 to-blue-700", status: "done" },
            { step: 3, title: T.roadmap[L].step3, desc: T.roadmap[L].step3Desc, color: "from-orange-500 to-orange-700", status: "ongoing" },
            { step: 4, title: T.roadmap[L].step4, desc: T.roadmap[L].step4Desc, color: "from-purple-500 to-purple-700", status: "upcoming" },
            { step: 5, title: T.roadmap[L].step5, desc: T.roadmap[L].step5Desc, color: "from-red-500 to-red-700", status: "upcoming" },
          ].map((r, i) => (
            <div key={i} className="relative">
              <div className={`h-1 bg-gradient-to-r ${r.color} rounded-full mb-4`} />
              <div className="flex items-center gap-2 mb-2">
                <span className={`bg-gradient-to-r ${r.color} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center`}>
                  {r.step}
                </span>
                {r.status === "done" && <CheckCircle2 size={16} className="text-green-400" />}
                {r.status === "ongoing" && <Clock size={16} className="text-orange-400" />}
                {r.status === "upcoming" && <Target size={16} className="text-gray-500" />}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{r.title}</h3>
              <p className="text-gray-500 text-xs">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOP Operasional ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen size={24} className="text-teal-400" />
          {L === "id" ? "SOP Operasional Store" : "Store SOP"}
        </h2>
        <p className="text-gray-500 mb-6">
          {L === "id"
            ? "Standar operasional prosedur harian — buka/tutup, kasir, inventory, AI Mix, kelas parfum"
            : "Daily operational procedures — open/close, cashier, inventory, AI Mix, perfume class"}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: <Clock size={20} />, title: L === "id" ? "Buka & Tutup Toko" : "Open & Close", items: ["Pengecekan kebersihan", "Saldo kas awal", "Stok parfum & merch", "Setup booth & display", "Rekonsiliasi kas", "Stock opname bulanan"], color: "text-teal-400" },
            { icon: <Banknote size={20} />, title: L === "id" ? "Proses Kasir" : "Cashier", items: ["Transaksi penjualan", "Refund / exchange", "Cash / QRIS / Transfer", "Setoran kas harian", "Laporan harian ke sheet"], color: "text-blue-400" },
            { icon: <Package size={20} />, title: L === "id" ? "Inventory Management" : "Inventory", items: ["Terima barang Produksi", "Restock display", "Min stok alert (3 unit)", "Stock opname bulanan", "Transfer antar outlet"], color: "text-orange-400" },
            { icon: <Brain size={20} />, title: "AI Mix & Kelas", items: ["Sesi AI Mix 30 menit", "Kelas parfum 60 menit", "Troubleshoot system", "Max 4 orang per sesi", "Max 10 per kelas"], color: "text-purple-400" },
          ].map((cat, i) => (
            <div key={i} className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl p-6">
              <div className={`${cat.color} mb-3`}>{cat.icon}</div>
              <h3 className="text-white font-bold mb-3">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-teal-400 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          * {L === "id" ? "SOP lengkap tersedia di Google Sheet tab SOP_Store" : "Full SOP available in Google Sheet tab SOP_Store"}
        </p>
      </section>

      {/* ── Artisan Program ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <HeartHandshake size={24} className="text-pink-400" />
          {L === "id" ? "Artisan Program" : "Artisan Program"}
        </h2>
        <p className="text-gray-500 mb-6">
          {L === "id"
            ? "Program kemitraan dengan artisan lokal — konsinyasi 70:30, slot terbatas 5 artisan"
            : "Partnership program with local artisans — consignment 70:30, limited 5 artisan slots"}
        </p>
        <div className="grid md:grid-cols-5 gap-3 mb-6">
          {["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"].map((slot, i) => (
            <div key={i} className="bg-gradient-to-br from-pink-500/10 to-purple-500/5 border border-pink-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{["🎨", "🖌️", "🧶", "💎", "✨"][i]}</div>
              <div className="text-white font-bold text-sm">{slot}</div>
              <div className="text-[10px] text-green-400 font-semibold mt-1">🟢 {L === "id" ? "Tersedia" : "Available"}</div>
              <div className="text-[10px] text-gray-600 mt-1">70:30 {L === "id" ? "Konsinyasi" : "Consignment"}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h4 className="text-white font-bold text-sm mb-3">{L === "id" ? "Alur Pendaftaran" : "Registration Flow"}</h4>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: "1", label: L === "id" ? "Aplikasi QR" : "QR Application", color: "text-teal-400" },
              { step: "2", label: L === "id" ? "Submit Sampel" : "Submit Sample", color: "text-blue-400" },
              { step: "3", label: L === "id" ? "Wawancara" : "Interview", color: "text-orange-400" },
              { step: "4", label: L === "id" ? "Kontrak" : "Contract", color: "text-purple-400" },
              { step: "5", label: L === "id" ? "Onboarding" : "Onboarding", color: "text-pink-400" },
              { step: "6", label: L === "id" ? "Go Live" : "Go Live", color: "text-green-400" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 text-xs font-bold ${s.color}`}>{s.step}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Merchandise TIM ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <ShoppingBag size={24} className="text-orange-400" />
          {L === "id" ? "Merchandise TIM" : "TIM Merchandise"}
        </h2>
        <p className="text-gray-500 mb-6">
          {L === "id"
            ? "Produk original SWI Store & Fragrantions — margin 62-73%"
            : "Original SWI Store & Fragrantions products — 62-73% margin"}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { sku: "MERCH-001", name: "T-Shirt SWI Logo", price: "Rp 120.000", margin: "62.5%", color: "from-gray-600 to-gray-800", emoji: "👕", status: "✅" },
            { sku: "MERCH-002", name: "T-Shirt Fragrantions 2026", price: "Rp 150.000", margin: "66.7%", color: "from-teal-600 to-teal-800", emoji: "👕", status: "⏳" },
            { sku: "MERCH-003", name: "Tumbler SWI 500ml", price: "Rp 95.000", margin: "63.2%", color: "from-teal-500 to-cyan-700", emoji: "🥤", status: "✅" },
            { sku: "MERCH-005", name: "Candle 'Scent of Jakarta'", price: "Rp 150.000", margin: "63.3%", color: "from-amber-600 to-amber-800", emoji: "🕯️", status: "✅" },
            { sku: "MERCH-007", name: "Tote Bag SWI Canvas", price: "Rp 75.000", margin: "66.7%", color: "from-stone-500 to-stone-700", emoji: "👜", status: "✅" },
            { sku: "MERCH-009", name: "Gift Set Parfum Mini", price: "Rp 250.000", margin: "66.0%", color: "from-pink-500 to-rose-700", emoji: "🎁", status: "✅" },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl overflow-hidden group hover:border-teal-500/30 transition-all">
              <div className={`h-1 bg-gradient-to-r ${item.color}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className={`text-[10px] font-bold ${item.status === "✅" ? "text-green-400" : "text-orange-400"}`}>{item.status} {item.sku}</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{item.name}</h4>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-lg font-black text-white">{item.price}</span>
                  <span className="text-xs text-teal-400 font-semibold">margin {item.margin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">{L === "id" ? "Total SKU aktif" : "Total active SKU"}</div>
            <div className="text-xl font-black text-white">11 SKU</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{L === "id" ? "Margin rata-rata" : "Average margin"}</div>
            <div className="text-xl font-black text-teal-400">64.8%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{L === "id" ? "Stok total" : "Total stock"}</div>
            <div className="text-xl font-black text-white">375 unit</div>
          </div>
        </div>
      </section>

      {/* ── Sukuk ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldCheck size={24} className="text-teal-400" />
          {L === "id" ? "Sukuk Store" : "Sukuk Store"}
        </h2>
        <p className="text-gray-500 mb-6">
          {L === "id"
            ? "Manajemen investasi syariah untuk ekspansi store dan pengembangan AI Mix"
            : "Islamic investment management for store expansion and AI Mix development"}
        </p>

        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-500/20 rounded-xl p-6 md:p-8">
          {sukukStoreInfo && sukukStoreInfo.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {sukukStoreInfo[0]?.map((header: string, hi: number) => (
                      <th key={hi} className="px-3 py-2 text-left text-teal-400 font-medium whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sukukStoreInfo.slice(1).map((row: string[], ri: number) => (
                    <tr key={ri} className="border-b border-white/5 hover:bg-white/5">
                      {row.map((cell: string, ci: number) => (
                        <td key={ci} className="px-3 py-2 text-gray-300 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link href="/dashboard"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition-colors font-medium">
            <Banknote size={18} /> {L === "id" ? "Buka Dashboard Sukuk" : "Open Sukuk Dashboard"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-wrap gap-4">
        <button onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition-colors">
          <FileDown size={18} /> {L === "id" ? "Download PDF Profil" : "Download Profile PDF"}
        </button>
        <a href={SHEET_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors">
          <ExternalLink size={18} /> {L === "id" ? "Google Sheet Store" : "Store Google Sheet"}
        </a>
      </section>
    </DivisionLayout>
  );
}
