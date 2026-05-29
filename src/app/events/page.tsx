"use client";

import { CalendarDays, MapPin, ExternalLink, Star, Users, Ticket } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const events = [
  {
    name: "Fragrantions Expo",
    date: "Agustus 2026",
    location: "Jakarta Convention Center",
    attendees: "5.000+",
    brands: "50+",
    status: "upcoming" as const,
    gradient: "from-blue-500 to-indigo-600",
    emoji: "🎪",
  },
  {
    name: "Road to Fragrantions",
    date: "Juli 2026",
    location: "Seluruh Indonesia",
    attendees: "3.000+",
    brands: "30+",
    status: "upcoming" as const,
    gradient: "from-purple-500 to-pink-600",
    emoji: "🚗",
  },
];

const pastEvents = [
  { name: "Fragrantions Expo 2025", date: "2025", attendees: "3.200" },
  { name: "SWI Pop-up Market", date: "2025", attendees: "1.500" },
  { name: "Road to Fragrantions 2024", date: "2024", attendees: "2.000" },
];

export default function EventsPage() {
  const { lang } = useLang();

  const eyebrow = { id: "Event & Ekosistem", en: "Events & Ecosystem" };
  const title = { id: "Fragrantions — Festival Parfum Indonesia", en: "Fragrantions — Indonesia's Perfume Festival" };
  const subtitle = {
    id: "Fragrantions adalah festival parfum terbesar di Indonesia yang menghubungkan brand, kreator, edukator, dan penggemar parfum.",
    en: "Fragrantions is Indonesia's largest fragrance festival connecting brands, creators, educators, and fragrance enthusiasts.",
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] animate-float1" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500/5 blur-[100px] animate-float2" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6 animate-fade-up">
            <CalendarDays size={14} className="text-blue-400" />
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

      {/* Upcoming Events */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs font-bold text-[#5d7068] uppercase tracking-[0.2em] mb-6">
            {lang === "id" ? "Event Mendatang" : "Upcoming Events"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 stagger">
            {events.map((ev, i) => (
              <div key={i} className="card-luxury group animate-fade-up overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${ev.gradient}`} />
                <div className="p-8">
                  <div className="text-5xl mb-4">{ev.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{ev.name}</h3>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-[#7a9e8f]">
                      <CalendarDays size={14} className="text-blue-400" /> {ev.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#7a9e8f]">
                      <MapPin size={14} className="text-emerald-400" /> {ev.location}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Users size={16} className="text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{ev.attendees}</div>
                      <div className="text-[10px] text-[#5d7068]">{lang === "id" ? "Peserta" : "Attendees"}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <Ticket size={16} className="text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{ev.brands}</div>
                      <div className="text-[10px] text-[#5d7068]">{lang === "id" ? "Brand" : "Brands"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs font-bold text-[#5d7068] uppercase tracking-[0.2em] mb-6">
            {lang === "id" ? "Event Sebelumnya" : "Past Events"}
          </h2>
          <div className="card-luxury overflow-hidden">
            <div className="divide-y divide-white/5">
              {pastEvents.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="text-white font-semibold">{ev.name}</div>
                    <div className="text-sm text-[#5d7068]">{ev.date}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#7a9e8f]">
                    <Users size={14} /> {ev.attendees}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
