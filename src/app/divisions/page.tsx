"use client";

import DivisionCard from "@/components/DivisionCard";
import {
  Building2,
  Store,
  Calendar,
  FlaskConical,
  Code2,
  Megaphone,
  Globe,
} from "lucide-react";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const divisionsData = [
  {
    icon: <Building2 size={24} />,
    titleId: "Holding Office",
    titleEn: "Holding Office",
    descId: "Legal perusahaan, keuangan, business plan, strategi korporat, brand assets, dan investor relations.",
    descEn: "Corporate legal, finance, business plan, corporate strategy, brand assets, and investor relations.",
    progress: 60,
    color: "bg-gray-700",
  },
  {
    icon: <Store size={24} />,
    titleId: "SWI Store & Pengalaman Offline",
    titleEn: "SWI Store & Offline Experience",
    descId: "Toko retail parfum, kelas parfumer, kelas regular, customer experience, dan AI Mix.",
    descEn: "Perfume retail store, perfumery classes, regular classes, customer experience, and AI Mix.",
    progress: 70,
    color: "bg-emerald-500",
  },
  {
    icon: <Calendar size={24} />,
    titleId: "Event Organizer & Fragrantions",
    titleEn: "Event Organizer & Fragrantions",
    descId: "Pameran dan roadshow parfum nasional — Fragrantions Expo, Road to Fragrantions, sponsor, tenant, dan partnership.",
    descEn: "National fragrance expos & roadshows — Fragrantions Expo, Road to Fragrantions, sponsors, tenants, and partnerships.",
    progress: 55,
    color: "bg-blue-500",
  },
  {
    icon: <FlaskConical size={24} />,
    titleId: "Production & Brands",
    titleEn: "Production & Brands",
    descId: "Larc-en-Scent, Nuscentza, Pixel Potion, pengembangan produk, bahan baku, formula, packaging, dan katalog.",
    descEn: "Larc-en-Scent, Nuscentza, Pixel Potion, product development, raw materials, formulas, packaging, and catalog.",
    progress: 50,
    color: "bg-purple-500",
  },
  {
    icon: <Code2 size={24} />,
    titleId: "Digital Systems & AI",
    titleEn: "Digital Systems & AI",
    descId: "AppSheet, Google AI Studio, AI perfume profile, internal automation, database customer, dan dashboard data.",
    descEn: "AppSheet, Google AI Studio, AI perfume profile, internal automation, customer database, and data dashboard.",
    progress: 35,
    color: "bg-amber-500",
  },
  {
    icon: <Megaphone size={24} />,
    titleId: "Marketing & Community",
    titleEn: "Marketing & Community",
    descId: "WhatsApp Channel, Podcast, quisioner, media sosial, dan program loyalitas komunitas parfum.",
    descEn: "WhatsApp Channel, Podcast, questionnaires, social media, and fragrance community loyalty programs.",
    progress: 40,
    color: "bg-pink-500",
  },
  {
    icon: <Globe size={24} />,
    titleId: "WEB Marketplace",
    titleEn: "WEB Marketplace",
    descId: "Platform marketplace sensasiwangi.id: katalog produk, booking, checkout, customer support, analytics, dan growth.",
    descEn: "sensasiwangi.id marketplace platform: product catalog, bookings, checkout, customer support, analytics, and growth.",
    progress: 30,
    color: "bg-cyan-500",
  },
];

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

export default function DivisionsPage() {
  const { lang } = useLang();

  const pageTitle = { id: "Struktur Holding SWI", en: "SWI Holding Structure" };
  const pageDesc = {
    id: "Setiap divisi beroperasi sebagai unit bisnis mandiri namun saling terhubung dalam ekosistem yang memperkuat.",
    en: "Each division operates as an independent business unit yet is interconnected within a reinforcing ecosystem.",
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase tracking-widest text-sm font-semibold text-white/70 mb-3">
            {lang === "id" ? "Struktur Holding" : "Holding Structure"}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            {tt(pageTitle, lang)}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">{tt(pageDesc, lang)}</p>
        </div>
      </section>

      {/* Division Cards Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {divisionsData.map((d, i) => (
              <DivisionCard
                key={i}
                icon={d.icon}
                title={lang === "id" ? d.titleId : d.titleEn}
                description={lang === "id" ? d.descId : d.descEn}
                progress={d.progress}
                color={d.color}
              />
            ))}
          </div>

          {/* Ecosystem synergy note */}
          <div className="mt-16 bg-white rounded-xl border border-gray-200 p-8 sm:p-10 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-[#10201d] mb-3">
              {lang === "id"
                ? "Sinergi Antar Divisi"
                : "Cross-Division Synergy"}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {lang === "id"
                ? "Setiap divisi menghasilkan data dan value yang saling memperkuat: Store menghasilkan customer insight, Event membangun brand awareness, Production menyediakan produk, Digital mengoptimalkan operasional, Marketing menjangkau audiens baru, dan Marketplace membuka channel penjualan nasional."
                : "Each division generates data and value that reinforce each other: Store produces customer insight, Events build brand awareness, Production supplies products, Digital optimizes operations, Marketing reaches new audiences, and Marketplace opens a national sales channel."}
            </p>
            <div className="mt-6">
              <Link
                href="/investor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f7b63] text-white font-bold rounded-full hover:bg-[#0d6b56] transition-colors"
              >
                {lang === "id" ? "Lihat Peluang Investor" : "View Investor Opportunity"}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
