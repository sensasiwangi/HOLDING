"use client";

import { useState } from "react";
import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";

const navItems = [
  { href: "/", key: "nav.about" as const },
  { href: "/divisions", key: "nav.divisions" as const },
  { href: "/brands", key: "nav.brands" as const },
  { href: "/events", key: "nav.events" as const },
  { href: "/marketplace", key: "nav.marketplace" as const },
  { href: "/investor", key: "nav.investor" as const },
  { href: "/dashboard", key: "nav.dashboard" as const },
];

export default function Navbar() {
  const { lang, toggleLang } = useLang();
  const [open, setOpen] = useState(false);

  function tr(key: string): string {
    const keys = key.split(".");
    let val: any = dict;
    for (const k of keys) {
      val = val?.[k];
      if (!val) return key;
    }
    if (typeof val === "object" && val[lang]) return val[lang];
    return val;
  }

  return (
    <nav className="no-print sticky top-0 z-50 bg-white border-b border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="text-[var(--brand)] font-extrabold text-lg">
          PT SWI
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-[var(--muted)] hover:text-[var(--brand)] transition">
              {tr(item.key)}
            </a>
          ))}
        </div>

        {/* Right side: Lang toggle + PDF + Dashboard */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-3 py-1 rounded border border-[var(--line)] text-xs font-bold hover:border-[var(--brand)] transition"
          >
            {lang === "id" ? "EN" : "ID"}
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 rounded bg-[var(--brand)] text-white text-xs font-bold hover:bg-[var(--brand-2)] transition"
          >
            {tr("nav.downloadPdf")}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[var(--ink)]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--line)] bg-white px-6 py-4 space-y-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block text-[var(--muted)] hover:text-[var(--brand)] transition"
            >
              {tr(item.key)}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={toggleLang}
              className="px-3 py-1 rounded border border-[var(--line)] text-xs font-bold"
            >
              {lang === "id" ? "EN" : "ID"}
            </button>
            <button
              onClick={() => { setOpen(false); window.print(); }}
              className="px-3 py-1 rounded bg-[var(--brand)] text-white text-xs font-bold"
            >
              {tr("nav.downloadPdf")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
