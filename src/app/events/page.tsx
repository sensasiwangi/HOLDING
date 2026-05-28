"use client";

import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
// Instagram icon as inline SVG since it's not available in this lucide-react version
const InstagramIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

export default function EventsPage() {
  const { lang } = useLang();

  const eyebrow = { id: "Event & Ekosistem", en: "Events & Ecosystem" };
  const title = {
    id: "Fragrantions — Festival Parfum Indonesia",
    en: "Fragrantions — Indonesia's Perfume Festival",
  };
  const subtitle = {
    id: "Fragrantions adalah festival parfum terbesar di Indonesia yang menghubungkan brand, kreator, edukator, dan penggemar parfum.",
    en: "Fragrantions is Indonesia's largest fragrance festival connecting brands, creators, educators, and fragrance enthusiasts.",
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

      {/* Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Expo 2026 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <CalendarDays size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#10201d]">
                    Fragrantions Expo 2026
                  </h2>
                  <p className="text-blue-600 font-semibold">
                    15&ndash;16 Agustus 2026
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>Taman Mini Indonesia Indah, Jakarta</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {lang === "id"
                  ? "Pameran parfum nasional di Taman Mini Indonesia Indah, Jakarta — menampilkan 50+ brand parfum, workshop, talkshow, dan kolaborasi internasional."
                  : "National perfume expo at Taman Mini Indonesia Indah, Jakarta — featuring 50+ fragrance brands, workshops, talkshows, and international collaborations."}
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  50+ Brands
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  Workshop
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  Talkshow
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {lang === "id" ? "Kolaborasi" : "Collaboration"}
                </span>
              </div>
            </div>

            {/* Road to Fragrantions Vol 2 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                  <CalendarDays size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#10201d]">
                    Road to Fragrantions Vol 2
                  </h2>
                  <p className="text-amber-600 font-semibold">
                    {lang === "id" ? "Juli 2026" : "July 2026"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>
                  {lang === "id"
                    ? "Kota-kota besar di Indonesia"
                    : "Major cities across Indonesia"}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {lang === "id"
                  ? "Roadshow pra-event yang mengunjungi kota-kota besar di Indonesia untuk promosi Fragrantions Expo 2026 dan rekrutment tenant."
                  : "Pre-event roadshow visiting major Indonesian cities to promote Fragrantions Expo 2026 and recruit tenants."}
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  Roadshow
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  Promotion
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  {lang === "id" ? "Rekrutmen" : "Recruitment"}
                </span>
              </div>
            </div>
          </div>

          {/* Instagram CTA */}
          <div className="mt-14 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-8 sm:p-10 text-center text-white">
            <InstagramIcon size={40} className="mx-auto mb-4" />
            <h3 className="text-2xl font-extrabold mb-3">
              {lang === "id"
                ? "Ikuti Kami di Instagram"
                : "Follow Us on Instagram"}
            </h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              {lang === "id"
                ? "Dapatkan update terbaru tentang Fragrantions, brand SWI, dan event parfum Indonesia."
                : "Get the latest updates on Fragrantions, SWI brands, and Indonesian fragrance events."}
            </p>
            <a
              href="https://www.instagram.com/fragrantions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-white/90 transition-colors"
            >
              @fragrantions
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
