"use client";

import Link from "next/link";
import { ArrowRight, Beaker, BookOpen, CalendarDays, ShoppingBag, Sparkles } from "lucide-react";
import { useLang } from "@/lib/LangContext";

const items = [
  { icon: <BookOpen size={17} />, id: "Edukasi Perfumery", en: "Perfumery Education" },
  { icon: <Beaker size={17} />, id: "Produk & Laboratorium", en: "Products & Laboratory" },
  { icon: <CalendarDays size={17} />, id: "Program & Event", en: "Programs & Events" },
  { icon: <ShoppingBag size={17} />, id: "Brand & Platform Digital", en: "Brands & Digital Platform" },
];

export default function Hero() {
  const { lang } = useLang();

  return (
    <section className="relative flex min-h-[780px] items-center overflow-hidden pt-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(13,148,136,.18),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(249,115,22,.08),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/15 bg-teal-300/10 px-4 py-2">
            <Sparkles size={14} className="text-teal-300" />
            <span className="text-xs font-black uppercase tracking-[0.18em] text-teal-100">
              {lang === "id" ? "Ekosistem Parfum Indonesia" : "Indonesia Fragrance Ecosystem"}
            </span>
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-[4.25rem]">
            {lang === "id" ? "Merawat kreativitas," : "Nurturing creativity,"}
            <span className="block bg-gradient-to-r from-[#5EEAD4] via-[#14B8A6] to-[#F97316] bg-clip-text text-transparent">
              {lang === "id" ? "membangun ekosistem parfum." : "building a fragrance ecosystem."}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#8aae9e] md:text-lg">
            {lang === "id"
              ? "PT Sensasi Wangi Indonesia menghubungkan edukasi, produk, layanan laboratorium, event, dan platform digital dalam satu ekosistem yang saling menguatkan."
              : "PT Sensasi Wangi Indonesia connects education, products, laboratory services, events, and digital platforms within one mutually reinforcing ecosystem."}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/divisions" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5">
              {lang === "id" ? "Jelajahi Ekosistem" : "Explore Ecosystem"}
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="/events" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.08]">
              <CalendarDays size={16} className="text-orange-300" />
              {lang === "id" ? "Program & Event" : "Programs & Events"}
            </Link>
          </div>
        </div>

        <div className="animate-fade-up rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-7">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">
            {lang === "id" ? "Dari Formula hingga Experience" : "From Formula to Experience"}
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
            {lang === "id" ? "Empat jalur yang saling terhubung." : "Four connected pathways."}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/5 bg-[#0c1714]/70 p-4 transition hover:border-teal-300/20 hover:bg-[#10201b]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">{item.icon}</div>
                <h3 className="mt-4 text-sm font-black text-white">{lang === "id" ? item.id : item.en}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
