"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { Menu, X, Globe, FileDown, Layers, LockKeyhole } from "lucide-react";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/divisions", label: "Ekosistem" },
  { href: "/brands", label: "Brand" },
  { href: "/events", label: "Program & Event" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/investor", label: "Investor Relations" },
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
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div className={`mx-auto max-w-6xl px-4 transition-all duration-500 ${scrolled ? "mx-4 md:mx-auto rounded-2xl glass-heavy glow-brand" : ""}`}>
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? "px-6 py-3" : "px-0 py-2"}`}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Layers size={20} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-[#14B8A6] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-base tracking-tight leading-none">PT Sensasi Wangi Indonesia</div>
                <div className="text-[#4a7a6a] text-[10px] font-medium tracking-widest uppercase">Fragrance Ecosystem</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 relative">
              <div
                className="absolute h-[calc(100%-12px)] rounded-xl bg-white/[0.04] transition-all duration-300 ease-out pointer-events-none"
                style={{
                  opacity: activeHover ? 1 : 0,
                  width: activeHover ? "96px" : 0,
                  left: activeHover ? `${navItems.findIndex(n => n.href === activeHover) * 112 + 8}px` : 0,
                  top: "6px",
                }}
              />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setActiveHover(item.href)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative px-4 py-2 text-sm text-[#6b9e8f] hover:text-white transition-colors duration-300 font-medium"
                >
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#6b9e8f] hover:text-white glass-light hover:bg-white/10 transition-all duration-300 active-press"
              >
                <Globe size={14} />
                {lang === "id" ? "ID" : "EN"}
              </button>

              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-white text-xs font-bold transition-all duration-300 hover:bg-white/10 active-press"
              >
                <LockKeyhole size={14} />
                <span>Portal Internal</span>
              </Link>

              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden w-10 h-10 rounded-xl glass-light flex items-center justify-center text-white hover:bg-white/10 transition-all active-press"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setOpen(false)} />
          <div className="absolute top-20 left-4 right-4 glass-heavy rounded-2xl p-6 animate-scale-in shadow-2xl shadow-black/50">
            <div className="space-y-1">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6b9e8f] hover:text-white hover:bg-white/5 transition-all animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white text-sm font-bold active-press"
              >
                <LockKeyhole size={15} /> Portal Internal
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl glass-light text-white text-sm font-medium active-press hover:bg-white/5 transition-all"
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
