"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { Instagram, MessageCircle, MapPin, Mail, Layers, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { lang } = useLang();
  const L = lang;

  const links = {
    perusahaan: [
      { label: L === "id" ? "Tentang" : "About", href: "/" },
      { label: L === "id" ? "Divisi" : "Divisions", href: "/divisions" },
      { label: L === "id" ? "Brand" : "Brands", href: "/brands" },
    ],
    bisnis: [
      { label: L === "id" ? "Store TIM" : "TIM Store", href: "/divisions/store" },
      { label: "Fragrantions", href: "/events" },
      { label: "Marketplace", href: "/marketplace" },
    ],
    investasi: [
      { label: L === "id" ? "Peluang Investor" : "Investor Opportunity", href: "/investor" },
      { label: "Sukuk", href: "/dashboard" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  };

  return (
    <footer className="relative mt-20 border-t border-white/5">
      {/* Ornamen atas */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0f7b63]/50 to-transparent" />

      {/* Scan line effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#0f7b63]/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#12a77f] to-[#0f7b63] flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                <Layers size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg tracking-tight">PT SWI</div>
                <div className="text-[#5d8a78] text-xs font-medium tracking-widest uppercase">Sensasi Wangi Indonesia</div>
              </div>
            </Link>
            <p className="text-[#7a9e8f] text-sm leading-relaxed max-w-sm mb-6">
              {L === "id"
                ? "Holding company yang membangun ekosistem parfum Indonesia — dari produksi, pengalaman retail, event nasional, hingga marketplace digital."
                : "A holding company building Indonesia's fragrance ecosystem — from production, retail experiences, national events, to digital marketplace."}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/fragrantions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[#7a9e8f] hover:text-white hover:bg-white/10 transition-all duration-300 group"
              >
                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[#7a9e8f] hover:text-white hover:bg-white/10 transition-all duration-300 group"
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="mailto:sensasiwangi.id@gmail.com"
                className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-[#7a9e8f] hover:text-white hover:bg-white/10 transition-all duration-300 group"
              >
                <Mail size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items], i) => (
            <div key={i}>
              <h4 className="text-xs font-bold text-[#5d8a78] uppercase tracking-widest mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map((item, j) => (
                  <li key={j}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#8aae9e] hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      {item.label}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#5d7068]">
            <MapPin size={14} />
            <span>Taman Mini Indonesia Indah, Jakarta</span>
          </div>
          <div className="text-xs text-[#4a6058]">
            © {new Date().getFullYear()} PT Sensasi Wangi Indonesia. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
