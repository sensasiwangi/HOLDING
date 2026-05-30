"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import type { Lang } from "@/lib/dictionary";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  FileDown,
  ExternalLink,
  Users,
  MapPin,
  Award,
  ChevronRight,
  ArrowRight,
  Star,
  Megaphone,
  PartyPopper,
  Clock,
} from "lucide-react";
import DivisionLayout from "../DivisionLayout";

/* ── text dictionary ── */
const T = {
  profile: {
    id: {
      tagline: "Divisi Event Organizer & Fragrantions",
      title: "Event Organizer",
      subtitle: "& Fragrantions",
      desc: "Divisi yang mengelola seluruh perencanaan, pelaksanaan, dan evaluasi event parfum nasional — termasuk Fragrantions Expo, Road to Fragrantions, kolaborasi brand, sponsorship, tenant management, dan komunitas parfum Indonesia.",
      visionTitle: "Visi",
      vision: "Menjadi event organizer parfum terdepan di Asia Tenggara yang menghubungkan kreator, brand, dan komunitas parfum dalam satu ekosistem.",
      missionTitle: "Misi",
      mission: "Riset & perencanaan event → Sponsorship & partnership → Execution & operations → Tenant management → Community building & evaluasi.",
    },
    en: {
      tagline: "Event Organizer & Fragrantions Division",
      title: "Event Organizer",
      subtitle: "& Fragrantions",
      desc: "The division that manages all planning, execution, and evaluation of national fragrance events — including Fragrantions Expo, Road to Fragrantions, brand collaborations, sponsorships, tenant management, and the Indonesian fragrance community.",
      visionTitle: "Vision",
      vision: "Become the leading fragrance event organizer in Southeast Asia, connecting creators, brands, and the fragrance community in one ecosystem.",
      missionTitle: "Mission",
      mission: "Event research & planning → Sponsorship & partnerships → Execution & operations → Tenant management → Community building & evaluation.",
    },
  },
  portfolio: {
    id: { title: "Portofolio Event", subtitle: "Event-event besar yang dikelola divisi Event & Fragrantions" },
    en: { title: "Event Portfolio", subtitle: "Major events managed by the Event & Fragrantions division" },
  },
  upcoming: {
    id: { title: "Event Mendatang", subtitle: "Event yang akan datang dalam waktu dekat" },
    en: { title: "Upcoming Events", subtitle: "Events coming up in the near future" },
  },
  finance: {
    id: { title: "Keuangan Event", revenue: "Pendapatan", expense: "Pengeluaran", net: "Laba/Rugi Bersih", setoran: "Setoran ke Holding (30%)", month: "Bulan" },
    en: { title: "Event Finance", revenue: "Revenue", expense: "Expenses", net: "Net Profit/Loss", setoran: "Contribution to Holding (30%)", month: "Month" },
  },
  team: {
    id: { title: "Tim Event", pic: "Penanggung Jawab", role: "Jabatan", members: "Anggota Tim" },
    en: { title: "Event Team", pic: "Person in Charge", role: "Role", members: "Team Members" },
  },
  milestones: {
    id: { title: "Milestone & Roadmap", done: "Selesai", ongoing: "Berjalan", upcoming: "Akan Datang" },
    en: { title: "Milestones & Roadmap", done: "Completed", ongoing: "Ongoing", upcoming: "Upcoming" },
  },
} as const;

/* ── static data ── */
const EVENTS = [
  {
    nameId: "Fragrantions Expo",
    nameEn: "Fragrantions Expo",
    descId: "Pameran parfum nasional terbesar di Indonesia. Menampilkan 50+ brand parfum, workshop, talkshow, live demo, dan kolaborasi internasional. Lokasi: Taman Mini Indonesia Indah, Jakarta.",
    descEn: "Indonesia's largest national perfume expo. Featuring 50+ fragrance brands, workshops, talkshows, live demos, and international collaborations. Venue: Taman Mini Indonesia Indah, Jakarta.",
    color: "from-blue-600 to-cyan-600",
    icon: "🎪",
    location: "Jakarta",
    dateId: "Agustus 2026",
    dateEn: "August 2026",
    attendees: "5000+",
    brands: "50+",
  },
  {
    nameId: "Road to Fragrantions",
    nameEn: "Road to Fragrantions",
    descId: "Roadshow pra-event yang mengunjungi kota-kota besar di Indonesia untuk promosi, rekrutmen tenant, workshop mini, dan engagement komunitas parfum lokal.",
    descEn: "Pre-event roadshow visiting major Indonesian cities for promotion, tenant recruitment, mini workshops, and local fragrance community engagement.",
    color: "from-indigo-500 to-purple-600",
    icon: "🚌",
    location: "Multi-city",
    dateId: "Juli 2026",
    dateEn: "July 2026",
    attendees: "2000+",
    brands: "20+",
  },
];

const TEAM = [
  { name: "Wapiq Rizya Zaelan", roleId: "PIC / Event Director", roleEn: "PIC / Event Director", icon: "⭐", isPic: true },
  { name: "Wapiq Rizya Zaelan", roleId: "Penanggung Jawab Fragrantions Expo Agustus 2026", roleEn: "Person in Charge - Fragrantions Expo August 2026", icon: "🎪", isPic: true },
  { name: "Wapiq Rizya Zaelan", roleId: "Penanggung Jawab Road to Fragrantions Juli 2026", roleEn: "Person in Charge - Road to Fragrantions July 2026", icon: "🚌", isPic: true },
];

const MILESTONES = [
  {
    titleId: "Pembentukan divisi Event Organizer & Fragrantions",
    titleEn: "Establishment of the Event Organizer & Fragrantions division",
    date: "2023",
    status: "done" as const,
  },
  {
    titleId: "Fragrantions Expo perdana",
    titleEn: "Inaugural Fragrantions Expo",
    date: "2023",
    status: "done" as const,
  },
  {
    titleId: "Ekspansi ke 5 kota — Road to Fragrantions Vol 1",
    titleEn: "Expansion to 5 cities — Road to Fragrantions Vol 1",
    date: "2024",
    status: "done" as const,
  },
  {
    titleId: "Fragrantions Expo edisi kedua — 30+ tenant",
    titleEn: "Fragrantions Expo 2nd edition — 30+ tenants",
    date: "2025",
    status: "done" as const,
  },
  {
    titleId: "Fragrantions Expo 2026 — skala nasional",
    titleEn: "Fragrantions Expo 2026 — national scale",
    date: "2026",
    status: "ongoing" as const,
  },
  {
    titleId: "Road to Fragrantions Vol 2 — 10 kota",
    titleEn: "Road to Fragrantions Vol 2 — 10 cities",
    date: "2026",
    status: "ongoing" as const,
  },
  {
    titleId: "Fragrantions Expo edisi internasional",
    titleEn: "International edition of Fragrantions Expo",
    date: "2027",
    status: "upcoming" as const,
  },
];

const METRICS = [
  {
    labelId: "Total Event", labelEn: "Total Events",
    value: "50+", icon: <Calendar size={20} />,
  },
  {
    labelId: "Total Peserta", labelEn: "Total Attendees",
    value: "10.000+", icon: <Users size={20} />,
  },
  {
    labelId: "Kota Terjangkau", labelEn: "Cities Reached",
    value: "10+", icon: <MapPin size={20} />,
  },
  {
    labelId: "Rating Event", labelEn: "Event Rating",
    value: "4.8/5", icon: <Award size={20} />,
  },
];

export default function EventPage() {
  const { lang } = useLang();
  const L: Lang = lang;
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => {
        setFinanceData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Use event finance from API if available (key may not exist yet)
  const eventFinance = financeData?.event || null;
  const months =
    eventFinance?.months || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"];
  const revenues = eventFinance?.revenue || [5000000, 7500000, 6200000, 8000000, 12000000, 9500000, 15000000, 18000000];
  const expenses = eventFinance?.expense || [3500000, 4800000, 4200000, 5500000, 8500000, 6800000, 11000000, 13000000];

  const totalRev = revenues.reduce((a: number, b: number) => a + b, 0) || 81200000;
  const totalExp = expenses.reduce((a: number, b: number) => a + b, 0) || 57300000;
  const net = totalRev - totalExp;
  const setoran = Math.round(totalRev * 0.3);

  return (
    <DivisionLayout
      slug="event"
      color="blue"
      iconBg="bg-blue-500/20"
      iconColor="text-blue-400"
      tagline={T.profile[L].tagline}
      title={T.profile[L].title}
      subtitle={T.profile[L].subtitle}
      heroIcon={<Calendar size={32} className="text-blue-400" />}
    >
      {/* Profile Description */}
      <section className="mb-12">
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
          {T.profile[L].desc}
        </p>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={18} /> {T.profile[L].visionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].vision}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> {T.profile[L].missionTitle}
            </h3>
            <p className="text-gray-300">{T.profile[L].mission}</p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((m, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 text-center">
              <div className="flex justify-center mb-2 text-blue-400">{m.icon}</div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-sm text-gray-500">{L === "id" ? m.labelId : m.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Event Portfolio */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <PartyPopper size={24} className="text-blue-400" />
          {T.portfolio[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.portfolio[L].subtitle}</p>
        <div className="grid md:grid-cols-2 gap-6">
          {EVENTS.map((ev, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden group hover:border-blue-500/50 transition-all duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${ev.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{ev.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {L === "id" ? ev.nameId : ev.nameEn}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {ev.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {L === "id" ? ev.dateId : ev.dateEn}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {L === "id" ? ev.descId : ev.descEn}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    <Users size={14} className="inline mr-1" />
                    {ev.attendees} {L === "id" ? "peserta" : "attendees"}
                  </span>
                  <span className="text-blue-400">
                    {ev.brands} {L === "id" ? "brand" : "brands"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Finance */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign size={24} className="text-green-400" />
          {T.finance[L].title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].revenue}</div>
            <div className="text-xl font-bold text-green-400">
              Rp {(totalRev / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].expense}</div>
            <div className="text-xl font-bold text-red-400">
              Rp {(totalExp / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].net}</div>
            <div className={`text-xl font-bold ${net >= 0 ? "text-blue-400" : "text-red-400"}`}>
              Rp {(net / 1000000).toFixed(1)}jt
            </div>
          </div>
        </div>

        {/* Setoran card */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">{T.finance[L].setoran}</div>
            <div className="text-xl font-bold text-blue-400">Rp {(setoran / 1000000).toFixed(1)}jt</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              30% {L === "id" ? "dari total pendapatan" : "of total revenue"} Rp {(totalRev / 1000000).toFixed(1)}jt
            </div>
          </div>
        </div>

        {/* Monthly table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-gray-400 font-medium">{T.finance[L].month}</th>
                <th className="px-4 py-3 text-green-400 font-medium text-right">{T.finance[L].revenue}</th>
                <th className="px-4 py-3 text-red-400 font-medium text-right">{T.finance[L].expense}</th>
                <th className="px-4 py-3 text-blue-400 font-medium text-right">{T.finance[L].net}</th>
                <th className="px-4 py-3 text-blue-300 font-medium text-right">{T.finance[L].setoran}</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m: string, i: number) => {
                const rev = revenues[i] || 0;
                const exp = expenses[i] || 0;
                const n = rev - exp;
                const set = Math.round(rev * 0.3);
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-gray-300 font-medium">{m}</td>
                    <td className="px-4 py-3 text-green-400 text-right">Rp {rev.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-red-400 text-right">Rp {exp.toLocaleString("id-ID")}</td>
                    <td className={`px-4 py-3 text-right ${n >= 0 ? "text-blue-400" : "text-red-400"}`}>
                      Rp {n.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-blue-300 text-right">Rp {set.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock size={24} className="text-cyan-400" />
          {T.upcoming[L].title}
        </h2>
        <p className="text-gray-500 mb-6">{T.upcoming[L].subtitle}</p>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Expo Agustus 2026 */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <PartyPopper size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Fragrantions Expo</h3>
                <span className="text-sm text-cyan-400">{L === "id" ? "Agustus 2026" : "August 2026"}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {L === "id"
                ? "Pameran parfum nasional terbesar di Taman Mini Indonesia Indah, Jakarta. 50+ brand, workshop, talkshow, dan kolaborasi internasional."
                : "The largest national perfume expo at Taman Mini Indonesia Indah, Jakarta. 50+ brands, workshops, talkshows, and international collaborations."}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} /> Jakarta
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                {L === "id" ? "PIC: Wapiq Rizya Zaelan" : "PIC: Wapiq Rizya Zaelan"}
              </span>
            </div>
          </div>

          {/* Road to Fragrantions Juli 2026 */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500/20 p-3 rounded-xl">
                <Megaphone size={24} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Road to Fragrantions</h3>
                <span className="text-sm text-purple-400">{L === "id" ? "Juli 2026" : "July 2026"}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {L === "id"
                ? "Roadshow pra-event ke kota-kota besar di Indonesia untuk promosi Fragrantions Expo 2026 dan rekrutmen tenant."
                : "Pre-event roadshow to major Indonesian cities promoting Fragrantions Expo 2026 and recruiting tenants."}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} /> Multi-city
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
                {L === "id" ? "PIC: Wapiq Rizya Zaelan" : "PIC: Wapiq Rizya Zaelan"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Users size={24} className="text-blue-400" />
          {T.team[L].title}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {TEAM.map((member, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border ${
                member.isPic
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{member.icon}</span>
                <div>
                  <h3 className="text-white font-bold">{member.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.isPic
                      ? "bg-blue-400/20 text-blue-400"
                      : "bg-white/10 text-gray-400"
                  }`}>
                    {L === "id" ? member.roleId : member.roleEn}
                  </span>
                </div>
              </div>
              {member.isPic && (
                <div className="mt-3 text-xs text-blue-400 flex items-center gap-1">
                  <Star size={12} />
                  {L === "id" ? "Penanggung Jawab" : "Person in Charge"}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Target size={24} className="text-orange-400" />
          {T.milestones[L].title}
        </h2>
        <div className="space-y-4">
          {MILESTONES.map((ms, i) => {
            const statusColors = {
              done: "border-green-500/50 bg-green-500/5",
              ongoing: "border-orange-500/50 bg-orange-500/5",
              upcoming: "border-gray-500/30 bg-white/5",
            };
            const statusLabels = {
              done: L === "id" ? "✅ Selesai" : "✅ Completed",
              ongoing: L === "id" ? "🔄 Berjalan" : "🔄 Ongoing",
              upcoming: L === "id" ? "📋 Akan Datang" : "📋 Upcoming",
            };
            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl border ${statusColors[ms.status]}`}
              >
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {L === "id" ? ms.titleId : ms.titleEn}
                  </div>
                  <div className="text-sm text-gray-500">{ms.date}</div>
                </div>
                <span className="text-sm">{statusLabels[ms.status]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-wrap gap-4">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <FileDown size={18} />
          {L === "id" ? "Download PDF Profil" : "Download Profile PDF"}
        </button>
        <a
          href="https://docs.google.com/spreadsheets/d/1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA/edit#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <ExternalLink size={18} />
          {L === "id" ? "Google Sheet Event" : "Event Google Sheet"}
        </a>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-3 rounded-xl transition-colors"
        >
          <Calendar size={18} />
          {L === "id" ? "Halaman Event" : "Events Page"}
          <ArrowRight size={16} />
        </Link>
      </section>
    </DivisionLayout>
  );
}
