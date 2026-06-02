"use client";

import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    perusahaan: [
      { label: "Tentang SWI", href: "/" },
      { label: "Ekosistem", href: "/divisions" },
      { label: "Brand", href: "/brands" },
    ],
    program: [
      { label: "Fragrantions", href: "/events" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Portal Internal", href: "/login" },
    ],
    hubungan: [
      { label: "Kontak", href: "mailto:sensasiwangi.id@gmail.com" },
      { label: "Instagram", href: "https://www.instagram.com/fragrantions" },
      { label: "Investor Relations", href: "/investor" },
    ],
  };

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/5 bg-white/[0.01]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0D9488]/50 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-[#0D9488]/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-sm font-black tracking-tight text-white shadow-lg shadow-teal-950/20 transition-transform duration-300 group-hover:-translate-y-0.5">
                SWI
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-white">PT Sensasi Wangi Indonesia</div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a7a6a]">Fragrance Ecosystem</div>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#6b9e8f]">
              Membangun ekosistem parfum Indonesia melalui edukasi, produk, event, layanan laboratorium, dan platform digital.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a href="https://www.instagram.com/fragrantions" target="_blank" rel="noreferrer" aria-label="Instagram Fragrantions" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.035] text-[#6b9e8f] transition hover:bg-white/[0.08] hover:text-white">
                <Instagram size={18} />
              </a>
              <a href="mailto:sensasiwangi.id@gmail.com" aria-label="Email PT Sensasi Wangi Indonesia" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.035] text-[#6b9e8f] transition hover:bg-white/[0.08] hover:text-white">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[#4a7a6a]">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="group flex items-center text-sm text-[#6b9e8f] transition hover:text-white">
                      {item.label}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-8 text-sm text-[#4a6058] md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span>Jl. Gading Kirana Timur A.11/15, Kelapa Gading Barat, Jakarta Utara 14240</span>
          </div>
          <div className="text-xs text-[#3a5048]">© {year} PT Sensasi Wangi Indonesia. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
