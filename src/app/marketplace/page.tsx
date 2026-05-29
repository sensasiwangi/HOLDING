"use client";

import { ShoppingBag, CalendarCheck, Bot, Headset, Star, Globe, Zap } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const features = [
  { icon: <ShoppingBag size={22} />, titleId: "Katalog Produk", titleEn: "Product Catalog", descId: "Jelajahi seluruh produk brand SWI dengan informasi detail.", descEn: "Browse the complete SWI brand product catalog.", color: "text-emerald-400" },
  { icon: <CalendarCheck size={22} />, titleId: "Booking & Checkout", titleEn: "Booking & Checkout", descId: "Pesan kelas, workshop, atau produk parfum secara online.", descEn: "Book classes, workshops, or order perfume products online.", color: "text-blue-400" },
  { icon: <Bot size={22} />, titleId: "AI Scent Recommendation", titleEn: "AI Scent Recommendation", descId: "Rekomendasi parfum personal berbasis AI.", descEn: "AI-based personalized perfume recommendation.", color: "text-purple-400" },
  { icon: <Headset size={22} />, titleId: "Customer Support", titleEn: "Customer Support", descId: "Layanan pelanggan responsif via WhatsApp dan chat.", descEn: "Responsive customer service via WhatsApp and chat.", color: "text-amber-400" },
];

const stats = [
  { value: "100+", label: tt({ id: "Produk Terdaftar", en: "Listed Products" }, "id"), icon: "📦" },
  { value: "50+", label: tt({ id: "Brand Partner", en: "Brand Partners" }, "id"), icon: "🤝" },
  { value: "1.2K+", label: tt({ id: "Pengguna Aktif", en: "Active Users" }, "id"), icon: "👥" },
  { value: "4.6", label: tt({ id: "Rating Platform", en: "Platform Rating" }, "id"), icon: "⭐" },
];

export default function MarketplacePage() {
  const { lang } = useLang();

  const eyebrow = { id: "Marketplace Digital", en: "Digital Marketplace" };
  const title = { id: "sensasiwangi.id", en: "sensasiwangi.id" };
  const subtitle = {
    id: "Platform marketplace parfum Indonesia — katalog lengkap, booking kelas, dan AI scent recommendation.",
    en: "Indonesia's perfume marketplace platform — complete catalog, class booking, and AI scent recommendation.",
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float1" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] animate-float2" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6 animate-fade-up">
            <Globe size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">{tt(eyebrow, lang)}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient-brand">{tt(title, lang)}</span>
          </h1>
          <p className="text-lg text-[#7a9e8f] max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {tt(subtitle, lang)}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            {stats.map((s, i) => (
              <div key={i} className="card-luxury p-6 text-center animate-fade-up">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs text-[#5d7068] font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs font-bold text-[#5d7068] uppercase tracking-[0.2em] mb-6">
            {lang === "id" ? "Fitur Platform" : "Platform Features"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {features.map((f, i) => (
              <div key={i} className="card-luxury p-6 animate-fade-up">
                <div className={`${f.color} mb-4`}>{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{tt({ id: f.titleId, en: f.titleEn }, lang)}</h3>
                <p className="text-[#5d7068] text-sm">{tt({ id: f.descId, en: f.descEn }, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
