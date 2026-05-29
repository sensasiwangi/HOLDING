"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";
import {
  Building2, DollarSign, Scale, FileCheck, LogOut, Lock,
  CheckCircle, Clock, Target, BarChart3, TrendingUp, Wallet, Users, ShieldCheck, BookOpen, Package,
  AlertTriangle, ArrowRight,
} from "lucide-react";
import FinancePanel from "./finance";
import ShareholderPanel from "./shareholder";
import DivisiShareholderPanel from "./divisi-shareholder";
import SukukPanel from "./sukuk";
import SukukPanduanPanel from "./sukuk-panduan";
import SukukProdukPanel from "./sukuk-produk";

type Tab = "overview" | "keuangan" | "pemegang-saham" | "divisi-saham" | "sukuk" | "panduan" | "produk";

const ALLOWED_USERS = [
  { username: "beriman", password: "sensasiwangiindonesia090785" },
];

const TRACKER_DATA = [
  { id: 1, name: "Operasional holding", status: "build", pct: 45, pic: "Direksi / Holding Office" },
  { id: 2, name: "SWI Store", status: "build", pct: 55, pic: "Store Manager" },
  { id: 3, name: "Event Organizer / Fragrantions", status: "plan", pct: 38, pic: "Event Lead" },
  { id: 4, name: "Production & Brands", status: "build", pct: 48, pic: "Brand / Production Lead" },
  { id: 5, name: "WEB marketplace", status: "plan", pct: 32, pic: "Digital / WEB Lead" },
  { id: 6, name: "Digital Systems & AI", status: "build", pct: 42, pic: "Digital Lead" },
  { id: 7, name: "Monitoring keuangan", status: "risk", pct: 40, pic: "Finance" },
  { id: 8, name: "Legal perusahaan", status: "risk", pct: 35, pic: "Legal / Direksi" },
  { id: 9, name: "HKI / merek", status: "risk", pct: 25, pic: "Legal / Brand" },
  { id: 10, name: "Investor readiness", status: "plan", pct: 45, pic: "Direksi / BD" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ok: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Siap" },
  build: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Sedang jalan" },
  plan: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Perlu rencana" },
  risk: { bg: "bg-red-500/10", text: "text-red-400", label: "Perlu perhatian" },
};

export default function DashboardPage() {
  const { lang } = useLang();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [financeData, setFinanceData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/finance").then(r => r.json()).then(setFinanceData).catch(() => {});
  }, []);

  function tr(key: string): string {
    const keys = key.split(".");
    let val: any = dict;
    for (const k of keys) { val = val?.[k]; if (!val) return key; }
    if (typeof val === "object" && val[lang]) return val[lang];
    return val;
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const match = ALLOWED_USERS.find(u => u.username === username && u.password === password);
    if (match) { setLoggedIn(true); setError(""); }
    else setError(tr("dashboard.invalidCredentials"));
  }

  // ── Login Screen ──
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#0f7b63]/10 blur-[120px] animate-float1" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#c9a84c]/5 blur-[100px] animate-float2" />
        </div>

        <div className="relative w-full max-w-md animate-fade-up">
          <div className="glass rounded-3xl p-10 glow-brand">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#12a77f] to-[#0f7b63] flex items-center justify-center mx-auto mb-5">
                <Lock size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">{tr("dashboard.loginTitle")}</h1>
              <p className="text-sm text-[#5d7068] mt-2">{tr("dashboard.loginSubtitle")}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#7a9e8f] mb-2 uppercase tracking-wider">{tr("dashboard.username")}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#3d5048] focus:outline-none focus:border-[#12a77f] transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7a9e8f] mb-2 uppercase tracking-wider">{tr("dashboard.password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#3d5048] focus:outline-none focus:border-[#12a77f] transition-colors" required />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#0f7b63]/20 transition-all hover:-translate-y-0.5">
                {tr("dashboard.loginBtn")} <ArrowRight size={16} className="inline ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  const tabs = [
    { key: "overview" as Tab, label: tr("dashboard.overview"), icon: <Building2 size={15} /> },
    { key: "keuangan" as Tab, label: tr("dashboard.finance"), icon: <Wallet size={15} /> },
    { key: "pemegang-saham" as Tab, label: "Pemegang Saham", icon: <Users size={15} /> },
    { key: "divisi-saham" as Tab, label: "Divisi", icon: <Building2 size={15} /> },
    { key: "sukuk" as Tab, label: "Sukuk", icon: <ShieldCheck size={15} /> },
    { key: "panduan" as Tab, label: "Panduan", icon: <BookOpen size={15} /> },
    { key: "produk" as Tab, label: "Produk", icon: <Package size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Top bar */}
      <div className="sticky top-16 z-30 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">{tr("dashboard.title")}</h1>
            <p className="text-xs text-[#5d7068] mt-0.5">{lang === "id" ? "Dashboard internal manajemen holding" : "Internal holding management dashboard"}</p>
          </div>
          <button onClick={() => setLoggedIn(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-xs hover:bg-white/10 transition-all text-[#7a9e8f] hover:text-red-400">
            <LogOut size={14} /> {tr("dashboard.logout")}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-2xl p-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-[#0f7b63] to-[#12a77f] text-white shadow-lg shadow-[#0f7b63]/10"
                  : "text-[#5d7068] hover:text-white hover:bg-white/5"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "keuangan" ? <FinancePanel /> :
         activeTab === "pemegang-saham" ? <ShareholderPanel /> :
         activeTab === "divisi-saham" ? <DivisiShareholderPanel data={financeData?.divisiSaham} /> :
         activeTab === "sukuk" ? <SukukPanel info={financeData?.sukukInfo} investor={financeData?.sukukInvestor} proyeksi={financeData?.sukukProyeksi} /> :
         activeTab === "panduan" ? <SukukPanduanPanel /> :
         activeTab === "produk" ? <SukukProdukPanel produk={financeData?.sukukProduk} proyeksi={financeData?.sukukProdukProj} /> :
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
            {[
              { icon: <Building2 size={20} />, label: tr("dashboard.totalDivisions"), value: "6+", color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-500/5" },
              { icon: <TrendingUp size={20} />, label: tr("dashboard.investorReadiness"), value: "45%", color: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5" },
              { icon: <Scale size={20} />, label: tr("dashboard.legalStatus"), value: "35%", color: "text-red-400", bg: "from-red-500/10 to-red-500/5" },
              { icon: <BarChart3 size={20} />, label: tr("dashboard.financeModel"), value: "40%", color: "text-blue-400", bg: "from-blue-500/10 to-blue-500/5" },
            ].map((c, i) => (
              <div key={i} className={`card-luxury p-5 bg-gradient-to-br ${c.bg} animate-fade-up`}>
                <div className={`${c.color} mb-3`}>{c.icon}</div>
                <div className="text-xs text-[#5d7068] mb-1">{c.label}</div>
                <div className={`text-3xl font-black ${c.color}`}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-[1fr_0.6fr] gap-6 mb-8">
            {/* Tracker Table */}
            <div className="card-luxury p-5 animate-fade-up">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Target size={16} className="text-emerald-400" /> {tr("dashboard.tracker")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 px-3 text-left text-[#5d7068] font-medium text-xs">{tr("tracker.workstream")}</th>
                      <th className="py-2 px-3 text-left text-[#5d7068] font-medium text-xs">{tr("tracker.status")}</th>
                      <th className="py-2 px-3 text-left text-[#5d7068] font-medium text-xs">{tr("tracker.progress")}</th>
                      <th className="py-2 px-3 text-left text-[#5d7068] font-medium text-xs">{tr("tracker.pic")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRACKER_DATA.map((row) => {
                      const s = STATUS_STYLES[row.status] || STATUS_STYLES.plan;
                      return (
                        <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-white text-xs">{row.name}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 bg-white/5 rounded-full flex-1 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#0f7b63] to-[#12a77f] rounded-full transition-all" style={{ width: `${row.pct}%` }} />
                              </div>
                              <span className="text-xs text-[#5d7068] font-bold w-8 text-right">{row.pct}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-[#5d7068]">{row.pic}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Priorities + Readiness */}
            <div className="space-y-5">
              <div className="card-luxury p-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <h3 className="font-bold text-sm text-white">{tr("dashboard.priorities")}</h3>
                </div>
                <ol className="space-y-3">
                  {(lang === "id"
                    ? ["Lengkapi PIC dan deadline setiap divisi", "Satukan file legal PT, NIB, rekening, pajak", "Buat daftar status merek/HKI untuk semua brand", "Isi angka keuangan aktual: kas, omzet, biaya", "Pilih materi publik yang aman di frontpage"]
                    : ["Complete PIC & deadline per division", "Consolidate legal docs: PT, NIB, bank, taxes", "List brand/IP registration status", "Fill actual financial figures", "Select safe public materials"]
                  ).map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-[#7a9e8f]">
                      <span className="text-emerald-400 font-bold flex-shrink-0">{i + 1}.</span> {p}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card-luxury p-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-bold text-sm text-white mb-4">{tr("dashboard.investorReadiness")}</h3>
                {[
                  { label: tr("dashboard.investorReadiness"), pct: 45 },
                  { label: tr("dashboard.legalStatus"), pct: 35 },
                  { label: tr("dashboard.financeModel"), pct: 40 },
                ].map((m, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#7a9e8f]">{m.label}</span>
                      <span className="font-bold text-emerald-400">{m.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#0f7b63] to-[#12a77f] rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="card-luxury p-5 mb-8 animate-fade-up">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" /> {tr("dashboard.revenue")}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { name: "SWI Store", desc: "Retail, kelas, workshop, custom perfume, repeat order", emoji: "🏪" },
                { name: "Fragrantions", desc: "Sponsor, tenant, ticketing, merchandise", emoji: "🎭" },
                { name: "Production & Brands", desc: "SKU, COGS, margin, distributor, B2B white label", emoji: "🧪" },
                { name: "Marketplace", desc: "GMV, conversion, AOV, fulfillment SLA", emoji: "🌐" },
                { name: "Digital / AI", desc: "Database scent profile, retention, recommendation engine", emoji: "🤖" },
              ].map((r, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 hover:bg-white/8 transition-colors">
                  <div className="text-xl mb-2">{r.emoji}</div>
                  <h4 className="font-bold text-white text-sm mb-1">{r.name}</h4>
                  <p className="text-xs text-[#5d7068]">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Finance */}
          <div className="card-luxury p-5 animate-fade-up">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-400" /> {tr("dashboard.finance")}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 px-3 text-left text-xs text-[#5d7068]">{tr("dashboard.name")}</th>
                    <th className="py-2 px-3 text-left text-xs text-[#5d7068]">Estimasi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: tr("dashboard.capex"), v: "Rp 300–500 juta" },
                    { l: tr("dashboard.opex"), v: "Rp 45–80 juta/bln" },
                    { l: tr("dashboard.revenuePotential"), v: "Rp 60–120 juta/bln" },
                    { l: tr("dashboard.payback"), v: "18–30 bulan" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-[#7a9e8f]">{r.l}</td>
                      <td className="py-2.5 px-3 text-white font-semibold">{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-[#7a9e8f] leading-relaxed">
                  {lang === "id"
                    ? "Data di atas merupakan estimasi awal. Data aktual akan diupdate setelah audit keuangan internal dilakukan."
                    : "Data above are initial estimates. Actual data will be updated after internal financial audit."}
                </p>
                <p className="text-xs text-amber-400 font-bold mt-3 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> {lang === "id" ? "⚠ Data placeholder — perlu validasi" : "⚠ Placeholder data — needs validation"}
                </p>
              </div>
            </div>
          </div>
        </>
        }
      </div>
    </div>
  );
}
