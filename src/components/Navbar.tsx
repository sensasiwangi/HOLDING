"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";
import { Menu, X, Globe, FileDown, Layers } from "lucide-react";

const navItems = [
  { href: "/", key: "nav.about" as const, label: "Beranda" },
  { href: "/divisions", key: "nav.divisions" as const, label: "Divisi" },
  { href: "/brands", key: "nav.brands" as const, label: "Brand" },
  { href: "/events", key: "nav.events" as const, label: "Event" },
  { href: "/marketplace", key: "nav.marketplace" as const, label: "Marketplace" },
  { href: "/investor", key: "nav.investor" as const, label: "Investor" },
];

export default function Navbar() {
  const { lang, toggleLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "py-2"
            : "py-4"
        }`}
      >
        {/* Floating container */}
        <div
          className={`mx-auto max-w-6xl px-4 transition-all duration-500 ${
            scrolled
              ? "mx-4 md:mx-auto rounded-2xl glass glow-brand"
              : ""
          }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? "px-6 py-3" : "px-0 py-2"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#12a77f] to-[#0f7b63] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <Layers size={20} className="text-white" />
                </div>
                {scrolled && (
                  <div className="absolute inset-0 rounded-xl bg-[#12a77f] opacity-0 group-hover:opacity-40 blur-xl transition-opacity" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-base tracking-tight leading-none">PT SWI</div>
                <div className="text-[#5d8a78] text-[10px] font-medium tracking-widest uppercase">Sensasi Wangi Indonesia</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setActiveHover(item.href)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative px-4 py-2 text-sm text-[#8aae9e] hover:text-white transition-colors duration-300 font-medium"
                >
                  <span className="relative z-10">{item.label}</span>
                  {activeHover === item.href && (
                    <span className="absolute inset-0 rounded-lg bg-white/5 transition-all duration-300 animate-scale-in" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#8aae9e] hover:text-white glass-light hover:bg-white/10 transition-all duration-300"
              >
                <Globe size={14} />
                {lang === "id" ? "ID" : "EN"}
              </button>

              {/* Dashboard CTA */}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#0f7b63]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Dashboard
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute top-20 left-4 right-4 glass rounded-2xl p-6 animate-fade-up">
            <div className="space-y-1">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#8aae9e] hover:text-white hover:bg-white/5 transition-all animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white text-sm font-bold"
              >
                Dashboard
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl glass-light text-white text-sm font-medium"
              >
                <FileDown size={16} /> PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
