"use client";

import { Sparkles, Leaf, Cpu, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const brands = [
  {
    name: "L'arc~en~Scent",
    icon: <Sparkles size={32} className="text-white" />,
    gradient: "from-purple-600 to-indigo-600",
    descId:
      "Brand parfum premium yang terinspirasi dari seni dan kreativitas. Menghadirkan fragrance experience yang personal dan artistik.",
    descEn:
      "A premium perfume brand inspired by art and creativity. Delivering a personal and artistic fragrance experience.",
    tags: ["Premium", "Artistic", "Personal"],
  },
  {
    name: "Nuscentza",
    icon: <Leaf size={32} className="text-white" />,
    gradient: "from-emerald-600 to-teal-600",
    descId:
      "Brand parfum dengan konsep keindahan Nusantara. Menggabungkan kekayaan aroma lokal Indonesia dengan teknologi modern.",
    descEn:
      "A perfume brand with a Nusantara beauty concept. Combining the richness of Indonesian local aromas with modern technology.",
    tags: ["Nusantara", "Natural", "Modern"],
  },
  {
    name: "Pixel Potion",
    icon: <Cpu size={32} className="text-white" />,
    gradient: "from-pink-600 to-rose-600",
    descId:
      "Brand parfum berbasis AI — teknologi kecerdasan buatan yang menganalisis preferensi aroma dan merekomendasikan parfum personal.",
    descEn:
      "An AI-based perfume brand — artificial intelligence technology that analyzes scent preferences and recommends personalized perfumes.",
    tags: ["AI-Powered", "Tech", "Personalized"],
  },
];

export default function BrandsPage() {
  const { lang } = useLang();

  const eyebrow = { id: "Portfolio Brand", en: "Brand Portfolio" };
  const title = { id: "Brand Parfum Buatan Sendiri", en: "In-House Perfume Brands" };
  const subtitle = {
    id: "Tiga brand parfum yang dikembangkan dengan karakter unik dan positioning berbeda.",
    en: "Three perfume brands developed with unique characters and different positioning.",
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase tracking-widest text-sm font-semibold text-white/70 mb-3">
            {tt(eyebrow, lang)}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            {tt(title, lang)}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">{tt(subtitle, lang)}</p>
        </div>
      </section>

      {/* Brand Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {brands.map((brand, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${brand.gradient} p-8 text-center`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                    {brand.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">{brand.name}</h3>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {lang === "id" ? brand.descId : brand.descEn}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brand.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-4">
              {lang === "id"
                ? "Temukan brand SWI di marketplace kami"
                : "Discover SWI brands in our marketplace"}
            </p>
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f7b63] text-white font-bold rounded-full hover:bg-[#0d6b56] transition-colors"
            >
              {lang === "id" ? "Kunjungi Marketplace" : "Visit Marketplace"}
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
