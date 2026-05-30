"use client";

import Link from "next/link";
import { Instagram, MessageCircle, MapPin, Mail, Layers, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    perusahaan: [
      { label: "Tentang", href: "/" },
      { label: "Divisi", href: "/divisions" },
      { label: "Brand", href: "/brands" },
    ],
    bisnis: [
      { label: "Store TIM", href: "/divisions/store" },
      { label: "Fragrantions", href: "/events" },
      { label: "Marketplace", href: "/marketplace" },
    ],
    investasi: [
      { label: "Investor", href: "/investor" },
      { label: "Sukuk", href: "/dashboard" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  };

  return (
    <footer className="relative mt-20 border-t border-white/5">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0D9488]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#0D9488]/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                <Layers size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg tracking-tight">PT SWI</div>
                <div className="text-[#4a7a6a] text-xs font-medium tracking-widest uppercase">Sensasi Wangi Indonesia</div>
              </div>
            </Link>
            <p className="text-[#6b9e8f] text-sm leading-relaxed max-w-sm mb-6">
              Holding company yang membangun ekosistem parfum Indonesia — dari produksi, pengalaman retail, event nasional, hingga marketplace digital.
            </p>

            <div className="flex items-center gap-3">
              {[
                { icon: <Instagram size={18} />, href: "https://www.instagram.com/fragrantions" },
                { icon: <MessageCircle size={18} />, href: "#" },
                { icon: <Mail size={18} />, href: "mailto:sensasiwangi.id@gmail.com" },
              ].map((s, i) => (
                <a key={i} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined}
                  className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[#6b9e8f] hover:text-white hover:bg-white/10 transition-all duration-300 group">
                  <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items], i) => (
            <div key={i}>
              <h4 className="text-xs font-bold text-[#4a7a6a] uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map((item, j) => (
                  <li key={j}>
                    <Link href={item.href}
                      className="text-sm text-[#6b9e8f] hover:text-white transition-colors duration-300 flex items-center group">
                      {item.label}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#4a6058]">
            <MapPin size={14} />
            <span>Taman Mini Indonesia Indah, Jakarta</span>
          </div>
          <div className="text-xs text-[#3a5048]">
            © {year} PT Sensasi Wangi Indonesia. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
