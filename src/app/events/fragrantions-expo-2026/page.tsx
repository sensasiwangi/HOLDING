"use client";

import { CalendarDays, MapPin, Users, Star, ArrowLeft, ExternalLink, Ticket, Mic, Music, Utensils, Camera, Shield } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";

function tt(key: { id: string; en: string }, lang: Lang): string {
  return lang === "id" ? key.id : key.en;
}

const VENDORS = [
  { name: "Catering", icon: <Utensils size={16} />, desc: { id: "F&B tenant untuk pengunjung", en: "F&B vendors for visitors" } },
  { name: "Audio & Visual", icon: <Mic size={16} />, desc: { id: "Sound system, lighting, stage", en: "Sound system, lighting, stage" } },
  { name: "Photography", icon: <Camera size={16} />, desc: { id: "Foto & dokumentasi event", en: "Photo & event documentation" } },
  { name: "Security", icon: <Shield size={16} />, desc: { id: "Keamanan & crowd control", en: "Security & crowd control" } },
];

const SPONSOR_TIERS = [
  { tier: "Platinum", price: "Rp 100.000.000+", benefits: ["Logo utama", "Booth 6x6m", "MC mention x5", "Social media blast"] },
  { tier: "Gold", price: "Rp 50.000.000+", benefits: ["Logo sekunder", "Booth 4x4m", "MC mention x3", "Social media mention"] },
  { tier: "Silver", price: "Rp 25.000.000+", benefits: ["Logo footer", "Booth 3x3m", "MC mention x1"] },
  { tier: "Media Partner", price: "Rp 10.000.000+", benefits: ["Logo co-branding", "Content collaboration"] },
];

const TIMELINE = [
  { phase: { id: "Pre-Event (Juli)", en: "Pre-Event (July)" }, tasks: [
    { id: "Konfirmasi venue & kontrak", en: "Venue confirmation & contract", done: false },
    { id: "Open registrasi tenant", en: "Open vendor registration", done: false },
    { id: "Launch sponsor deck", en: "Launch sponsor deck", done: false },
    { id: "PR & media campaign", en: "PR & media campaign", done: false },
  ]},
  { phase: { id: "D-Week (Agustus)", en: "D-Week (August)" }, tasks: [
    { id: "Setup booth & stage", en: "Booth & stage setup", done: false },
    { id: "Briefing tenant & sponsor", en: "Vendor & sponsor briefing", done: false },
    { id: "Walkthrough & rehearsal", en: "Walkthrough & rehearsal", done: false },
  ]},
  { phase: { id: "D-Day (15-17 Agustus)", en: "D-Day (15-17 August)" }, tasks: [
    { id: "Event berjalan 3 hari", en: "Event runs for 3 days", done: false },
    { id: "Live streaming & coverage", en: "Live streaming & coverage", done: false },
    { id: "Peserta 5.000+ harian", en: "5.000+ visitors daily", done: false },
  ]},
  { phase: { id: "Post-Event", en: "Post-Event" }, tasks: [
    { id: "Dekonstruksi venue", en: "Venue deconstruction", done: false },
    { id: "Laporan keuangan & ROI", en: "Financial report & ROI", done: false },
    { id: "Thank you note & press release", en: "Thank you note & press release", done: false },
    { id: "Evaluasi & lessons learned", en: "Evaluation & lessons learned", done: false },
  ]},
];

export default function FragrantionsExpoPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-10 left-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[180px] animate-float1" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] animate-float2" />

        <div className="relative max-w-6xl mx-auto px-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-[#7a9e8f] hover:text-white transition mb-6">
            <ArrowLeft size={16} /> <span>{lang === "id" ? "Kembali ke Events" : "Back to Events"}</span>
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-6xl">🎪</span>
            <div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">15-17 Agustus 2026</p>
              <h1 className="text-3xl md:text-5xl font-black">Fragrantions Expo 2026</h1>
            </div>
          </div>
          <p className="text-lg text-[#7a9e8f] max-w-3xl leading-relaxed">
            {lang === "id"
              ? "Festival parfum terbesar di Indonesia. 5.000+ pengunjung, 50+ brand, 3 hari penuh edukasi, kreativitas, dan pengalaman aroma tak terlupakan di Jakarta Convention Center."
              : "Indonesia's largest fragrance festival. 5,000+ visitors, 50+ brands, 3 full days of education, creativity, and unforgettable scent experiences at Jakarta Convention Center."}
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <CalendarDays size={20} />, label: { id: "Tanggal", en: "Date" }, value: "15-17 Agt 2026" },
              { icon: <MapPin size={20} />, label: { id: "Venue", en: "Venue" }, value: "JCC Jakarta" },
              { icon: <Users size={20} />, label: { id: "Pengunjung", en: "Visitors" }, value: "5.000+/hari" },
              { icon: <Star size={20} />, label: { id: "Brand", en: "Brands" }, value: "50+" },
            ].map((s, i) => (
              <div key={i} className="card-luxury p-5 text-center">
                <div className="text-blue-400 mb-2 flex justify-center">{s.icon}</div>
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-[#7a9e8f]">{tt(s.label, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Categories */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-6">🤝 {lang === "id" ? "Kategori Vendor" : "Vendor Categories"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VENDORS.map((v, i) => (
              <div key={i} className="card-luxury p-5 hover:border-blue-500/30 transition-all">
                <div className="text-blue-400 mb-3">{v.icon}</div>
                <h4 className="font-bold text-white text-sm mb-1">{v.name}</h4>
                <p className="text-xs text-[#7a9e8f]">{tt(v.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Tiers */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <Ticket size={24} className="text-orange-400" />
            {lang === "id" ? "Paket Sponsorsip" : "Sponsorship Packages"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPONSOR_TIERS.map((sp, i) => (
              <div key={i} className="card-luxury group hover:border-orange-500/30 transition-all">
                <div className={`h-1 ${i === 0 ? "bg-gradient-to-r from-gray-300 to-white" : i === 1 ? "bg-gradient-to-r from-yellow-500 to-amber-500" : i === 2 ? "bg-gradient-to-r from-gray-400 to-gray-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`} />
                <div className="p-6">
                  <h3 className="font-bold text-lg text-white mb-1">{sp.tier}</h3>
                  <p className="text-2xl font-black text-orange-400 mb-4">{sp.price}</p>
                  <ul className="space-y-2">
                    {sp.benefits.map((b, j) => (
                      <li key={j} className="text-xs text-[#7a9e8f] flex items-start gap-2">
                        <span className="text-tosca mt-0.5">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-6">📅 {lang === "id" ? "Timeline & Milestones" : "Timeline & Milestones"}</h2>
          <div className="space-y-6">
            {TIMELINE.map((phase, i) => (
              <div key={i} className="card-luxury">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="p-6">
                  <h3 className="font-bold text-blue-400 mb-4">{tt(phase.phase, lang)}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {phase.tasks.map((task, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink text-xs font-bold ${task.done ? "bg-green-500/20 text-green-400" : "bg-white/5 text-[#5d7068]"}`}>
                          {task.done ? "✓" : "○"}
                        </div>
                        <span className={`text-sm ${task.done ? "text-green-300" : "text-[#7a9e8f]"}`}>{tt(task, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/divisions/event" className="btn-luxury inline-flex items-center gap-2">
            <Music size={16} />
            {lang === "id" ? "Lihat Divisi Event" : "View Event Division"}
            <ExternalLink size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
