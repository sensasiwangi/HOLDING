"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, ArrowDown, Building2, Wallet, PiggyBank,
  Banknote, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle,
  CheckCircle2, Info, Users, FlaskConical, Store, Globe, Calendar,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TYPES & DATA
// ═══════════════════════════════════════════════════════════════

interface Account {
  bank: string; rek: string; name: string; opening: number; closing: number;
}

interface Transaction {
  date: string; desc: string; masuk: number; keluar: number;
}

interface MonthData {
  month: string; label: string; holding: number; website: number;
}

const ACCOUNTS: Account[] = [
  { bank: "BRI", rek: "201101000546304", name: "SWI HOLDING", opening: 20505330, closing: 17902947 },
  { bank: "BRI", rek: "201101000555303", name: "SWI WEBSITE", opening: 790000, closing: 755000 },
];

const TRANSACTIONS: Transaction[] = [
  { date: "01/05", desc: "Saldo Awal Holding", masuk: 20505330, keluar: 0 },
  { date: "01/05", desc: "Saldo Awal Website", masuk: 790000, keluar: 0 },
  { date: "05/05", desc: "Transfer INDAH RINADI (BNI)", masuk: 1000000, keluar: 0 },
  { date: "06/05", desc: "Transfer ke PRIMA (ATM)", masuk: 0, keluar: 11398883 },
  { date: "06/05", desc: "Biaya transfer ATM", masuk: 0, keluar: 6500 },
  { date: "11/05", desc: "Online Banking Masuk", masuk: 969000, keluar: 0 },
  { date: "12/05", desc: "Transfer RISTY CITRA WU", masuk: 918000, keluar: 0 },
  { date: "12/05", desc: "Transfer ANGELA CECIL", masuk: 918000, keluar: 0 },
  { date: "13/05", desc: "Transfer JIHAN PUTRA", masuk: 969000, keluar: 0 },
  { date: "18/05", desc: "Transfer BANK DIGITAL", masuk: 1000000, keluar: 0 },
  { date: "21/05", desc: "Transfer DWI RETNO", masuk: 918000, keluar: 0 },
  { date: "25/05", desc: "Minimum Balance Fee (Website)", masuk: 0, keluar: 35000 },
  { date: "30/05", desc: "Transfer INDAH WIJAYA", masuk: 969000, keluar: 0 },
  { date: "31/05", desc: "Transfer MOONSPETAL", masuk: 1224000, keluar: 0 },
];

const MONTHLY_DATA: MonthData[] = [
  { month: "Jun 2025", label: "Jun25", holding: 0, website: 0 },
  { month: "Sep 2025", label: "Sep25", holding: 6467327, website: 0 },
  { month: "Oct 2025", label: "Oct25", holding: 9218585, website: 790000 },
  { month: "Des 2025", label: "Des25", holding: 8339601, website: 965000 },
  { month: "Jan 2026", label: "Jan26", holding: 4281228, website: 930000 },
  { month: "Mar 2026", label: "Mar26", holding: 16095626, website: 860000 },
  { month: "Apr 2026", label: "Apr26", holding: 37380730, website: 825000 },
  { month: "Mei 2026", label: "Mei26", holding: 17902947, website: 755000 },
];

const SHAREHOLDERS = [
  { name: "Beriman Juliano", shares: 850, pct: 34 },
  { name: "Muhamad Malsiaf", shares: 825, pct: 33 },
  { name: "Wapiq Rizya Zaelan", shares: 825, pct: 33 },
];

const INSIGHTS = [
  { type: "danger", icon: "🔴", text: "Holding balance turun 52% MoM (Apr→Mei: Rp 37.38M → Rp 17.90M)" },
  { type: "danger", icon: "🔴", text: "Transfer besar Rp 11.4M ke PRIMA (06/05) — perlu konfirmasi tujuan" },
  { type: "warning", icon: "🟡", text: "Rekening Website tidak aktif — hanya kena biaya admin Rp 35K/bulan" },
  { type: "warning", icon: "🟡", text: "Tidak ada pembayaran pajak terlihat di Mei 2026" },
  { type: "warning", icon: "🟡", text: "Tidak ada revenue dari customer/penjualan yang jelas teridentifikasi" },
  { type: "info", icon: "🔵", text: "Holding menerima total kredit Rp 9.8M di Mei 2026 (10 transaksi masuk)" },
  { type: "info", icon: "🔵", text: "Pola transfer masuk: mayoritas Rp 918K - Rp 1.0M per transaksi" },
  { type: "caution", icon: "⚠️", text: "Data rekening koran Jun-Jul 2025 tidak tersedia di Drive" },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fmt(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function fmtFull(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function KeuanganPage() {
  const [loading, setLoading] = useState(false);
  const lastUpdated = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const totalOpening = ACCOUNTS.reduce((s, a) => s + a.opening, 0);
  const totalClosing = ACCOUNTS.reduce((s, a) => s + a.closing, 0);
  const totalMasuk = TRANSACTIONS.reduce((s, t) => s + t.masuk, 0);
  const totalKeluar = TRANSACTIONS.reduce((s, t) => s + t.keluar, 0);
  const netFlow = totalMasuk - totalKeluar;
  const maxBalance = Math.max(...MONTHLY_DATA.map(d => d.holding + d.website));

  const refresh = () => { setLoading(true); setTimeout(() => setLoading(false), 1000); };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-400" /> Keuangan SWI
          </h2>
          <p className="text-[10px] text-[#4a6a5a]">Rekening Koran & Analisis Keuangan • Update: {lastUpdated}</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-[#6b9e8f] hover:text-white hover:bg-white/[0.08] transition-all">
          {loading ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── A: KPI RINGKASAN ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={<Wallet size={16} />} label="Total Kas & Bank" value={fmt(totalClosing)} sub={`${ACOUNTS.length} rekening aktif`} color="from-teal-500/15 to-teal-500/5" />
        <KpiCard icon={<ArrowUpRight size={16} />} label="Pemasukan Mei 2026" value={fmt(totalMasuk)} sub={`${TRANSACTIONS.filter(t => t.masuk > 0).length} transaksi masuk`} color="from-emerald-500/15 to-emerald-500/5" />
        <KpiCard icon={<ArrowDownRight size={16} />} label="Pengeluaran Mei 2026" value={fmt(totalKeluar)} sub={`${TRANSACTIONS.filter(t => t.keluar > 0).length} transaksi keluar`} color="from-orange-500/15 to-orange-500/5" />
        <KpiCard
          icon={netFlow < 0 ? <ArrowDown size={16} /> : <TrendingUp size={16} />}
          label="Net Cash Flow"
          value={fmt(Math.abs(netFlow))}
          sub={netFlow < 0 ? "Defisit Mei 2026" : "Surplus Mei 2026"}
          color={netFlow < 0 ? "from-red-500/15 to-red-500/5" : "from-emerald-500/15 to-emerald-500/5"}
          negative={netFlow < 0}
        />
      </div>

      {/* ── B: SALDO REKENING ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Saldo Rekening" icon={<Banknote size={14} className="text-teal-400" />}>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#5a8a78]">
                <th className="py-2 text-left font-semibold">Bank</th>
                <th className="py-2 text-left font-semibold">No Rek</th>
                <th className="py-2 text-left font-semibold">Atas Nama</th>
                <th className="py-2 text-right font-semibold">Saldo Akhir</th>
                <th className="py-2 text-right font-semibold">Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((a, i) => {
                const change = a.closing - a.opening;
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2.5 text-white font-medium">{a.bank}</td>
                    <td className="py-2.5 text-[#6b9e8f] font-mono text-[10px]">{a.rek}</td>
                    <td className="py-2.5 text-[#6b9e8f]">{a.name}</td>
                    <td className="py-2.5 text-right text-white font-bold">{fmtFull(a.closing)}</td>
                    <td className={`py-2.5 text-right font-bold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {change >= 0 ? "↓" : "↓"} {fmt(Math.abs(change))}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-white/10">
                <td className="py-2.5 text-white font-bold" colSpan={3}>TOTAL</td>
                <td className="py-2.5 text-right text-teal-400 font-black">{fmtFull(totalClosing)}</td>
                <td className="py-2.5 text-right text-red-400 font-bold">↓ {fmt(Math.abs(totalClosing - totalOpening))}</td>
              </tr>
            </tbody>
          </table>
        </Panel>

        {/* ── C: TREND SALDO (CSS BAR CHART) ── */}
        <Panel title="Trend Saldo Bulanan" icon={<TrendingUp size={14} className="text-blue-400" />}>
          <div className="mb-3 flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-teal-500 inline-block" /> Holding</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-blue-500 inline-block" /> Website</span>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {MONTHLY_DATA.map((d, i) => {
              const total = d.holding + d.website;
              const hPct = maxBalance > 0 ? (d.holding / maxBalance) * 100 : 0;
              const wPct = maxBalance > 0 ? (d.website / maxBalance) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a2e25] text-[9px] text-white px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none border border-white/10">
                    {fmt(total)}
                  </div>
                  <div className="w-full flex flex-col-reverse">
                    <div className="w-full bg-teal-500/80 rounded-t" style={{ height: `${Math.max(hPct, 2)}px` }} title={`Holding: ${fmt(d.holding)}`} />
                    <div className="w-full bg-blue-500/60 rounded-b" style={{ height: `${Math.max(wPct, 1)}px` }} title={`Website: ${fmt(d.website)}`} />
                  </div>
                  <span className="text-[8px] text-[#4a6a5a] mt-1">{d.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-2 text-[10px] text-[#4a6a5a]">Jun 2025 → Mei 2026 • Sumbu Y: Saldo (Rp)</div>
        </Panel>
      </div>

      {/* ── D: MUTASI PER BULAN ── */}
      <Panel title="Mutasi Rekening per Bulan" icon={<Wallet size={14} className="text-purple-400" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#5a8a78]">
                <th className="py-2 px-2 text-left font-semibold">Bulan</th>
                <th className="py-2 px-2 text-right font-semibold">Holding Akhir</th>
                <th className="py-2 px-2 text-right font-semibold">Website Akhir</th>
                <th className="py-2 px-2 text-right font-semibold">Total</th>
                <th className="py-2 px-2 text-center font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_DATA.map((d, i) => {
                const total = d.holding + d.website;
                const prevTotal = i > 0 ? MONTHLY_DATA[i - 1].holding + MONTHLY_DATA[i - 1].website : 0;
                const diff = prevTotal > 0 ? total - prevTotal : 0;
                return (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] ${i === MONTHLY_DATA.length - 1 ? "bg-teal-500/5" : ""}`}>
                    <td className="py-2 px-2 text-white font-medium">{d.month}</td>
                    <td className="py-2 px-2 text-right text-[#6b9e8f]">{fmt(d.holding)}</td>
                    <td className="py-2 px-2 text-right text-[#6b9e8f]">{fmt(d.website)}</td>
                    <td className="py-2 px-2 text-right text-white font-bold">{fmt(total)}</td>
                    <td className="py-2 px-2 text-center">
                      {prevTotal > 0 && (
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${diff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {diff >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {fmt(Math.abs(diff))}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── E: DETAIL TRANSAKSI MEI 2026 ── */}
      <Panel title="Detail Transaksi Mei 2026" icon={<DollarSign size={14} className="text-orange-400" />}
        badge={<span className="text-[10px] text-[#4a6a5a]">{TRANSACTIONS.length} transaksi</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#5a8a78] sticky top-0 bg-[#080c0a]">
                <th className="py-2 px-2 text-left font-semibold">Tanggal</th>
                <th className="py-2 px-2 text-left font-semibold">Deskripsi</th>
                <th className="py-2 px-2 text-right font-semibold">Masuk (Rp)</th>
                <th className="py-2 px-2 text-right font-semibold">Keluar (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] ${t.keluar > 1000000 ? "bg-red-500/5" : t.masuk > 0 ? "bg-emerald-500/[0.02]" : ""}`}>
                  <td className="py-2 px-2 text-[#6b9e8f] font-mono">{t.date}</td>
                  <td className="py-2 px-2 text-white">{t.desc}</td>
                  <td className="py-2 px-2 text-right text-emerald-400">{t.masuk > 0 ? fmtFull(t.masuk) : "—"}</td>
                  <td className="py-2 px-2 text-right text-red-400">{t.keluar > 0 ? fmtFull(t.keluar) : "—"}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-white/10 bg-white/[0.03]">
                <td className="py-2.5 px-2 text-white font-bold" colSpan={2}>TOTAL</td>
                <td className="py-2.5 px-2 text-right text-emerald-400 font-black">{fmtFull(totalMasuk)}</td>
                <td className="py-2.5 px-2 text-right text-red-400 font-black">{fmtFull(totalKeluar)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── F: KEY INSIGHTS + SHAREHOLDERS ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Key Insights" icon={<AlertTriangle size={14} className="text-orange-400" />}>
          <div className="space-y-2">
            {INSIGHTS.map((ins, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-[11px] ${
                ins.type === "danger" ? "bg-red-500/5 border border-red-500/10" :
                ins.type === "warning" ? "bg-orange-500/5 border border-orange-500/10" :
                ins.type === "caution" ? "bg-yellow-500/5 border border-yellow-500/10" :
                "bg-blue-500/5 border border-blue-500/10"
              }`}>
                <span className="flex-shrink-0">{ins.icon}</span>
                <span className="text-[#8ab8a8]">{ins.text}</span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Shareholders" icon={<Users size={14} className="text-purple-400" />}>
            <div className="space-y-2">
              {SHAREHOLDERS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-white">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-[#4a6a5a]">{s.shares} saham</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-teal-400">{s.pct}%</div>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Status Divisi" icon={<Building2 size={14} className="text-blue-400" />}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Produksi", icon: <FlaskConical size={14} />, color: "text-blue-400" },
                { name: "Event", icon: <Calendar size={14} />, color: "text-purple-400" },
                { name: "Store", icon: <Store size={14} />, color: "text-emerald-400" },
                { name: "Ecommerse", icon: <Globe size={14} />, color: "text-orange-400" },
              ].map((d, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className={`${d.color} mb-1 flex justify-center`}>{d.icon}</div>
                  <div className="text-[10px] font-bold text-white">{d.name}</div>
                  <div className="text-[9px] text-[#4a6a5a] mt-0.5">Menunggu data</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* ── G: COA RINGKASAN ── */}
      <Panel title="Chart of Accounts (COA)" icon={<PiggyBank size={14} className="text-emerald-400" />}>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { code: "A-100", name: "ASET", items: ["A-101 Kas Store", "A-102 Kas Holding", "A-103 Bank BRI Holding", "A-104 Bank BRI Website", "A-110 Piutang", "A-120 Persediaan"], color: "teal" },
            { code: "K-200", name: "KEWAJIBAN", items: ["K-200 Hutang Usaha", "K-210 Hutang Sukuk", "K-220 Hutang Pajak"], color: "orange" },
            { code: "P-400", name: "PENDAPATAN", items: ["P-400 Penjualan Retail", "P-401 Penjualan Online", "P-402 Distributor", "P-403 Kelas", "P-404 AI Mix", "P-405 Event", "P-406 Merch"], color: "emerald" },
          ].map((cat, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-${cat.color}-500/15 text-${cat.color}-400`}>{cat.code}</span>
                <span className="text-xs font-bold text-white">{cat.name}</span>
              </div>
              <div className="space-y-1">
                {cat.items.map((item, j) => (
                  <div key={j} className="text-[10px] text-[#6b9e8f] pl-2 border-l border-white/10">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function KpiCard({ icon, label, value, sub, color, negative }: any) {
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${color} border border-white/[0.06] hover:border-white/[0.12] transition-all`}>
      <div className="text-teal-400 mb-2">{icon}</div>
      <div className="text-[10px] text-[#5a8a78] font-medium mb-1">{label}</div>
      <div className={`text-xl font-black ${negative ? "text-red-400" : "text-white"}`}>{value}</div>
      {sub && <div className="text-[9px] text-[#4a6a5a] mt-0.5">{sub}</div>}
    </div>
  );
}

function Panel({ title, icon, children, badge }: any) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-all">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">{icon} {title}</h3>
        {badge && <div>{badge}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
