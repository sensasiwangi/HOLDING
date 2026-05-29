"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import {
  Store, Calendar, FlaskConical, Code2, Globe, ArrowRight,
  ArrowUpRight, Sparkles, TrendingUp, Shield, Zap,
} from "lucide-react";

export default function HomePage() {
  const { lang } = useLang();
  const L = lang;

  const divisions = [
    { slug: "produksi", icon: <FlaskConical size={24} />, emoji: "🧪", title: L === "id" ? "Produksi & Brand" : "Production & Brands", desc: L === "id" ? "Larc-en-Scent, Nuscentza, Pixel Potion" : "Larc-en-Scent, Nuscentza, Pixel Potion", gradient: "from-purple-500 to-indigo-600", progress: 50 },
    { slug: "store", icon: <Store size={24} />, emoji: "🏪", title: "SWI Store TIM", desc: L === "id" ? "Merch, Parfum Experience, AI Mix" : "Merch, Perfume Experience, AI Mix", gradient: "from-emerald-500 to-teal-600", progress: 70 },
    { slug: "event", icon: <Calendar size={24} />, emoji: "🎭", title: "Fragrantions", desc: L === "id" ? "Expo, Roadshow, Pop-up" : "Expo, Roadshow, Pop-up", gradient: "from-blue-500 to-indigo-600", progress: 55 },
    { slug: "ecommerce", icon: <Globe size={24} />, emoji: "🌐", title: "Marketplace", desc: "sensasiwangi.id", gradient: "from-cyan-500 to-blue-600", progress: 30 },
    { slug: "digital", icon: <Code2 size={24} />, emoji: "🤖", title: L === "id" ? "Digital & AI" : "Digital & AI", desc: L === "id" ? "CRM, AI Profile, Otomasi" : "CRM, AI Profile, Automation", gradient: "from-amber-500 to-orange-600", progress: 35 },
  ];

  return (
    <>
      {/* ── VISION / MISSION — Split asymmetric ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#0f7b63]/5 to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left bigger */}
            <div className="lg:col-span-3 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">
                  {L === "id" ? "Visi Kami" : "Our Vision"}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
                <span className="text-gradient">
                  {L === "id" ? "Ekosistem Parfum" : "Fragrance Ecosystem"}
                </span>
                <br />
                <span className="text-[#5d7068]">
                  {L === "id" ? "Terdepan di Asia Tenggara" : "Leading in Southeast Asia"}
                </span>
              </h2>
              <p className="text-lg text-[#7aae9e] leading-relaxed max-w-xl">
                {L === "id"
                  ? "Menghubungkan kreator, penggemar, dan investor dalam satu ekosistem parfum yang terintegrasi — dari hulu ke hilir."
                  : "Connecting creators, enthusiasts, and investors in an integrated fragrance ecosystem — from upstream to downstream."}
              </p>
            </div>

            {/* Right smaller — mission cards */}
            <div className="lg:col-span-2 space-y-4">
              {[
                { icon: <TrendingUp size={18} />, title: L === "id" ? "Inovasi Produk" : "Product Innovation", color: "text-emerald-400" },
                { icon: <Shield size={18} />, title: L === "id" ? "Sukuk Syariah" : "Sharia Sukuk", color: "text-amber-400" },
                { icon: <Zap size={18} />, title: L === "id" ? "Teknologi AI" : "AI Technology", color: "text-blue-400" },
              ].map((m, i) => (
                <div key={i} className="card-luxury p-4 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <div className={`${m.color} w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                    {m.icon}
                  </div>
                  <div className="text-white font-semibold text-sm">{m.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVISIONS — Bento grid ── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">
                {L === "id" ? "Struktur Holding" : "Holding Structure"}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">
              {L === "id" ? "Lima Divisi, Satu Ekosistem" : "Five Divisions, One Ecosystem"}
            </h2>
            <p className="text-[#7a9e8f] max-w-lg mx-auto">
              {L === "id"
                ? "Setiap divisi beroperasi sebagai anak perusahaan mandiri namun saling menguatkan."
                : "Each division operates as an independent subsidiary yet mutually reinforcing."}
            </p>
          </div>

          {/* Bento grid — asymmetric */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {/* Store — large card spanning 2 cols */}
            <div className="md:col-span-2 lg:col-span-2 card-luxury p-8 group animate-fade-up">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${divisions[1].gradient} flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {divisions[1].icon}
                </div>
                <Link href="/divisions/store" className="text-[#5d7068] hover:text-white transition-colors">
                  <ArrowUpRight size={20} />
                </Link>
              </div>
              <div className="text-3xl mb-3">{divisions[1].emoji}</div>
              <h3 className="text-xl font-bold text-white mb-2">{divisions[1].title}</h3>
              <p className="text-[#7a9e8f] text-sm mb-4">{divisions[1].desc}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${divisions[1].gradient} rounded-full`} style={{ width: `${divisions[1].progress}%` }} />
                </div>
                <span className="text-xs text-[#5d7068] font-bold">{divisions[1].progress}%</span>
              </div>
            </div>

            {/* Production */}
            <div className="card-luxury p-6 group animate-fade-up">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${divisions[0].gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {divisions[0].icon}
              </div>
              <div className="text-2xl mb-2">{divisions[0].emoji}</div>
              <h3 className="text-lg font-bold text-white mb-1">{divisions[0].title}</h3>
              <p className="text-[#5d7068] text-xs">{divisions[0].desc}</p>
            </div>

            {/* Event */}
            <div className="card-luxury p-6 group animate-fade-up">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${divisions[2].gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {divisions[2].icon}
              </div>
              <div className="text-2xl mb-2">{divisions[2].emoji}</div>
              <h3 className="text-lg font-bold text-white mb-1">{divisions[2].title}</h3>
              <p className="text-[#5d7068] text-xs">{divisions[2].desc}</p>
            </div>

            {/* Marketplace */}
            <div className="card-luxury p-6 group animate-fade-up">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${divisions[3].gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {divisions[3].icon}
              </div>
              <div className="text-2xl mb-2">{divisions[3].emoji}</div>
              <h3 className="text-lg font-bold text-white mb-1">{divisions[3].title}</h3>
              <p className="text-[#5d7068] text-xs">{divisions[3].desc}</p>
            </div>

            {/* Digital */}
            <div className="card-luxury p-6 group animate-fade-up">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${divisions[4].gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {divisions[4].icon}
              </div>
              <div className="text-2xl mb-2">{divisions[4].emoji}</div>
              <h3 className="text-lg font-bold text-white mb-1">{divisions[4].title}</h3>
              <p className="text-[#5d7068] text-xs">{divisions[4].desc}</p>
            </div>
          </div>

          {/* View all CTA */}
          <div className="text-center mt-12 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link
              href="/divisions"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-all duration-300 group"
            >
              {L === "id" ? "Lihat Semua Divisi" : "View All Divisions"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS — Full width band ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f7b63]/10 via-transparent to-[#0f7b63]/10" />
        <div className="absolute inset-0 animate-shimmer" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5", label: L === "id" ? "Divisi Aktif" : "Active Divisions", icon: "🏢" },
              { value: "3", label: L === "id" ? "Brand Parfum" : "Fragrance Brands", icon: "🌸" },
              { value: "50+", label: L === "id" ? "Event Nasional" : "National Events", icon: "🎭" },
              { value: "Rp 1M", label: L === "id" ? "Modal Dasar" : "Base Capital", icon: "💰" },
            ].map((s, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{s.value}</div>
                <div className="text-xs text-[#5d7068] font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — Investor ── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f7b63]/30 to-[#12a77f]/10" />
            <div className="absolute inset-0 animate-shimmer" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#c9a84c]/10 to-transparent" />

            <div className="relative p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 mb-4">
                  <span className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider">
                    {L === "id" ? "Peluang Investasi" : "Investment Opportunity"}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                  {L === "id" ? "Tertarik Berinvestasi?" : "Interested in Investing?"}
                </h2>
                <p className="text-[#8aae9e] max-w-md">
                  {L === "id"
                    ? "Sukuk syariah, ekspansi store, dan pertumbuhan ekosistem parfum Indonesia."
                    : "Sharia sukuk, store expansion, and Indonesia's fragrance ecosystem growth."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/investor"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0a0f0d] font-bold text-sm hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
                >
                  {L === "id" ? "Investor Relations" : "Investor Relations"}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-all duration-300"
                >
                  <Shield size={16} />
                  Sukuk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
