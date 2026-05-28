"use client";

import { useState } from "react";
import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";
import {
  Building2, DollarSign, Scale, FileCheck, LogOut, Lock,
  CheckCircle, Clock, Target, BarChart3, TrendingUp, Wallet,
} from "lucide-react";
import FinancePanel from "./finance";

type Tab = "overview" | "keuangan";

const ALLOWED_USERS = [
  { username: "beriman", password: "sensasiwangiindonesia090785" },
  // Tambah direktur lainnya di sini nanti
];

const TRACKER_DATA = [
  { id: 1, name: "Operasional holding", status: "build", pct: 45, pic: "Direksi / Holding Office", deadline: "", note: "Rapikan alur keputusan, folder kerja, meeting cadence" },
  { id: 2, name: "SWI Store", status: "build", pct: 55, pic: "Store Manager", deadline: "", note: "SOP booking, AI Mix, cleanup, feedback pelanggan" },
  { id: 3, name: "Event Organizer / Fragrantions", status: "plan", pct: 38, pic: "Event Lead", deadline: "", note: "Sponsor deck, budget, vendor, tenant, timeline" },
  { id: 4, name: "Production & Brands", status: "build", pct: 48, pic: "Brand / Production Lead", deadline: "", note: "SKU, formula, batch, vendor, packaging, margin" },
  { id: 5, name: "WEB marketplace", status: "plan", pct: 32, pic: "Digital / WEB Lead", deadline: "", note: "Katalog, booking, checkout, SEO, analytics" },
  { id: 6, name: "Digital Systems & AI", status: "build", pct: 42, pic: "Digital Lead", deadline: "", note: "AppSheet, AI Studio, database, automation" },
  { id: 7, name: "Monitoring keuangan", status: "risk", pct: 40, pic: "Finance", deadline: "", note: "Kas, omzet, COGS, OPEX, CAPEX, proyeksi" },
  { id: 8, name: "Legal perusahaan", status: "risk", pct: 35, pic: "Legal / Direksi", deadline: "", note: "Akta, NIB, NPWP, rekening, kontrak, izin" },
  { id: 9, name: "HKI / merek", status: "risk", pct: 25, pic: "Legal / Brand", deadline: "", note: "Status merek SWI, Fragrantions, brand parfum" },
  { id: 10, name: "Investor readiness", status: "plan", pct: 45, pic: "Direksi / BD", deadline: "", note: "Deck, financial model, partner list, data room" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ok: { bg: "bg-[#e7f7ee]", text: "text-[var(--ok)]", label: "Siap" },
  build: { bg: "bg-[#fff7e8]", text: "text-[var(--warn)]", label: "Sedang jalan" },
  plan: { bg: "bg-[#edf6ff]", text: "text-[var(--info)]", label: "Perlu rencana" },
  risk: { bg: "bg-[#fdecec]", text: "text-[var(--risk)]", label: "Perlu perhatian" },
};

export default function DashboardPage() {
  const { lang } = useLang();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const match = ALLOWED_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (match) {
      setLoggedIn(true);
      setError("");
    } else {
      setError(tr("dashboard.invalidCredentials"));
    }
  }

  // ── Login Screen ──
  if (!loggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="w-full max-w-sm border border-[var(--line)] rounded-lg bg-white p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--soft)] flex items-center justify-center mx-auto mb-3">
              <Lock size={20} className="text-[var(--brand)]" />
            </div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">{tr("dashboard.loginTitle")}</h1>
            <p className="text-xs text-[var(--muted)] mt-1">{tr("dashboard.loginSubtitle")}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">{tr("dashboard.username")}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">{tr("dashboard.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)]"
                required
              />
            </div>
            {error && <p className="text-xs text-[var(--risk)]">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[var(--brand)] text-white font-bold text-sm hover:bg-[var(--brand-2)] transition"
            >
              {tr("dashboard.loginBtn")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="container max-w-[1240px] mx-auto px-6 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ink)]">{tr("dashboard.title")}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {lang === "id" ? "Dashboard internal manajemen holding" : "Internal holding management dashboard"}
          </p>
        </div>
        <button
          onClick={() => setLoggedIn(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--line)] text-sm hover:border-[var(--risk)] hover:text-[var(--risk)] transition"
        >
          <LogOut size={14} /> {tr("dashboard.logout")}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-[var(--soft)] rounded-lg p-1">
        {([
          { key: "overview" as Tab, label: tr("dashboard.overview"), icon: <Building2 size={15} /> },
          { key: "keuangan" as Tab, label: tr("dashboard.finance"), icon: <Wallet size={15} /> },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold transition ${
              activeTab === tab.key
                ? "bg-white text-[var(--ink)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Finance Tab ── */}
      {activeTab === "keuangan" ? (
        <FinancePanel />
      ) : (
      <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Building2 />, label: tr("dashboard.totalDivisions"), value: "6+", color: "text-[var(--brand)]" },
          { icon: <TrendingUp />, label: tr("dashboard.investorReadiness"), value: "45%", color: "text-[var(--warn)]" },
          { icon: <Scale />, label: tr("dashboard.legalStatus"), value: "35%", color: "text-[var(--risk)]" },
          { icon: <BarChart3 />, label: tr("dashboard.financeModel"), value: "40%", color: "text-[var(--info)]" },
        ].map((c) => (
          <div key={c.label} className="border border-[var(--line)] rounded-lg bg-white p-5">
            <div className={`text-[var(--muted)] mb-2`}>{c.icon}</div>
            <small className="text-xs text-[var(--muted)]">{c.label}</small>
            <div className={`text-2xl font-extrabold mt-1 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_.6fr] gap-6 mb-8">
        {/* Tracker Table */}
        <div className="border border-[var(--line)] rounded-lg bg-white p-5">
          <h2 className="font-bold text-[var(--ink)] mb-4">{tr("dashboard.tracker")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--soft)]">
                  <th className="py-2 px-3 text-left text-[var(--muted)] font-medium text-xs">{tr("tracker.workstream")}</th>
                  <th className="py-2 px-3 text-left text-[var(--muted)] font-medium text-xs">{tr("tracker.status")}</th>
                  <th className="py-2 px-3 text-left text-[var(--muted)] font-medium text-xs">{tr("tracker.progress")}</th>
                  <th className="py-2 px-3 text-left text-[var(--muted)] font-medium text-xs">{tr("tracker.pic")}</th>
                </tr>
              </thead>
              <tbody>
                {TRACKER_DATA.map((row) => {
                  const s = STATUS_STYLES[row.status] || STATUS_STYLES.plan;
                  return (
                    <tr key={row.id} className="border-b border-[var(--line)]">
                      <td className="py-2.5 px-3 font-medium text-[var(--ink)] text-xs">{row.name}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-[#e8efec] rounded-full flex-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] rounded-full" style={{ width: `${row.pct}%` }} />
                          </div>
                          <span className="text-xs text-[var(--muted)]">{row.pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[var(--muted)]">{row.pic}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Priorities + Revenue */}
        <div className="space-y-6">
          {/* Priorities */}
          <div className="border border-[var(--line)] rounded-lg bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-[var(--brand)]" />
              <h3 className="font-bold text-sm text-[var(--ink)]">{tr("dashboard.priorities")}</h3>
            </div>
            <ol className="space-y-2">
              {(lang === "id"
                ? [
                    "Lengkapi PIC dan deadline setiap divisi",
                    "Satukan file legal PT, NIB, rekening, pajak",
                    "Buat daftar status merek/HKI untuk semua brand",
                    "Isi angka keuangan aktual: kas, omzet, biaya",
                    "Pilih materi publik yang aman di frontpage",
                  ]
                  : [
                      "Complete PIC & deadline per division",
                      "Consolidate legal docs: PT, NIB, bank, taxes",
                      "List brand/IP registration status for all brands",
                      "Fill actual financial figures: cash, revenue, costs",
                      "Select safe public materials for frontpage",
                    ]
              ).map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#354943]">
                  <span className="text-[var(--brand)] font-bold">{i + 1}.</span> {p}
                </li>
              ))}
            </ol>
          </div>

          {/* Investor Readiness */}
          <div className="border border-[var(--line)] rounded-lg bg-white p-5">
            <h3 className="font-bold text-sm text-[var(--ink)] mb-3">{tr("dashboard.investorReadiness")}</h3>
            {[
              { label: tr("dashboard.investorReadiness"), pct: 45 },
              { label: tr("dashboard.legalStatus"), pct: 35 },
              { label: tr("dashboard.financeModel"), pct: 40 },
            ].map((m) => (
              <div key={m.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--muted)]">{m.label}</span>
                  <span className="font-bold text-[var(--brand)]">{m.pct}%</span>
                </div>
                <div className="h-2 bg-[#e8efec] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Streams */}
      <div className="border border-[var(--line)] rounded-lg bg-white p-5 mb-8">
        <h3 className="font-bold text-[var(--ink)] mb-4">{tr("dashboard.revenue")}</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: "SWI Store", desc: "Retail, kelas, workshop, custom perfume, repeat order, upsell" },
            { name: "Fragrantions", desc: "Sponsor, tenant booth, ticketing, merchandise, media package" },
            { name: "Production & Brands", desc: "SKU, COGS, margin, batch, distributor, B2B white label" },
            { name: "Marketplace", desc: "GMV, conversion, AOV, repeat rate, fulfillment SLA, traffic" },
            { name: "Digital / AI", desc: "Database scent profile, retention, recommendation engine, CRM" },
          ].map((r) => (
            <div key={r.name} className="border border-[var(--line)] rounded-lg p-4 bg-[var(--soft)]">
              <h4 className="font-bold text-sm text-[var(--ink)]">{r.name}</h4>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Finance */}
      <div className="border border-[var(--line)] rounded-lg bg-white p-5">
        <h3 className="font-bold text-[var(--ink)] mb-4">{tr("dashboard.finance")}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--soft)]">
                <th className="py-2 px-3 text-left text-xs text-[var(--muted)]">{tr("dashboard.name")}</th>
                <th className="py-2 px-3 text-left text-xs text-[var(--muted)]">Estimasi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--line)]"><td className="py-2 px-3">{tr("dashboard.capex")}</td><td>Rp 300–500 juta</td></tr>
              <tr className="border-b border-[var(--line)]"><td className="py-2 px-3">{tr("dashboard.opex")}</td><td>Rp 45–80 juta/bln</td></tr>
              <tr className="border-b border-[var(--line)]"><td className="py-2 px-3">{tr("dashboard.revenuePotential")}</td><td>Rp 60–120 juta/bln</td></tr>
              <tr><td className="py-2 px-3">{tr("dashboard.payback")}</td><td>18–30 bulan</td></tr>
            </tbody>
          </table>
          <div>
            <p className="text-sm text-[var(--muted)]">
              {lang === "id"
                ? "Data di atas merupakan estimasi awal. Data aktual akan diupdate setelah audit keuangan internal dilakukan."
                : "Data above are initial estimates. Actual data will be updated after internal financial audit."}
            </p>
            <p className="text-xs text-[var(--warn)] font-bold mt-3">{lang === "id" ? "⚠ Data placeholder — perlu validasi" : "⚠ Placeholder data — needs validation"}</p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
