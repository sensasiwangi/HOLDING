"use client";

import { Sparkles, ArrowLeft, Star, Package, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const BRAND_DETAIL = {
  name: "L'Arc~en~Scent",
  emoji: "🌸",
  gradient: "from-purple-600 to-indigo-600",
  accent: "purple",
  tagline: { id: "Parfum Artistik untuk Jiwa Kreatif", en: "Artistic Perfume for Creative Souls" },
  desc: {
    id: "L'Arc~en~Scent adalah brand parfum premium yang terinspirasi dari seni, kreativitas, dan keindahan Parisian. Setiap fragrances dibuat dengan bahan-bahan berkualitas tinggi dan diproduksi secara artisanal di Indonesia. Brand ini menargetkan profesional kreatif, seniman, dan pencari pengalaman parfum yang personal dan unik.",
    en: "L'Arc~en~Scent is a premium perfume brand inspired by art, creativity, and Parisian beauty. Each fragrance is crafted with high-quality ingredients and produced artisansally in Indonesia. The brand targets creative professionals, artists, and seekers of personal and unique perfume experiences.",
  },
  stats: [
    { label: { id: "Produk Aktif", en: "Active Products" }, value: "12 SKU" },
    { label: { id: "Rating Pelanggan", en: "Customer Rating" }, value: "4.8 ★" },
    { label: { id: "Target Pasar", en: "Target Market" }, value: "Premium" },
    { label: { id: "Harga Range", en: "Price Range" }, value: "Rp 150-500rb" },
  ],
  categories: [
    { name: { id: "Eau de Parfum", en: "Eau de Parfum" }, desc: { id: "Konsentrasi 15-20%, tahan 6-8 jam", en: "15-20% concentration, lasts 6-8 hours" }, min: 250000, max: 500000 },
    { name: { id: "Eau de Toilette", en: "Eau de Toilette" }, desc: { id: "Konsentrasi 8-15%, tahan 4-6 jam", en: "8-15% concentration, lasts 4-6 hours" }, min: 150000, max: 300000 },
    { name: { id: "Body Mist", en: "Body Mist" }, desc: { id: "Konsentrasi 3-5%, tahan 2-3 jam", en: "3-5% concentration, lasts 2-3 hours" }, min: 80000, max: 150000 },
    { name: { id: "Roll-On", en: "Roll-On" }, desc: { id: "Portable, konsentrasi 5-10%", en: "Portable, 5-10% concentration" }, min: 60000, max: 120000 },
  ],
  ingredients: [
    "Rose de Mai", "Jasmine Sambac", "Oud", "Sandalwood",
    "Bergamot", "Vanilla Madagascar", "Amber", "Musk White",
  ],
  milestones: [
    { date: "2023-Q3", event: { id: "Brand Launch", en: "Brand Launch" }, done: true },
    { date: "2023-Q4", event: { id: "Produk 5 SKU pertama", en: "First 5 SKU products" }, done: true },
    { date: "2024-Q1", event: { id: "Terdaftar HKI Merek", en: "Trademark Registered" }, done: true },
    { date: "2024-Q2", event: { id: "Ekspansi ke Store TIM", en: "Expand to TIM Store" }, done: true },
    { date: "2024-Q3", event: { id: "White Label B2B Launch", en: "White Label B2B Launch" }, done: false },
    { date: "2025-Q1", event: { id: "Distributor Nasional", en: "National Distributor" }, done: false },
  ],
};

function fmt(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function ArcEnScentPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[150px] animate-float1" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-[100px] animate-float2" />

        <div className="relative max-w-6xl mx-auto px-6">
          <Link href="/brands" className="inline-flex items-center gap-2 text-sm text-[#7a9e8f] hover:text-white transition mb-6">
            <ArrowLeft size={16} /> <span>{lang === "id" ? "Kembali ke Brands" : "Back to Brands"}</span>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{BRAND_DETAIL.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">L'Arc~en~Scent</p>
              <h1 className="text-4xl md:text-5xl font-black">{tt(BRAND_DETAIL.tagline, lang)}</h1>
            </div>
          </div>
          <p className="text-lg text-[#7a9e8f] max-w-3xl leading-relaxed">{tt(BRAND_DETAIL.desc, lang)}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRAND_DETAIL.stats.map((s, i) => (
              <div key={i} className="card-luxury p-6 text-center">
                <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs text-[#7a9e8f]">{tt(s.label, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Package size={24} className="text-purple-400" />
            {lang === "id" ? "Kategori Produk" : "Product Categories"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BRAND_DETAIL.categories.map((cat, i) => (
              <div key={i} className="card-luxury group hover:border-purple-500/30 transition-all">
                <div className="h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
                <div className="p-6">
                  <h3 className="font-bold text-white mb-2">{tt(cat.name, lang)}</h3>
                  <p className="text-xs text-[#7a9e8f] mb-4">{tt(cat.desc, lang)}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-purple-400">{fmt(cat.min)}</span>
                    <span className="text-xs text-[#5d7068]">— {fmt(cat.max)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Ingredients */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-6">✨ {lang === "id" ? "Bahan Kunci" : "Key Ingredients"}</h2>
          <div className="flex flex-wrap gap-3">
            {BRAND_DETAIL.ingredients.map((ing, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-300">
                {ing}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <TrendingUp size={24} className="text-purple-400" />
            {lang === "id" ? "Roadmap Brand" : "Brand Roadmap"}
          </h2>
          <div className="space-y-4">
            {BRAND_DETAIL.milestones.map((ms, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                ms.done ? "bg-purple-500/5 border-purple-500/20" : "bg-white/3 border-white/5"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  ms.done ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-[#5d7068]"
                }`}>
                  {ms.done ? "✓" : "○"}
                </div>
                <div>
                  <div className="text-xs text-[#5d7068] mb-0.5">{ms.date}</div>
                  <div className={`font-bold ${ms.done ? "text-purple-300" : "text-[#7a9e8f]"}`}>{tt(ms.event, lang)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/divisions/produksi" className="btn-luxury inline-flex items-center gap-2">
            <Sparkles size={16} />
            {lang === "id" ? "Lihat Divisi Produksi" : "View Production Division"}
            <ExternalLink size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
