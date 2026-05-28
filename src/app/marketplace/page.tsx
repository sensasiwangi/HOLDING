"use client";

import { ShoppingBag, CalendarCheck, Bot, Headset, ExternalLink, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const features = [
  {
    icon: <ShoppingBag size={24} className="text-white" />,
    titleId: "Katalog Produk",
    titleEn: "Product Catalog",
    descId: "Jelajahi seluruh produk brand SWI dengan informasi detail.",
    descEn: "Browse the complete SWI brand product catalog with detailed information.",
    color: "bg-emerald-500",
  },
  {
    icon: <CalendarCheck size={24} className="text-white" />,
    titleId: "Booking & Checkout",
    titleEn: "Booking & Checkout",
    descId: "Pesan kelas, workshop, atau produk parfum secara online.",
    descEn: "Book classes, workshops, or order perfume products online.",
    color: "bg-blue-500",
  },
  {
    icon: <Bot size={24} className="text-white" />,
    titleId: "AI Scent Recommendation",
    titleEn: "AI Scent Recommendation",
    descId: "Rekomendasi parfum personal berdasarkan AI analysis.",
    descEn: "Personalized perfume recommendations based on AI analysis.",
    color: "bg-purple-500",
  },
  {
    icon: <Headset size={24} className="text-white" />,
    titleId: "Customer Support",
    titleEn: "Customer Support",
    descId: "Layanan pelanggan 24/7 melalui WhatsApp dan chat.",
    descEn: "24/7 customer service via WhatsApp and chat.",
    color: "bg-amber-500",
  },
];

export default function MarketplacePage() {
  const { lang } = useLang();

  const eyebrow = { id: "Digital Marketplace", en: "Digital Marketplace" };
  const title = { id: "sensasiwangi.id", en: "sensasiwangi.id" };
  const subtitle = {
    id: "Marketplace digital yang menghubungkan produk SWI Store dengan pelanggan di seluruh Indonesia.",
    en: "A digital marketplace connecting SWI Store products with customers across Indonesia.",
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase tracking-widest text-sm font-semibold text-white/70 mb-3">
            {tt(eyebrow, lang)}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 font-mono">
            sensasiwangi.id
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">{tt(subtitle, lang)}</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${f.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-[#10201d] mb-2">
                  {lang === "id" ? f.titleId : f.titleEn}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {lang === "id" ? f.descId : f.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* Marketplace Preview / CTA */}
          <div className="mt-16 bg-gradient-to-br from-[#0f7b63] to-[#12a77f] rounded-2xl p-8 sm:p-12 text-center text-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
                {lang === "id"
                  ? "Jelajahi Marketplace SWI"
                  : "Explore the SWI Marketplace"}
              </h2>
              <p className="text-white/80 leading-relaxed mb-8">
                {lang === "id"
                  ? "Temukan produk parfum, booking kelas & workshop, dan nikmati rekomendasi parfum berbasis AI — semua dalam satu platform."
                  : "Discover perfume products, book classes & workshops, and enjoy AI-powered perfume recommendations — all in one platform."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://sensasiwangi.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0f7b63] font-bold rounded-full hover:bg-white/90 transition-colors shadow-lg text-lg"
                >
                  {lang === "id" ? "Kunjungi Marketplace" : "Visit Marketplace"}
                  <ExternalLink size={18} />
                </a>
                <a
                  href="/brands"
                  className="inline-flex items-center gap-2 px-6 py-4 bg-white/15 text-white font-bold rounded-full hover:bg-white/25 transition-colors border border-white/20"
                >
                  {lang === "id" ? "Lihat Brand" : "View Brands"}
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Coming Soon note */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              {lang === "id"
                ? "🚀 Marketplace sedang dalam pengembangan aktif. Segera hadir!"
                : "🚀 Marketplace is under active development. Coming soon!"}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
