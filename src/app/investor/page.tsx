"use client";

import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";
import { Building2, TrendingUp, Award, DollarSign } from "lucide-react";

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
    <div className="container max-w-[1240px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-[var(--brand)] font-bold">
          {tr("investor.eyebrow")}
        </div>
        <h1 className="text-4xl font-extrabold text-[var(--ink)] mt-2">{tr("investor.title")}</h1>
        <p className="text-[var(--muted)] mt-3 max-w-[700px]">{tr("investor.subtitle")}</p>
      </div>

      {/* 4 Pillars */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Narrative */}
        <div className="border border-[var(--line)] rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--soft)] flex items-center justify-center text-[var(--brand)]">
              <Building2 size={20} />
            </div>
            <h3 className="font-bold text-[var(--ink)]">{tr("investor.narrative")}</h3>
          </div>
          <p className="text-sm text-[#354943]">{tr("investor.narrativeDesc")}</p>
        </div>

        {/* Market */}
        <div className="border border-[var(--line)] rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--soft)] flex items-center justify-center text-[var(--brand)]">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-[var(--ink)]">{tr("investor.market")}</h3>
          </div>
          <p className="text-sm text-[#354943]">{tr("investor.marketDesc")}</p>
        </div>

        {/* Traction */}
        <div className="border border-[var(--line)] rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--soft)] flex items-center justify-center text-[var(--brand)]">
              <Award size={20} />
            </div>
            <h3 className="font-bold text-[var(--ink)]">{tr("investor.traction")}</h3>
          </div>
          <p className="text-sm text-[#354943]">{tr("investor.tractionDesc")}</p>
        </div>

        {/* Ask */}
        <div className="border border-[var(--line)] rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--soft)] flex items-center justify-center text-[var(--brand)]">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-[var(--ink)]">{tr("investor.ask")}</h3>
          </div>
          <p className="text-sm text-[#354943]">{tr("investor.askDesc")}</p>
        </div>
      </div>

      {/* Revenue Streams */}
      <div className="border border-[var(--line)] rounded-lg p-6 bg-white mb-10">
        <h3 className="font-bold text-[var(--ink)] text-lg mb-4">{tr("dashboard.revenue")}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "SWI Store", desc: "Retail, kelas, custom perfume, repeat order" },
            { name: "Fragrantions", desc: "Sponsor, tenant, ticketing, merchandise" },
            { name: "Production & Brands", desc: "SKU, COGS, distributor, B2B white label" },
            { name: "Marketplace", desc: "GMV, conversion, AOV, fulfillment" },
            { name: "Digital / AI", desc: "Database, CRM, recommendation engine" },
          ].map((r) => (
            <div key={r.name} className="border border-[var(--line)] rounded-lg p-4 bg-[var(--soft)]">
              <h4 className="font-bold text-sm text-[var(--ink)]">{r.name}</h4>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Snapshot */}
      <div className="border border-[var(--line)] rounded-lg p-6 bg-white mb-10">
        <h3 className="font-bold text-[var(--ink)] text-lg mb-4">{tr("dashboard.finance")}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="text-left py-2 text-[var(--muted)] font-medium">{tr("dashboard.name")}</th>
                  <th className="text-left py-2 text-[var(--muted)] font-medium">Estimasi</th>
                </tr>
              </thead>
              <tbody className="text-[#354943]">
                <tr className="border-b border-[var(--line)]"><td className="py-2">{tr("dashboard.capex")}</td><td>Rp 300–500 juta</td></tr>
                <tr className="border-b border-[var(--line)]"><td className="py-2">{tr("dashboard.opex")}</td><td>Rp 45–80 juta/bln</td></tr>
                <tr className="border-b border-[var(--line)]"><td className="py-2">{tr("dashboard.revenuePotential")}</td><td>Rp 60–120 juta/bln</td></tr>
                <tr><td className="py-2">{tr("dashboard.payback")}</td><td>18–30 bulan</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-[var(--soft)] rounded-lg p-5">
            <p className="text-sm text-[#354943]">
              {lang === "id"
                ? "Angka di atas merupakan estimasi awal berdasarkan proyeksi market dan kapasitas operasional. Data aktual akan dilengkapi setelah audit keuangan internal."
                : "The figures above are initial estimates based on market projections and operational capacity. Actual data will be provided after internal financial audit."}
            </p>
            <p className="text-sm text-[var(--brand)] font-bold mt-3">
              {tr("dashboard.investorReadiness")}: 45%
            </p>
            <div className="h-2 bg-[#e8efec] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] rounded-full" style={{ width: "45%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border border-[var(--line)] rounded-lg p-8 bg-gradient-to-br from-[#eef8f4] to-white text-center">
        <h3 className="text-2xl font-extrabold text-[var(--ink)]">{tr("investor.contactInvestor")}</h3>
        <p className="text-[var(--muted)] mt-2 max-w-[500px] mx-auto">
          {lang === "id"
            ? "Untuk informasi lebih lanjut, proposal lengkap, dan data room — silakan hubungi tim kami."
            : "For more information, full proposals, and data room access — please contact our team."}
        </p>
        <button
          onClick={() => window.print()}
          className="mt-6 px-5 py-3 rounded-lg bg-[var(--brand)] text-white font-bold text-sm hover:bg-[var(--brand-2)] transition"
        >
          {tr("investor.downloadDeck")}
        </button>
      </div>
    </div>
  );
}
