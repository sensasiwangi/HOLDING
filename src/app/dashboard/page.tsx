"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";
import {
  Building2, DollarSign, Scale, LogOut, Lock,
  Target, BarChart3, TrendingUp, Wallet, Users, ShieldCheck, BookOpen, Package,
  AlertTriangle, ArrowRight, Sparkles, Eye, PieChart,
  CheckCircle2, Clock, CircleDashed,
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
  { id: 2, name: "SWI Store TIM", status: "build", pct: 55, pic: "Store Manager" },
  { id: 3, name: "Event / Fragrantions", status: "plan", pct: 38, pic: "Event Lead" },
  { id: 4, name: "Production & Brands", status: "build", pct: 48, pic: "Production Lead" },
  { id: 5, name: "WEB Marketplace", status: "plan", pct: 32, pic: "Digital Lead" },
  { id: 6, name: "Digital Systems & AI", status: "build", pct: 42, pic: "Digital Lead" },
  { id: 7, name: "Monitoring keuangan", status: "risk", pct: 40, pic: "Finance" },
  { id: 8, name: "Legal perusahaan", status: "risk", pct: 35, pic: "Legal / Direksi" },
  { id: 9, name: "HKI / merek", status: "risk", pct: 25, pic: "Legal / Brand" },
  { id: 10, name: "Investor readiness", status: "plan", pct: 45, pic: "Direksi / BD" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  ok: { bg: "bg-teal-500/15", text: "text-teal-400", label: "Siap", icon: CheckCircle2 },
  build: { bg: "bg-orange-500/15", text: "text-orange-400", label: "Sedang jalan", icon: Clock },
  plan: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Perlu rencana", icon: CircleDashed },
  risk: { bg: "bg-red-500/15", text: "text-red-400", label: "Perlu perhatian", icon: AlertTriangle },
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
    return typeof val === "object" ? val[lang] || key : val;
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
      <div className="min-h-screen bg-[#080c0a] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#0D9488]/8 blur-[150px] animate-float1" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#F97316]/5 blur-[120px] animate-float2" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative w-full max-w-md animate-fade-up">
          <div className="glass rounded-3xl p-10 glow-brand relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#F97316]" />

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0D9488]/20">
                <Lock size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">{tr("dashboard.loginTitle")}</h1>
              <p className="text-sm text-[#5a8a78] mt-2">{tr("dashboard.loginSubtitle")}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#6b9e8f] mb-2 uppercase tracking-wider">{tr("dashboard.username")}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#3d5048] focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6]/30 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b9e8f] mb-2 uppercase tracking-wider">{tr("dashboard.password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#3d5048] focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6]/30 transition-all" required />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-4 py-3">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
              <button type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white font-bold text-sm hover:shadow-xl hover:shadow-[#0D9488]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
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
    { key: "overview" as Tab, label: tr("dashboard.overview"), icon: <Eye size={15} /> },
    { key: "keuangan" as Tab, label: tr("dashboard.finance"), icon: <Wallet size={15} /> },
    { key: "pemegang-saham" as Tab, label: "Pemegang Saham", icon: <Users size={15} /> },
    { key: "divisi-saham" as Tab, label: "Divisi", icon: <PieChart size={15} /> },
    { key: "sukuk" as Tab, label: "Sukuk", icon: <ShieldCheck size={15} /> },
    { key: "panduan" as Tab, label: "Panduan", icon: <BookOpen size={15} /> },
    { key: "produk" as Tab, label: "Produk", icon: <Package size={15} /> },
  ];

  // Calculate overall progress
  const overallProgress = Math.round(TRACKER_DATA.reduce((a, b) => a + b.pct, 0) / TRACKER_DATA.length);
  const riskCount = TRACKER_DATA.filter(r => r.status === "risk").length;
  const buildCount = TRACKER_DATA.filter(r => r.status === "build").length;

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* ── Top Header Bar ── */}
      <div className="sticky top-16 z-30 border-b border-white/5 backdrop-blur-xl bg-[#080c0a]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#0D9488]/20">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">{tr("dashboard.title")}</h1>
              <p className="text-[10px] text-[#4a7a6a] uppercase tracking-widest font-semibold">Holding Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live status indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Live</span>
            </div>
            <button onClick={() => setLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-xs hover:bg-red-500/10 transition-all text-[#6b9e8f] hover:text-red-400 border border-transparent hover:border-red-500/20">
              <LogOut size={14} /> {tr("dashboard.logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-2xl p-1.5 overflow-x-auto border border-white/5">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white shadow-lg shadow-[#0D9488]/10"
                  : "text-[#4a7a6a] hover:text-white hover:bg-white/5"
              }`}>
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "keuangan" ? <FinancePanel /> :
         activeTab === "pemegang-saham" ? <ShareholderPanel /> :
         activeTab === "divisi-saham" ? <DivisiShareholderPanel data={financeData?.divisiSaham} /> :
         activeTab === "sukuk" ? <SukukPanel info={financeData?.sukukInfo} investor={financeData?.sukukInvestor} proyeksi={financeData?.sukukProyeksi} /> :
         activeTab === "panduan" ? <SukukPanduanPanel /> :
         activeTab === "produk" ? <SukukProdukPanel produk={financeData?.sukukProduk} proyeksi={financeData?.sukukProdukProj} /> :

        <>
          {/* ── Hero Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            {[
              { icon: <Sparkles size={20} />, label: "Overall Progress", value: `${overallProgress}%`, sub: "Rata-rata semua divisi", color: "text-teal-400", bg: "from-teal-500/15 via-teal-500/5 to-transparent", border: "border-teal-500/20" },
              { icon: <TrendingUp size={20} />, label: "Investor Readiness", value: "45%", sub: "Data room + legal", color: "text-orange-400", bg: "from-orange-500/15 via-orange-500/5 to-transparent", border: "border-orange-500/20" },
              { icon: <AlertTriangle size={20} />, label: "Perhatian Khusus", value: `${riskCount} item`, sub: "Butuh tindakan segera", color: "text-red-400", bg: "from-red-500/15 via-red-500/5 to-transparent", border: "border-red-500/20" },
              { icon: <Clock size={20} />, label: "Sedang Berjalan", value: `${buildCount} item`, sub: "Progress aktif", color: "text-blue-400", bg: "from-blue-500/15 via-blue-500/5 to-transparent", border: "border-blue-500/20" },
            ].map((c, i) => (
              <div key={i} className={`card-luxury p-5 bg-gradient-to-br ${c.bg} border ${c.border} animate-fade-up relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/3 blur-[30px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className={`${c.color} mb-3`}>{c.icon}</div>
                <div className="text-xs text-[#5a8a78] mb-1 font-medium">{c.label}</div>
                <div className={`text-3xl font-black ${c.color}`}>{c.value}</div>
                <div className="text-[10px] text-[#4a6a5a] mt-1">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Main Content Grid ── */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-8">
            {/* Left: Tracker Table */}
            <div className="card-luxury p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Target size={16} className="text-teal-400" /> {tr("dashboard.tracker")}
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-[#4a6a5a] font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" />Siap</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Jalan</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Rencana</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Risiko</span>
                </div>
              </div>

              <div className="space-y-1">
                {TRACKER_DATA.map((row) => {
                  const s = STATUS_CONFIG[row.status] || STATUS_CONFIG.plan;
                  const StatusIcon = s.icon;
                  return (
                    <div key={row.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon size={14} className={s.text} />
                      </div>

                      {/* Name + PIC */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{row.name}</div>
                        <div className="text-[10px] text-[#4a6a5a]">{row.pic}</div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-24 md:w-32 flex-shrink-0">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                            row.status === "ok" ? "bg-gradient-to-r from-teal-500 to-teal-400" :
                            row.status === "build" ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                            row.status === "risk" ? "bg-gradient-to-r from-red-500 to-red-400" :
                            "bg-gradient-to-r from-blue-500 to-blue-400"
                          }`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>

                      {/* Percentage */}
                      <span className="text-xs font-bold w-10 text-right text-[#6b9e8f]">{row.pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Priorities */}
              <div className="card-luxury p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-orange-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{tr("dashboard.priorities")}</h3>
                </div>
                <ol className="space-y-3">
                  {(lang === "id"
                    ? ["Lengkapi PIC & deadline setiap divisi", "Satukan file legal PT, NIB, rekening", "Daftar status merek/HKI semua brand", "Isi angka keuangan aktual", "Pilih materi publik yang aman"]
                    : ["Complete PIC & deadline per division", "Consolidate legal docs", "List brand/IP status", "Fill actual financials", "Select safe public materials"]
                  ).map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-[#6b9e8f] group">
                      <span className="w-5 h-5 rounded-md bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-orange-400 font-bold text-[10px] group-hover:bg-orange-500/20 transition-colors">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Investor Readiness */}
              <div className="card-luxury p-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-bold text-sm text-white mb-1">{tr("dashboard.investorReadiness")}</h3>
                <p className="text-[10px] text-[#4a6a5a] mb-4">Kesiapan untuk menerima investor</p>

                {[
                  { label: tr("dashboard.investorReadiness"), pct: 45, color: "from-teal-500 to-teal-400" },
                  { label: tr("dashboard.legalStatus"), pct: 35, color: "from-red-500 to-red-400" },
                  { label: tr("dashboard.financeModel"), pct: 40, color: "from-orange-500 to-orange-400" },
                ].map((m, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-[#6b9e8f] font-medium">{m.label}</span>
                      <span className={`font-bold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>{m.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Revenue Streams ── */}
          <div className="card-luxury p-6 mb-8 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <DollarSign size={16} className="text-teal-400" /> {tr("dashboard.revenue")}
              </h3>
              <span className="text-[10px] text-[#4a6a5a] font-semibold uppercase tracking-wider">5 Revenue Stream</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: "SWI Store", desc: "Retail, kelas, workshop, custom perfume", emoji: "🏪", color: "from-teal-500/10 to-teal-500/5" },
                { name: "Fragrantions", desc: "Sponsor, tenant, ticketing, merch", emoji: "🎭", color: "from-blue-500/10 to-blue-500/5" },
                { name: "Production", desc: "SKU, COGS, distributor, B2B label", emoji: "🧪", color: "from-purple-500/10 to-purple-500/5" },
                { name: "Marketplace", desc: "GMV, conversion, AOV, fulfillment", emoji: "🌐", color: "from-cyan-500/10 to-cyan-500/5" },
                { name: "Digital / AI", desc: "Scent profile database, CRM, engine", emoji: "🤖", color: "from-orange-500/10 to-orange-500/5" },
              ].map((r, i) => (
                <div key={i} className={`bg-gradient-to-br ${r.color} rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 group`}>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{r.emoji}</div>
                  <h4 className="font-bold text-white text-sm mb-1">{r.name}</h4>
                  <p className="text-[10px] text-[#4a6a5a] leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Financial Summary ── */}
          <div className="card-luxury p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Wallet size={16} className="text-teal-400" /> {tr("dashboard.finance")}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold bg-orange-500/10 px-3 py-1.5 rounded-full">
                <AlertTriangle size={12} /> {lang === "id" ? "Data estimasi" : "Estimated data"}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/3 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/3">
                      <th className="py-3 px-5 text-left text-xs text-[#5a8a78] font-semibold uppercase tracking-wider">{tr("dashboard.name")}</th>
                      <th className="py-3 px-5 text-right text-xs text-[#5a8a78] font-semibold uppercase tracking-wider">Estimasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: tr("dashboard.capex"), value: "Rp 300–500 juta", icon: "💰" },
                      { label: tr("dashboard.opex"), value: "Rp 45–80 juta/bln", icon: "📊" },
                      { label: tr("dashboard.revenuePotential"), value: "Rp 60–120 juta/bln", icon: "📈" },
                      { label: tr("dashboard.payback"), value: "18–30 bulan", icon: "⏱️" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="text-[#6b9e8f] text-xs">{row.icon} {row.label}</span>
                        </td>
                        <td className="py-3.5 px-5 text-right text-white font-bold text-xs">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col justify-center">
                <div className="bg-gradient-to-br from-teal-500/10 to-orange-500/5 rounded-xl p-5 border border-white/5">
                  <p className="text-sm text-[#8ab8a8] leading-relaxed mb-4">
                    {lang === "id"
                      ? "Data di atas merupakan estimasi awal berdasarkan proyeksi market. Data aktual akan diupdate setelah audit keuangan internal."
                      : "Data above are initial estimates based on market projections. Actual data will be updated after internal financial audit."}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#0D9488] to-[#F97316] rounded-full w-[40%]" />
                    </div>
                    <span className="text-xs font-bold text-teal-400">40%</span>
                  </div>
                  <div className="text-[10px] text-[#4a6a5a] mt-1 text-right">Data completeness</div>
                </div>
              </div>
            </div>
          </div>
        </>
        }
      </div>
    </div>
  );
}
