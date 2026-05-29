"use client";

import { Sparkles, Leaf, Cpu, ExternalLink, Star } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const brands = [
  {
    name: "L'arc~en~Scent",
    icon: <Sparkles size={28} className="text-white" />,
    gradient: "from-purple-600 to-indigo-600",
    emoji: "🌸",
    descId: "Brand parfum premium yang terinspirasi dari seni dan kreativitas. Menghadirkan fragrance experience yang personal dan artistik.",
    descEn: "A premium perfume brand inspired by art and creativity. Delivering a personal and artistic fragrance experience.",
    tags: ["Premium", "Artistic", "Personal"],
    products: 12,
    rating: 4.8,
  },
  {
    name: "Nuscentza",
    icon: <Leaf size={28} className="text-white" />,
    gradient: "from-emerald-600 to-teal-600",
    emoji: "🌺",
    descId: "Brand parfum dengan konsep keindahan Nusantara. Menggabungkan kekayaan aroma lokal Indonesia dengan teknologi modern.",
    descEn: "A perfume brand with a Nusantara beauty concept. Combining the richness of Indonesian local aromas with modern technology.",
    tags: ["Nusantara", "Natural", "Modern"],
    products: 8,
    rating: 4.6,
  },
  {
    name: "Pixel Potion",
    icon: <Cpu size={28} className="text-white" />,
    gradient: "from-amber-500 to-orange-600",
    emoji: "🧪",
    descId: "Brand parfum lifestyle untuk generasi muda. Kreatif, eclectic, dan penuh eksplorasi aroma.",
    descEn: "A lifestyle perfume brand for the young generation. Creative, eclectic, and full of scent exploration.",
    tags: ["Youth", "Creative", "Eclectic"],
    products: 5,
    rating: 4.5,
  },
];

export default function BrandsPage() {
  const { lang } = useLang();

  const eyebrow = { id: "Brand Portfolio", en: "Brand Portfolio" };
  const title = { id: "Brand Parfum SWI", en: "SWI Perfume Brands" };
  const subtitle = {
    id: "Tiga brand parfum original yang masing-masing memiliki identitas dan pasar tersendiri.",
    en: "Three original perfume brands, each with its own identity and market.",
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] animate-float1" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] animate-float2" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6 animate-fade-up">
            <Star size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">{tt(eyebrow, lang)}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient">{tt(title, lang)}</span>
          </h1>
          <p className="text-lg text-[#7a9e8f] max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {tt(subtitle, lang)}
          </p>
        </div>
      </section>

      {/* Brand Cards */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 stagger">
            {brands.map((brand, i) => (
              <div key={i} className="card-luxury group animate-fade-up">
                {/* Gradient top */}
                <div className={`h-2 bg-gradient-to-r ${brand.gradient}`} />
                <div className="p-8">
                  <div className="text-5xl mb-5">{brand.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{brand.name}</h3>
                  <p className="text-[#7a9e8f] text-sm leading-relaxed mb-5">{tt({ id: brand.descId, en: brand.descEn }, lang)}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {brand.tags.map((tag, j) => (
                      <span key={j} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-[#8aae9e]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-xs text-[#5d7068]">
                      <span className="font-bold text-white">{brand.products}</span> {lang === "id" ? "produk" : "products"}
                    </div>
                    <div className="text-sm text-amber-400 font-bold">★ {brand.rating}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
