"use client";

import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";
import { Building2, TrendingUp, Award, DollarSign, ArrowRight, Shield, Star } from "lucide-react";
import Link from "next/link";

export default function InvestorPage() {
  const { lang } = useLang();

  function tr(key: string): string {
    const keys = key.split(".");
    let val: any = dict;
    for (const k of keys) {
      val = val?.[k];
      if (!val) return key;
    }
    if (typeof val === "object" && val[lang]) return val[lang];
    return val;
  }

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute top-20 left-0 w-96 h-96 rounded-full bg-[#c9a84c]/10 blur-[120px] animate-float1" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#0D9488]/10 blur-[100px] animate-float2" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6 animate-fade-up">
            <Star size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-[#8aae9e] uppercase tracking-wider">{tr("investor.eyebrow")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient-orange">{tr("investor.title")}</span>
          </h1>
          <p className="text-lg text-[#7a9e8f] max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {tr("investor.subtitle")}
          </p>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-5 stagger">
            {[
              { icon: <Building2 size={20} />, tr: "investor.narrative", trDesc: "investor.narrativeDesc", color: "text-teal-400" },
              { icon: <TrendingUp size={20} />, tr: "investor.market", trDesc: "investor.marketDesc", color: "text-blue-400" },
              { icon: <Award size={20} />, tr: "investor.traction", trDesc: "investor.tractionDesc", color: "text-purple-400" },
              { icon: <DollarSign size={20} />, tr: "investor.ask", trDesc: "investor.askDesc", color: "text-orange-400" },
            ].map((item, i) => (
              <div key={i} className="card-luxury p-7 animate-fade-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white">{tr(item.tr)}</h3>
                </div>
                <p className="text-[#7a9e8f] text-sm leading-relaxed">{tr(item.trDesc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs font-bold text-[#5d7068] uppercase tracking-[0.2em] mb-6">{tr("dashboard.revenue")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {[
              { name: "SWI Store", desc: "Retail, kelas, custom perfume, repeat order", emoji: "🏪" },
              { name: "Fragrantions", desc: "Sponsor, tenant, ticketing, merchandise", emoji: "🎭" },
              { name: "Production & Brands", desc: "SKU, COGS, distributor, B2B white label", emoji: "🧪" },
              { name: "Marketplace", desc: "GMV, conversion, AOV, fulfillment", emoji: "🌐" },
              { name: "Digital / AI", desc: "Database, CRM, recommendation engine", emoji: "🤖" },
            ].map((r, i) => (
              <div key={i} className="card-luxury p-5 animate-fade-up">
                <div className="text-2xl mb-3">{r.emoji}</div>
                <h4 className="font-bold text-white text-sm mb-1">{r.name}</h4>
                <p className="text-xs text-[#5d7068]">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Snapshot */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs font-bold text-[#5d7068] uppercase tracking-[0.2em] mb-6">{tr("dashboard.finance")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-luxury overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-5 text-[#5d7068] font-medium">{tr("dashboard.name")}</th>
                    <th className="text-left py-3 px-5 text-[#5d7068] font-medium">Estimasi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: tr("dashboard.capex"), value: "Rp 300–500 juta" },
                    { label: tr("dashboard.opex"), value: "Rp 45–80 juta/bln" },
                    { label: tr("dashboard.revenuePotential"), value: "Rp 60–120 juta/bln" },
                    { label: tr("dashboard.payback"), value: "18–30 bulan" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-5 text-[#7a9e8f]">{row.label}</td>
                      <td className="py-3 px-5 text-white font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-luxury p-7">
              <p className="text-[#7a9e8f] text-sm leading-relaxed mb-6">
                {lang === "id"
                  ? "Angka di atas merupakan estimasi awal berdasarkan proyeksi market dan kapasitas operasional. Data aktual akan dilengkapi setelah audit keuangan internal."
                  : "The figures above are initial estimates based on market projections and operational capacity. Actual data will be provided after internal financial audit."}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7a9e8f]">{tr("dashboard.investorReadiness")}</span>
                <span className="text-sm font-bold text-orange-400">45%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8d48b] rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/20 to-[#0D9488]/10" />
            <div className="absolute inset-0 animate-shimmer" />
            <div className="relative p-10 md:p-14 text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">{tr("investor.contactInvestor")}</h3>
              <p className="text-[#8aae9e] max-w-md mx-auto mb-8">
                {lang === "id"
                  ? "Untuk informasi lebih lanjut, proposal lengkap, dan data room — silakan hubungi tim kami."
                  : "For more information, full proposals, and data room access — please contact our team."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#0D9488]/20 transition-all">
                  <Shield size={16} /> Sukuk <ArrowRight size={16} />
                </Link>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-light text-white font-bold text-sm hover:bg-white/10 transition-all">
                  {tr("investor.downloadDeck")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
