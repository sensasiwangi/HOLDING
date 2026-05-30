"use client";

import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { ArrowRight, Play, ChevronDown } from "lucide-react";

export default function Hero() {
  const { lang } = useLang();
  const L = lang;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#0D9488]/10 blur-[120px] animate-float1" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#14B8A6]/8 blur-[100px] animate-float2" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-[#F97316]/5 blur-[80px] animate-float3" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#8aae9e] tracking-wider uppercase">
                {L === "id" ? "Holding Company Parfum Indonesia" : "Indonesian Fragrance Holding Company"}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              <span className="text-gradient">PT Sensasi</span>
              <br />
              <span className="text-gradient-orange">Wangi Indonesia</span>
            </h1>

            <p className="text-lg md:text-xl text-[#7a9e8f] leading-relaxed max-w-lg mb-10">
              {L === "id"
                ? "Membangun ekosistem parfum terlengkap di Indonesia — dari kreasi formula, pengalaman retail premium, event nasional, hingga marketplace digital."
                : "Building Indonesia's most complete fragrance ecosystem — from formula creation, premium retail experiences, national events, to digital marketplace."}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/divisions"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm hover:shadow-xl hover:shadow-[#0D9488]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>{L === "id" ? "Jelajahi Divisi" : "Explore Divisions"}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/divisions/store"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Play size={14} className="text-teal-400 ml-0.5" />
                </div>
                <span>Store TIM</span>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="mt-14 flex items-center gap-8">
              {[
                { value: "5", label: L === "id" ? "Divisi" : "Divisions" },
                { value: "3", label: L === "id" ? "Brand Parfum" : "Fragrance Brands" },
                { value: "Rp 1M", label: L === "id" ? "Modal Dasar" : "Base Capital" },
              ].map((s, i) => (
                <div key={i} className="animate-fade-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-[#5d7068] font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-white/5 animate-[spin_45s_linear_infinite_reverse]" />

              {/* Center orb */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-[#0D9488]/30 to-[#14B8A6]/10 glow-brand flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center animate-float3">
                  <span className="text-5xl">🌸</span>
                </div>
              </div>

              {/* Floating cards */}
              {[
                { icon: "🏪", label: "SWI Store", x: "0%", y: "10%", delay: "0s" },
                { icon: "🎭", label: "Fragrantions", x: "75%", y: "5%", delay: "0.5s" },
                { icon: "🧪", label: "Production", x: "80%", y: "65%", delay: "1s" },
                { icon: "🌐", label: "Marketplace", x: "5%", y: "70%", delay: "1.5s" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="absolute glass rounded-2xl px-4 py-3 flex items-center gap-2 animate-float3"
                  style={{ left: card.x, top: card.y, animationDelay: card.delay, animationDuration: `${15 + i * 3}s` }}
                >
                  <span className="text-xl">{card.icon}</span>
                  <span className="text-xs font-semibold text-white whitespace-nowrap">{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '1s' }}>
          <span className="text-[10px] text-[#5d7068] uppercase tracking-[0.2em] font-semibold">
            {L === "id" ? "Gulir ke bawah" : "Scroll down"}
          </span>
          <ChevronDown size={16} className="text-[#5d7068] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
