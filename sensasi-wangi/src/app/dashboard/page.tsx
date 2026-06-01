"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical, ShieldCheck, DollarSign, Package, Users, Truck, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Droplets,
  BarChart3, PieChart, Sparkles, ChevronRight, X, RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────

interface OverviewData {
  formulas: number;
  customers: number;
  revenue: number;
  profit_margin: number;
  qc_pass_rate: number;
  low_stock_count: number;
}

interface InventoryAlert {
  id: number;
  name: string;
  stock_ml: number;
  min_stock_ml: number;
  alert_level: "low" | "critical" | "empty";
}

interface FormulaItem {
  id: number;
  formula_code: string;
  ai_mood: string;
  total_cost: number;
  selling_price: number;
  status: string;
  created_at: string;
}

interface CustomerItem {
  id: number;
  name: string;
  segment: string;
  clv: number;
  total_spent: number;
  visit_count: number;
}

// ── Tab Config ─────────────────────────────────────────────────

type Tab = "overview" | "produksi" | "qc" | "keuangan" | "inventory" | "customer" | "supplier" | "sop";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <PieChart size={15} /> },
  { key: "produksi", label: "Produksi", icon: <FlaskConical size={15} /> },
  { key: "qc", label: "QC & Compliance", icon: <ShieldCheck size={15} /> },
  { key: "keuangan", label: "Keuangan", icon: <DollarSign size={15} /> },
  { key: "inventory", label: "Inventory", icon: <Package size={15} /> },
  { key: "customer", label: "Customer", icon: <Users size={15} /> },
  { key: "supplier", label: "Supplier", icon: <Truck size={15} /> },
  { key: "sop", label: "SOP", icon: <BookOpen size={15} /> },
];

// ── API Fetch Helper ───────────────────────────────────────────

async function fetchApi(path: string, params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`/api/${path}${qs}`);
  return res.json();
}

// ── KPI Card ────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, trend }: any) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${color} border border-white/[0.06] hover:border-white/[0.12] transition-all hover:-translate-y-0.5 group`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-teal-400">{icon}</div>
        {trend && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend > 0 ? "text-emerald-400 bg-emerald-500/15" : "text-red-400 bg-red-500/15"}`}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>}
      </div>
      <div className="text-[11px] text-[#5a8a78] font-medium mb-1">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[10px] text-[#4a6a5a] mt-1">{sub}</div>}
    </div>
  );
}

// ── Section Panel ──────────────────────────────────────────────

function Panel({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">{icon} {title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    passed: "bg-emerald-500/15 text-emerald-400",
    ok: "bg-emerald-500/15 text-emerald-400",
    low: "bg-orange-500/15 text-orange-400",
    critical: "bg-red-500/15 text-red-400",
    empty: "bg-red-500/15 text-red-400",
    completed: "bg-emerald-500/15 text-emerald-400",
    confirmed: "bg-blue-500/15 text-blue-400",
    pending: "bg-orange-500/15 text-orange-400",
    mixed: "bg-purple-500/15 text-purple-400",
    draft: "bg-zinc-500/15 text-zinc-400",
    new: "bg-blue-500/15 text-blue-400",
    regular: "bg-teal-500/15 text-teal-400",
    loyal: "bg-purple-500/15 text-purple-400",
    vip: "bg-amber-500/15 text-amber-400",
    fail: "bg-red-500/15 text-red-400",
    warn: "bg-yellow-500/15 text-yellow-400",
    pass: "bg-emerald-500/15 text-emerald-400",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || "bg-zinc-500/15 text-zinc-400"}`}>{status}</span>;
}

// ── Loading Spinner ────────────────────────────────────────────

function Spinner() {
  return <div className="flex items-center justify-center py-12"><RefreshCw size={20} className="animate-spin text-teal-400" /></div>;
}

// ── Empty State ────────────────────────────────────────────────

function EmptyState({ msg }: { msg: string }) {
  return <div className="text-center py-8 text-[12px] text-[#4a6a5a]">{msg}</div>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export default function PerfumeDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [, setTick] = useState(0);
  const refresh = async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 500)); setRefreshing(false); setTick(t => t + 1); };

  // ── Overview Data ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [recentFormulas, setRecentFormulas] = useState<FormulaItem[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerItem[]>([]);
  const [inventoryAll, setInventoryAll] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [qcReport, setQcReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      try {
        const [f, c, h, inv, cus, sup, sop, qc] = await Promise.all([
          fetchApi("formulas"),
          fetchApi("customers?action=stats"),
          fetchApi("finance"),
          fetchApi("inventory?action=alerts"),
          fetchApi("customers?action=top"),
          fetchApi("suppliers"),
          fetchApi("sop"),
          fetchApi("qc?action=stats"),
        ]);
        if (cancelled) return;
        const invoice = f.success ? (Array.isArray(f.formulas) ? f.formulas : f.data || []) : [];
        const salesRev = h.success && h.revenue ? h.total_revenue : 0;
        const margin = h.success && h.revenue ? h.avg_margin_pct : 0;
        setOverview({
          formulas: Array.isArray(invoice) ? invoice.length : 0,
          customers: c.success ? (c.segments?.total || 0) : 0,
          revenue: salesRev,
          profit_margin: margin,
          qc_pass_rate: qc.success ? qc.stats?.pass_rate_pct || 0 : 0,
          low_stock_count: inv.success ? (Array.isArray(inv.alerts) ? inv.alerts.length : 0) : 0,
        });
        setAlerts(inv.success ? (inv.alerts || []) : []);
        setRecentFormulas(Array.isArray(invoice) ? invoice.slice(0, 5) : []);
        setTopCustomers(cus.success ? (cus.customers || []) : []);
        setInventoryAll(inv.success ? (inv.raw_materials || []) : []);
        setSuppliers(sup.success ? (sup.suppliers || []) : []);
        setSops(sop.success ? (sop.sops || []) : []);
        setQcReport(qc.success ? qc.stats : null);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    const interval = setInterval(loadAll, 30000); // refresh every 30s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#080c0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <FlaskConical size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Sensasi Wangi Indonesia</h1>
              <p className="text-[10px] text-[#4a7a6a] uppercase tracking-widest font-semibold">Perfume Production Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Live</span>
            </div>
            <button onClick={refresh} className="p-2 rounded-xl hover:bg-white/5 transition-all text-[#6b9e8f] hover:text-white" title="Refresh">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-2xl p-1.5 overflow-x-auto border border-white/5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 py-2 px-3 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === t.key ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg" : "text-[#4a7a6a] hover:text-white hover:bg-white/5"}`}>
              {t.icon}<span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* ════════ TAB: OVERVIEW ════════ */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={<FlaskConical size={18} />} label="Total Formula" value={overview?.formulas || 0} sub="Formula terdaftar" color="from-teal-500/10 via-teal-500/5 to-transparent" />
                  <KpiCard icon={<Users size={18} />} label="Customer" value={overview?.customers || 0} sub="Terdaftar di CRM" color="from-blue-500/10 via-blue-500/5 to-transparent" />
                  <KpiCard icon={<DollarSign size={18} />} label="Pendapatan" value={`Rp ${(overview?.revenue || 0).toLocaleString("id-ID")}`} sub={`Margin avg: ${overview?.profit_margin || 0}%`} color="from-emerald-500/10 via-emerald-500/5 to-transparent" />
                  <KpiCard icon={<AlertTriangle size={18} />} label="Stok Menipis" value={overview?.low_stock_count || 0} sub="Perlu reorder" color="from-orange-500/10 via-orange-500/5 to-transparent" trend={overview?.low_stock_count ? -1 : 0} />
                </div>

                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
                  {/* Recent Formulas */}
                  <Panel title="Formula Terbaru" icon={<Sparkles size={14} className="text-teal-400" />}>
                    {recentFormulas.length === 0 ? <EmptyState msg="Belum ada formula. Buat formula pertama di halaman Formula." /> : (
                      <div className="space-y-2">
                        {recentFormulas.map(f => (
                          <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center"><Droplets size={14} className="text-teal-400" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white truncate">{f.formula_code} — {f.ai_mood}</div>
                              <div className="text-[10px] text-[#4a6a5a]">Cost: Rp {f.total_cost.toLocaleString("id-ID")} | Jual: Rp {f.selling_price.toLocaleString("id-ID")}</div>
                            </div>
                            <Badge status={f.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>

                  {/* QC Summary */}
                  <Panel title="QC & Compliance" icon={<ShieldCheck size={14} className="text-emerald-400" />}>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-4xl font-black ${qcReport && qcReport.pass_rate_pct >= 80 ? "text-emerald-400" : qcReport && qcReport.pass_rate_pct >= 50 ? "text-orange-400" : "text-red-400"}`}>
                          {qcReport?.pass_rate_pct || 0}%
                        </div>
                        <div className="text-[10px] text-[#4a6a5a] mt-1">Pass Rate ({qcReport?.total_batches || 0} batch)</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-emerald-500/10"><div className="text-sm font-bold text-emerald-400">{qcReport?.passed || 0}</div><div className="text-[9px] text-[#4a6a5a]">Passed</div></div>
                        <div className="p-2 rounded-lg bg-orange-500/10"><div className="text-sm font-bold text-orange-400">{qcReport?.pending || 0}</div><div className="text-[9px] text-[#4a6a5a]">Pending</div></div>
                        <div className="p-2 rounded-lg bg-red-500/10"><div className="text-sm font-bold text-red-400">{qcReport?.failed || 0}</div><div className="text-[9px] text-[#4a6a5a]">Failed</div></div>
                      </div>
                    </div>
                  </Panel>
                </div>

                {/* Top Customers */}
                <Panel title="Top Customer (CLV)" icon={<TrendingUp size={14} className="text-blue-400" />}>
                  {topCustomers.length === 0 ? <EmptyState msg="Belum ada data customer." /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-white/10 text-[#5a8a78]">
                          <th className="py-2 px-3 text-left font-semibold">Nama</th>
                          <th className="py-2 px-3 text-left font-semibold">Segment</th>
                          <th className="py-2 px-3 text-right font-semibold">Visits</th>
                          <th className="py-2 px-3 text-right font-semibold">Total Spent</th>
                          <th className="py-2 px-3 text-right font-semibold">CLV</th>
                        </tr></thead>
                        <tbody>
                          {topCustomers.slice(0, 5).map(c => (
                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                              <td className="py-2.5 px-3 text-white font-medium">{c.name || "-"}</td>
                              <td className="py-2.5 px-3"><Badge status={c.segment} /></td>
                              <td className="py-2.5 px-3 text-right text-[#6b9e8f]">{c.visit_count}</td>
                              <td className="py-2.5 px-3 text-right text-[#6b9e8f]">Rp {c.total_spent?.toLocaleString("id-ID")}</td>
                              <td className="py-2.5 px-3 text-right text-teal-400 font-bold">Rp {c.clv?.toLocaleString("id-ID")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>

                {/* Inventory Alerts */}
                <Panel title="Stok Menipis" icon={<AlertTriangle size={14} className="text-orange-400" />}>
                  {alerts.length === 0 ? <div className="text-center py-6 text-xs text-emerald-400 flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Semua stock aman!</div> : (
                    <div className="space-y-2">
                      {alerts.slice(0, 8).map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05]">
                          <div className={`w-2 h-2 rounded-full ${a.alert_level === "critical" ? "bg-red-400" : a.alert_level === "empty" ? "bg-red-500" : "bg-orange-400"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-white truncate">{a.name}</div>
                            <div className="text-[9px] text-[#4a6a5a]">{a.stock_ml.toFixed(1)}ml / min {a.min_stock_ml}ml</div>
                          </div>
                          <Badge status={a.alert_level} />
                        </div>
                      ))}
                      {alerts.length > 8 && <div className="text-center text-[10px] text-[#4a6a5a] pt-2">+{alerts.length - 8} item lainnya</div>}
                    </div>
                  )}
                </Panel>
              </div>
            )}

            {/* ════════ TAB: PRODUKSI ════════ */}
            {activeTab === "produksi" && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-5">
                  <Panel title="Semua Formula" icon={<FlaskConical size={14} className="text-teal-400" />}>
                    {recentFormulas.length === 0 ? <EmptyState msg="Belum ada formula" /> : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {recentFormulas.map(f => (
                          <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 flex items-center justify-center"><FlaskConical size={16} className="text-teal-400" /></div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-white">{f.formula_code}</div>
                              <div className="text-[10px] text-[#4a6a5a]">{f.ai_mood} • {f.created_at?.slice(0, 10)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-[#4a6a5a]">Cost</div>
                              <div className="text-xs font-bold text-white">Rp {f.total_cost?.toLocaleString("id-ID")}</div>
                            </div>
                            <Badge status={f.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>

                  <Panel title="Panduan Produksi" icon={<BookOpen size={14} className="text-blue-400" />}>
                    <div className="space-y-3 text-xs text-[#6b9e8f] leading-relaxed">
                      <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                        <div className="font-bold text-teal-400 mb-1">1. Mixing</div>
                        <div>Top notes → Middle notes → Base notes → Ethanol 96%. Aduk perlahan di beaker.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <div className="font-bold text-purple-400 mb-1">2. Bottling</div>
                        <div>Transfer ke botol 30ml dengan corong. Pasang spray cap rapat.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <div className="font-bold text-orange-400 mb-1">3. Packaging</div>
                        <div>Bungkus botol dengan tisu → masukkan ke pouch → kotak → stiker seal.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="font-bold text-emerald-400 mb-1">4. Masterasi</div>
                        <div>Simpan di tempat gelap 14 hari. Aduk pelan setiap 2-3 hari.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="font-bold text-red-400 mb-1">5. QC & Compliance</div>
                        <div>Cek visual, spray test, IFRA compliance, allergen label sebelum shipping.</div>
                      </div>
                    </div>
                  </Panel>
                </div>

                {/* Revenue Breakdown */}
                <Panel title="Ringkasan Keuangan Produksi" icon={<BarChart3 size={14} className="text-emerald-400" />}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-black text-emerald-400">Rp {overview?.revenue?.toLocaleString("id-ID") || 0}</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Total Pendapatan</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-black text-teal-400">{overview?.profit_margin || 0}%</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Margin Rata-rata</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-black text-blue-400">{overview?.formulas || 0}</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Total Formula</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-black text-purple-400">{overview?.customers || 0}</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Customer Aktif</div>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* ════════ TAB: QC & COMPLIANCE ════════ */}
            {activeTab === "qc" && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-5">
                  <Panel title="QC Pass Rate" icon={<ShieldCheck size={14} className="text-emerald-400" />}>
                    <div className="text-center py-6">
                      <div className={`text-5xl font-black ${qcReport && qcReport.pass_rate_pct >= 80 ? "text-emerald-400" : "text-orange-400"}`}>{qcReport?.pass_rate_pct || 0}%</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-2">dari {qcReport?.total_batches || 0} batch</div>
                    </div>
                  </Panel>
                  <Panel title="Status BPOM" icon={<CheckCircle2 size={14} className="text-blue-400" />}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.03]"><span className="text-[11px] text-[#6b9e8f]">Draft</span><span className="text-xs font-bold text-zinc-400">—</span></div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.03]"><span className="text-[11px] text-[#6b9e8f]">Submitted</span><span className="text-xs font-bold text-blue-400">—</span></div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/[0.03]"><span className="text-[11px] text-[#6b9e8f]">Approved</span><span className="text-xs font-bold text-emerald-400">—</span></div>
                      <div className="text-[9px] text-[#4a6a5a] text-center pt-2">Data dari API BPOM</div>
                    </div>
                  </Panel>
                  <Panel title="IFRA Compliance" icon={<Droplets size={14} className="text-purple-400" />}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10"><span className="text-[11px] text-emerald-400">Pass</span><span className="text-xs font-bold text-emerald-400">Auto-check</span></div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-500/10"><span className="text-[11px] text-yellow-400">Warning</span><span className="text-xs font-bold text-yellow-400">Perlu cek</span></div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-red-500/10"><span className="text-[11px] text-red-400">Failed</span><span className="text-xs font-bold text-red-400">Melebihi batas</span></div>
                      <div className="text-[9px] text-[#4a6a5a] text-center pt-2">14 kategori IFRA | 36 check items</div>
                    </div>
                  </Panel>
                </div>

                <Panel title="Allergen & Labeling" icon={<AlertTriangle size={14} className="text-orange-400" />}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-xs font-bold text-white mb-2">26 EU Allergens</div>
                      <div className="text-[10px] text-[#6b9e8f] leading-relaxed">Setiap formula otomatis di-check terhadap daftar alergen EU. Label safety otomatis dibuat per formula dengan threshold 0.01% untuk produk leave-on.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-xs font-bold text-white mb-2">Batch Traceability</div>
                      <div className="text-[10px] text-[#6b9e8f] leading-relaxed">Setiap produk jadi terhubung ke batch bahan baku. Full traceability dari lot number bahan sampai botol jadi.</div>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* ════════ TAB: KEUANGAN ════════ */}
            {activeTab === "keuangan" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={<DollarSign size={18} />} label="Pendapatan" value={`Rp ${(overview?.revenue || 0).toLocaleString("id-ID")}`} sub="Total penjualan" color="from-emerald-500/10 via-emerald-500/5 to-transparent" />
                  <KpiCard icon={<TrendingUp size={18} />} label="Margin" value={`${overview?.profit_margin || 0}%`} sub="Rata-rata" color="from-teal-500/10 via-teal-500/5 to-transparent" />
                  <KpiCard icon={<FlaskConical size={18} />} label="Formula" value={overview?.formulas || 0} sub="Aktif" color="from-blue-500/10 via-blue-500/5 to-transparent" />
                  <KpiCard icon={<Users size={18} />} label="Customer" value={overview?.customers || 0} sub="Terdaftar" color="from-purple-500/10 via-purple-500/5 to-transparent" />
                </div>
                <Panel title="Rekonsiliasi Keuangan" icon={<BarChart3 size={14} className="text-teal-400" />}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="text-lg font-black text-emerald-400">Rp {(overview?.revenue || 0).toLocaleString("id-ID")}</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Total Pendapatan Formula</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="text-lg font-black text-orange-400">{overview?.profit_margin || 0}%</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Gross Margin</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                      <div className="text-lg font-black text-blue-400">Rp {Math.round((overview?.revenue || 0) / 30 || 0).toLocaleString("id-ID")}</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Rata-rata/hari (est)</div>
                    </div>
                  </div>
                </Panel>
                <Panel title="HPP & Biaya Packaging" icon={<Package size={14} className="text-orange-400" />}>
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] text-[#4a6a5a] font-semibold uppercase tracking-wider mb-2">Komponen Biaya per Botol</div>
                      <div className="space-y-1.5">
                        {[
                          { label: "Bahan Baku (Raw Material)", pct: 35 },
                          { label: "Botol 30ml", pct: 12 },
                          { label: "Spray Cap", pct: 8 },
                          { label: "Stiker Label", pct: 5 },
                          { label: "Kotak Packaging", pct: 8 },
                          { label: "Tisu + Pouch", pct: 5 },
                          { label: "Labor Produksi", pct: 15 },
                          { label: "Overhead", pct: 12 },
                        ].map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] text-[#6b9e8f] w-40">{c.label}</span>
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" style={{ width: `${c.pct}%` }} /></div>
                            <span className="text-[10px] text-[#4a6a5a] w-8 text-right">{c.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/10">
                      <div className="text-[10px] text-[#4a6a5a] uppercase tracking-wider font-semibold">Estimasi HPP per Botol</div>
                      <div className="text-2xl font-black text-teal-400 mt-2">Rp 15.000 — 35.000</div>
                      <div className="text-[10px] text-[#4a6a5a] mt-1">Tergantung formula & packaging</div>
                      <div className="text-lg font-bold text-white mt-3">Selling Price: Rp 35.000 — 85.000</div>
                      <div className="text-[10px] text-emerald-400">Margin: 50-65%</div>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* ════════ TAB: INVENTORY ════════ */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={<Package size={18} />} label="Total Item" value={inventoryAll.length} sub="Bahan baku + packaging" color="from-blue-500/10 via-blue-500/5 to-transparent" />
                  <KpiCard icon={<AlertTriangle size={18} />} label="Stok Rendah" value={overview?.low_stock_count || 0} sub="Perlu reorder" color="from-orange-500/10 via-orange-500/5 to-transparent" />
                  <KpiCard icon={<CheckCircle2 size={18} />} label="Stok Aman" value={(inventoryAll.length || 0) - (overview?.low_stock_count || 0)} sub="Above minimum" color="from-emerald-500/10 via-emerald-500/5 to-transparent" />
                  <KpiCard icon={<Clock size={18} />} label="Overdue PO" value="—" sub="Dari supplier" color="from-red-500/10 via-red-500/5 to-transparent" />
                </div>

                <Panel title="Raw Material Stock" icon={<Droplets size={14} className="text-teal-400" />}>
                  {inventoryAll.length === 0 ? <EmptyState msg="Belum ada data inventory" /> : (
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-white/10 text-[#5a8a78] sticky top-0 bg-[#080c0a]">
                          <th className="py-2 px-3 text-left font-semibold">Nama</th>
                          <th className="py-2 px-3 text-right font-semibold">Stok (ml)</th>
                          <th className="py-2 px-3 text-right font-semibold">Min (ml)</th>
                          <th className="py-2 px-3 text-center font-semibold">Status</th>
                          <th className="py-2 px-3 text-left font-semibold">Reorder</th>
                        </tr></thead>
                        <tbody>
                          {inventoryAll.slice(0, 20).map(i => (
                            <tr key={i.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                              <td className="py-2 px-3 text-white font-medium">{i.name}</td>
                              <td className="py-2 px-3 text-right text-[#6b9e8f]">{i.stock_ml?.toFixed(1)}</td>
                              <td className="py-2 px-3 text-right text-[#6b9e8f]">{i.min_stock_ml}</td>
                              <td className="py-2 px-3 text-center"><Badge status={i.alert_level} /></td>
                              <td className="py-2 px-3 text-[10px] text-[#4a6a5a]">{i.suggested_order_ml ? `${i.suggested_order_ml}ml (est Rp ${i.estimated_cost?.toLocaleString("id-ID")})` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
              </div>
            )}

            {/* ════════ TAB: CUSTOMER ════════ */}
            {activeTab === "customer" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard icon={<Users size={18} />} label="Total Customer" value={overview?.customers || 0} sub="Terdaftar" color="from-blue-500/10 via-blue-500/5 to-transparent" />
                  <KpiCard icon={<TrendingUp size={18} />} label="Repeat Rate" value="—%" sub="Customer kembali" color="from-teal-500/10 via-teal-500/5 to-transparent" />
                  <KpiCard icon={<DollarSign size={18} />} label="Avg Purchase" value="Rp —" sub="Per transaksi" color="from-purple-500/10 via-purple-500/5 to-transparent" />
                  <KpiCard icon={<Sparkles size={18} />} label="VIP" value="—" sub="Customer premium" color="from-amber-500/10 via-amber-500/5 to-transparent" />
                </div>

                <Panel title="Top Customer by CLV" icon={<TrendingUp size={14} className="text-blue-400" />}>
                  {topCustomers.length === 0 ? <EmptyState msg="Belum ada data customer. Mulai dengan mendaftarkan customer di transaksi." /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-white/10 text-[#5a8a78]">
                          <th className="py-2 px-3 text-left font-semibold">Nama</th>
                          <th className="py-2 px-3 text-left font-semibold">Segment</th>
                          <th className="py-2 px-3 text-right font-semibold">Visits</th>
                          <th className="py-2 px-3 text-right font-semibold">Total Spent</th>
                          <th className="py-2 px-3 text-right font-semibold">CLV</th>
                        </tr></thead>
                        <tbody>
                          {topCustomers.map(c => (
                            <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                              <td className="py-2.5 px-3 text-white font-medium">{c.name || "-"}</td>
                              <td className="py-2.5 px-3"><Badge status={c.segment} /></td>
                              <td className="py-2.5 px-3 text-right text-[#6b9e8f]">{c.visit_count}</td>
                              <td className="py-2.5 px-3 text-right text-[#6b9e8f]">Rp {c.total_spent?.toLocaleString("id-ID")}</td>
                              <td className="py-2.5 px-3 text-right text-teal-400 font-bold">Rp {c.clv?.toLocaleString("id-ID")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
              </div>
            )}

            {/* ════════ TAB: SUPPLIER ════════ */}
            {activeTab === "supplier" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <KpiCard icon={<Truck size={18} />} label="Supplier Aktif" value={suppliers.length} sub="Terdaftar" color="from-blue-500/10 via-blue-500/5 to-transparent" />
                  <KpiCard icon={<Clock size={18} />} label="PO Pending" value="—" sub="Dalam proses" color="from-orange-500/10 via-orange-500/5 to-transparent" />
                  <KpiCard icon={<AlertTriangle size={18} />} label="Overdue" value="—" sub="Terlambat" color="from-red-500/10 via-red-500/5 to-transparent" />
                </div>
                <Panel title="Supplier List" icon={<Truck size={14} className="text-blue-400" />}>
                  {suppliers.length === 0 ? <EmptyState msg="Belum ada supplier terdaftar. Mulai dengan menambah supplier di menu Supplier." /> : (
                    <div className="space-y-2">
                      {suppliers.map((s: any) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05]">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center"><Truck size={14} className="text-blue-400" /></div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">{s.name}</div>
                            <div className="text-[10px] text-[#4a6a5a]">{s.contact_person || "—"} | {s.phone || "—"}</div>
                          </div>
                          <Badge status={s.is_active ? "ok" : ""} />
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            )}

            {/* ════════ TAB: SOP ════════ */}
            {activeTab === "sop" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <KpiCard icon={<BookOpen size={18} />} label="SOP Aktif" value={sops.length} sub="Dokumen" color="from-blue-500/10 via-blue-500/5 to-transparent" />
                  <KpiCard icon={<CheckCircle2 size={18} />} label="Assignment" value="—" sub="Aktif" color="from-emerald-500/10 via-emerald-500/5 to-transparent" />
                  <KpiCard icon={<Users size={18} />} label="Staff" value="—" sub="Terlatih" color="from-purple-500/10 via-purple-500/5 to-transparent" />
                </div>
                <Panel title="Standard Operating Procedures" icon={<BookOpen size={14} className="text-blue-400" />}>
                  {sops.length === 0 ? <EmptyState msg="SOP akan otomatis tersedia saat pertama kali dashboard diakses." /> : (
                    <div className="space-y-3">
                      {sops.map((s: any) => (
                        <div key={s.id} className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-white">{s.title}</div>
                            <Badge status={s.difficulty || "pemula"} />
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-[#4a6a5a]">
                            <span>{s.code}</span>
                            <span>👁 {s.steps?.length || 0} langkah</span>
                            <span>⏱ {s.estimated_minutes} menit</span>
                            <span>🔧 {s.required_tools?.length || 0} alat</span>
                          </div>
                          {s.safety_warnings?.length > 0 && (
                            <div className="mt-2 p-2 rounded-lg bg-orange-500/10 text-[10px] text-orange-400">
                              ⚠ {s.safety_warnings.join(" | ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
