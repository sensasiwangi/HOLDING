"use client";

import Hero from "@/components/Hero";
import DivisionCard from "@/components/DivisionCard";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Store,
  Calendar,
  FlaskConical,
  Code2,
  Megaphone,
  Globe,
  Building2,
  Target,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useLang } from "@/lib/LangContext";

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

export default function HomePage() {
  const { lang } = useLang();

  return (
    <>
      <Hero />

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="uppercase tracking-widest text-sm font-semibold text-[#0f7b63] mb-3">
              {lang === "id" ? "Tentang Perusahaan" : "About the Company"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10201d] mb-6">
              {lang === "id"
                ? "Membangun Ekosistem Parfum Indonesia"
                : "Building the Indonesian Fragrance Ecosystem"}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {lang === "id"
                ? "PT Sensasi Wangi Indonesia (SWI) adalah holding company yang mengintegrasikan seluruh rantai nilai industri parfum — dari produksi dan brand, pengalaman retail dan edukasi, event nasional, hingga marketplace digital."
                : "PT Sensasi Wangi Indonesia (SWI) is a holding company that integrates the entire fragrance industry value chain — from production and branding, retail and education experiences, national events, to a digital marketplace."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mission */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-[#0f7b63] rounded-lg flex items-center justify-center mb-4">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#10201d] mb-3">
                {lang === "id" ? "Misi Kami" : "Our Mission"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {lang === "id"
                  ? "Menjadikan Indonesia sebagai hub kreasi parfum melalui inovasi produk, edukasi, dan teknologi."
                  : "To establish Indonesia as a fragrance creation hub through product innovation, education, and technology."}
              </p>
            </div>
            {/* Vision */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-[#12a77f] rounded-lg flex items-center justify-center mb-4">
                <Eye size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#10201d] mb-3">
                {lang === "id" ? "Visi Kami" : "Our Vision"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {lang === "id"
                  ? "Ekosistem parfum terdepan di Asia Tenggara yang menghubungkan kreator, penggemar, dan investor."
                  : "The leading fragrance ecosystem in Southeast Asia connecting creators, enthusiasts, and investors."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="uppercase tracking-widest text-sm font-semibold text-[#0f7b63] mb-3">
              {lang === "id" ? "Struktur Holding" : "Holding Structure"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10201d] mb-4">
              {lang === "id" ? "Enam Divisi, Satu Ekosistem" : "Six Divisions, One Ecosystem"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {lang === "id"
                ? "Setiap divisi beroperasi sebagai unit bisnis mandiri namun saling terhubung dalam ekosistem yang memperkuat."
                : "Each division operates as an independent business unit yet is interconnected within a reinforcing ecosystem."}
            </p>
          </div>
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
          <div className="text-center mt-10">
            <Link
              href="/divisions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f7b63] text-white font-bold rounded-full hover:bg-[#0d6b56] transition-colors"
            >
              {lang === "id" ? "Lihat Semua Divisi" : "View All Divisions"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Investor */}
      <section className="py-20 bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            {lang === "id"
              ? "Tertarik Berinvestasi?"
              : "Interested in Investing?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {lang === "id"
              ? "Mencari mitra strategis dan investor untuk mempercepat pertumbuhan ekosistem parfum Indonesia."
              : "Seeking strategic partners and investors to accelerate the growth of Indonesia's fragrance ecosystem."}
          </p>
          <Link
            href="/investor"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0f7b63] font-bold rounded-full hover:bg-white/90 transition-colors shadow-lg text-lg"
          >
            {lang === "id" ? "Lihat Peluang Investor" : "View Investor Opportunity"}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
