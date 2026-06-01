"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/LangContext";
import Link from "next/link";
import { ArrowRight, Play, ChevronDown } from "lucide-react";

function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${8 + Math.random() * 12}s`,
    size: i % 3 === 0 ? 3 : 2,
  }));

  return (
    <div className="particle-field">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const { lang } = useLang();
  const L = lang;
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Multi-layer animated background ── */}
      <div className="absolute inset-0">
        {/* Primary glow orbs with breathing */}
        <div
          className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#0D9488]/12 blur-[150px] animate-float1 animate-pulse-glow"
          style={{ transform: `translateY(${-parallaxOffset}px)` }}
        />
        <div
          className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#14B8A6]/10 blur-[120px] animate-float2 animate-pulse-glow"
          style={{ transform: `translateY(${-parallaxOffset * 0.7}px)` }}
        />
        <div
          className="absolute top-[40%] right-[35%] w-[300px] h-[300px] rounded-full bg-[#F97316]/6 blur-[100px] animate-float3"
          style={{ transform: `translateY(${-parallaxOffset * 0.5}px)` }}
        />
        <div
          className="absolute bottom-[30%] left-[10%] w-[250px] h-[250px] rounded-full bg-[#0D9488]/5 blur-[80px] animate-float1"
          style={{ transform: `translateY(${-parallaxOffset * 0.3}px)`, animationDelay: "5s" }}
        />
      </div>

      {/* ── Particle field ── */}
      <ParticleField />

      {/* ── Grid pattern overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Radial vignette ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080c0a_75%)]" />

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Left: Text ── */}
          <div className="animate-fade-up">
            {/* Badge with shimmer */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8 animate-glow-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#8aae9e] tracking-wider uppercase">
                {L === "id" ? "Holding Company Parfum Indonesia" : "Indonesian Fragrance Holding Company"}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black leading-[1.05] mb-6">
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
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm transition-all duration-500 hover:-translate-y-1 active-press overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">{L === "id" ? "Jelajahi Divisi" : "Explore Divisions"}</span>
                <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 animate-light-sweep opacity-0 group-hover:opacity-100" />
              </Link>
              <Link
                href="/divisions/store"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-all duration-300 active-press"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={14} className="text-teal-400 ml-0.5" />
                </div>
                <span>Store TIM</span>
              </Link>
            </div>

            {/* Quick stats — enhanced */}
            <div className="mt-14 flex items-center gap-8">
              {[
                { value: "5", label: L === "id" ? "Divisi" : "Divisions" },
                { value: "3", label: L === "id" ? "Brand Parfum" : "Fragrance Brands" },
                { value: "Rp 1M", label: L === "id" ? "Modal Dasar" : "Base Capital" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="animate-fade-up"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className="text-2xl md:text-3xl font-black text-white stat-value">{s.value}</div>
                  <div className="text-xs text-[#5d7068] font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Enhanced Visual ── */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Morphing background blob */}
              <div className="absolute inset-8 rounded-full animate-morph bg-gradient-to-br from-[#0D9488]/10 to-[#F97316]/5 blur-sm" />

              {/* Rotating rings */}
              <div className="absolute inset-0 rounded-full hero-ring animate-[spin_80s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full hero-ring-2 animate-[spin_60s_linear_infinite_reverse]" />
              <div className="absolute inset-12 rounded-full hero-ring-3 animate-[spin_40s_linear_infinite]" />

              {/* Dashed orbit ring */}
              <div
                className="absolute inset-16 rounded-full border border-dashed border-[#0D9488]/10 animate-[spin_30s_linear_infinite_reverse]"
              />

              {/* Center orb with breathing glow */}
              <div className="absolute inset-20 rounded-full bg-gradient-to-br from-[#0D9488]/30 to-[#14B8A6]/10 animate-glow-pulse flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center animate-float3 animate-morph">
                  <span className="text-5xl animate-breathe">🌸</span>
                </div>
              </div>

              {/* Pulsing ring around center */}
              <div className="absolute inset-[90px] rounded-full border-2 border-[#14B8A6]/20 animate-pulse-ring" />

              {/* Tracing dots on orbit */}
              <div className="absolute inset-6 animate-[spin_20s_linear_infinite]">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#14B8A6]/40 animate-pulse" />
              </div>
              <div className="absolute inset-6 animate-[spin_25s_linear_infinite_reverse]">
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F97316]/40 animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
              <div className="absolute inset-16 animate-[spin_35s_linear_infinite]">
                <div className="absolute -bottom-1 left-1/4 w-2 h-2 rounded-full bg-[#5EEAD4]/30 animate-pulse" style={{ animationDelay: "2s" }} />
              </div>

              {/* Floating cards — enhanced with trail */}
              {[
                { icon: "🏪", label: "SWI Store", x: "0%", y: "5%", delay: "0s", dur: "18s" },
                { icon: "🎭", label: "Fragrantions", x: "72%", y: "2%", delay: "0.5s", dur: "20s" },
                { icon: "🧪", label: "Production", x: "82%", y: "62%", delay: "1s", dur: "16s" },
                { icon: "🌐", label: "Marketplace", x: "2%", y: "68%", delay: "1.5s", dur: "22s" },
                { icon: "🤖", label: "Digital AI", x: "40%", y: "-2%", delay: "2s", dur: "19s" },
                { icon: "🎪", label: "Events", x: "45%", y: "85%", delay: "2.5s", dur: "17s" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="absolute glass rounded-2xl px-4 py-3 flex items-center gap-2 group animate-float3 transition-all duration-300"
                  style={{ left: card.x, top: card.y, animationDelay: card.delay, animationDuration: card.dur }}
                >
                  <span className="text-xl group-hover:scale-125 transition-transform duration-300">{card.icon}</span>
                  <span className="text-xs font-semibold text-white whitespace-nowrap">{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Scroll indicator — enhanced ── */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up cursor-pointer"
          style={{ animationDelay: '1s' }}
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        >
          <span className="text-[10px] text-[#5d7068] uppercase tracking-[0.25em] font-semibold">
            {L === "id" ? "Gulir ke bawah" : "Scroll down"}
          </span>
          <div className="w-6 h-10 rounded-full border border-white/10 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-[#14B8A6] animate-bounce" />
          </div>
          <ChevronDown size={16} className="text-[#5d7068] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
