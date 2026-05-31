"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, Users, Target, DollarSign, CheckCircle, Clock,
  AlertTriangle, ShieldCheck, BarChart3, Zap, Activity,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, RefreshCw,
} from "lucide-react";

function fmtRp(n: number): string {
  if (!n && n !== 0) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function safeNum(v: string | number | undefined): number {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

interface LiveMonitoringData {
  sukukInfo?: string[][] | null;
  investor?: string[][] | null;
  proyeksi?: string[][] | null;
  paymentSchedule?: string[][] | null;
  fetchedAt?: string;
}

export default function SukukLiveMonitor({ data }: { data?: LiveMonitoringData }) {
  const [expanded, setExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse data
  const sukukInfo: Record<string, string> = {};
  if (data?.sukukInfo) {
    for (const r of data.sukukInfo) {
      if (r[0] && r[1]) sukukInfo[r[0]] = r[1];
      if (r[4] && r[5]) sukukInfo[r[4]] = r[5];
    }
  }

  type InvestorEntry = { no: number; nama: string; jenis: string; unit: number; nominal: number; pct: string; tanggal: string; status: string; kontak: string; email: string };
  const investors: InvestorEntry[] = [];
  let totalUnit = 0, totalNominal = 0, totalAktif = 0, totalPending = 0;
  if (data?.investor) {
    for (const r of data.investor) {
      if (!r[0] || isNaN(safeNum(r[0]))) continue;
      const unit = safeNum(r[3]);
      const nominal = safeNum(r[4]);
      totalUnit += unit;
      totalNominal += nominal;
      if (r[7] === "Aktif") totalAktif += nominal;
      else if (r[7] === "Menunggu") totalPending += nominal;
      investors.push({ no: safeNum(r[0]), nama: r[1] || "", jenis: r[2] || "", unit, nominal, pct: r[5] || "", tanggal: r[6] || "", status: r[7] || "", kontak: r[8] || "", email: r[9] || "" });
    }
  }

  const nilaiSukuk = 1000000000; // 1Miliar
  const pctTerjual = (totalNominal / nilaiSukuk) * 100;
  const pctAktif = (totalAktif / nilaiSukuk) * 100;
  const unitTerjual = totalUnit;
  const unitTarget = 1000;

  // Compute milestones
  const milestones = [
    { label: "10% Terkumpul (Rp 100jt)", threshold: 10, pct: pctTerjual },
    { label: "25% Terkumpul (Rp 250jt)", threshold: 25, pct: pctTerjual },
    { label: "50% Terkumpul (Rp 500jt)", threshold: 50, pct: pctTerjual },
    { label: "75% Terkumpul (Rp 750jt)", threshold: 75, pct: pctTerjual },
    { label: "100% Fully Subscribed", threshold: 100, pct: pctTerjual },
  ];

  const nextMilestone = milestones.find(m => m.pct < m.threshold);
  const nextMilestoneGap = nextMilestone ? (nextMilestone.threshold - pctTerjual) / 100 * nilaiSukuk : 0;

  // Determine phase
  const phase = pctTerjual >= 100 ? "CLOSED" : pctTerjual >= 75 ? "FINAL_CALL" : pctTerjual >= 50 ? "GROWTH" : pctTerjual >= 25 ? "BUILD" : "EARLY";
  const phaseConfig: Record<string, { label: string; color: string; bg: string }> = {
    EARLY: { label: "🌱 Early Stage", color: "text-blue-700", bg: "bg-blue-50" },
    BUILD: { label: "📈 Building Momentum", color: "text-indigo-700", bg: "bg-indigo-50" },
    GROWTH: { label: "🚀 Growth Phase", color: "text-purple-700", bg: "bg-purple-50" },
    FINAL_CALL: { label: "⚡ Final Call", color: "text-orange-700", bg: "bg-orange-50" },
    CLOSED: { label: "✅ Fully Subscribed", color: "text-green-700", bg: "bg-green-50" },
  };
  const currentPhase = phaseConfig[phase];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)] flex items-center gap-2">
            <Activity size={20} className="text-[var(--brand)] animate-pulse" />
            Live Issuance Monitor
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Real-time monitoring penawaran sukuk — update setiap refresh data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--muted)]">
            Last sync: {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString("id-ID") : "—"}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg border border-[var(--line)] hover:border-[var(--brand)] transition"
          >
            <RefreshCw size={14} className="text-[var(--muted)]" />
          </button>
        </div>
      </div>

      {/* Phase Banner */}
      <div className={`rounded-xl p-4 ${currentPhase.bg} border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={20} className={currentPhase.color.replace("text-", "text-")} />
            <div>
              <div className={`font-bold text-sm ${currentPhase.color}`}>{currentPhase.label}</div>
              <div className="text-xs text-[var(--muted)]">
                {nextMilestone
                  ? `Target berikutnya: ${nextMilestone.label} — kekurangan ${fmtRp(nextMilestoneGap)}`
                  : "Sukuk fully subscribed! 🎉"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-extrabold ${currentPhase.color}`}>{pctTerjual.toFixed(1)}%</div>
            <div className="text-[10px] text-[var(--muted)]">terkumpul</div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <DollarSign size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Total Dana Terkumpul</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">{fmtRp(totalNominal)}</div>
          <div className="text-[10px] text-[var(--muted)]">dari target {fmtRp(nilaiSukuk)}</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <Target size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Unit Terjual</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">{unitTerjual}</div>
          <div className="text-[10px] text-[var(--muted)]">dari {unitTarget} unit</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-indigo-50 mb-2">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Jumlah Investor</div>
          <div className="text-lg font-extrabold text-indigo-600 mt-1">{investors.length}</div>
          <div className="text-[10px] text-[var(--muted)]">{investors.filter(i => i.status === "Aktif").length} aktif</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <ShieldCheck size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">KYC Verified</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">{investors.filter(i => i.nama && !i.nama.startsWith("[")).length}</div>
          <div className="text-[10px] text-[var(--muted)]">investor tervalidasi</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[var(--ink)]">Progress Penawaran Sukuk</span>
          <span className="text-sm font-extrabold text-[var(--brand)]">{pctTerjual.toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-teal-400 transition-all relative" style={{ width: `${Math.min(pctTerjual, 100)}%` }}>
            {pctTerjual >= 5 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white">
                {pctTerjual.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[var(--muted)]">
          <span>Rp 0</span>
          <span>Target: {fmtRp(nilaiSukuk)}</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-[var(--brand)]" />
          Milestones
        </h3>
        <div className="space-y-2">
          {milestones.map((m, i) => {
            const reached = m.pct >= m.threshold;
            const isCurrent = m === nextMilestone;
            return (
              <div key={i} className={`flex items-center gap-3 py-1.5 px-3 rounded-lg ${
                reached ? "bg-green-50" : isCurrent ? "bg-orange-50" : "bg-gray-50"
              }`}>
                {reached ? (
                  <CheckCircle size={14} className="text-green-600 shrink-0" />
                ) : isCurrent ? (
                  <Clock size={14} className="text-orange-500 shrink-0 animate-pulse" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={`text-xs flex-1 ${reached ? "text-green-700 line-through" : isCurrent ? "text-orange-700 font-bold" : "text-[var(--muted)]"}`}>
                  {m.label}
                </span>
                {reached && <span className="text-[10px] text-green-600 font-bold">✅</span>}
                {isCurrent && <span className="text-[10px] text-orange-600 font-bold">← current</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Investor Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aktif vs Pending */}
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h3 className="font-bold text-sm text-[var(--ink)] mb-3">Breakdown Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-700 font-bold">✅ Aktif (Terverifikasi)</span>
                <span className="font-bold text-green-700">{fmtRp(totalAktif)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(pctAktif, 100)}%` }} />
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">{pctAktif.toFixed(1)}% dari target</div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-700 font-bold">⏳ Menunggu (Pending)</span>
                <span className="font-bold text-orange-700">{fmtRp(totalPending)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min((totalPending / nilaiSukuk) * 100, 100)}%` }} />
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">{((totalPending / nilaiSukuk) * 100).toFixed(1)}% dari target</div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-600 font-bold">❌ Sisa Belum Terjual</span>
                <span className="font-bold text-red-600">{fmtRp(nilaiSukuk - totalNominal)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-300 rounded-full" style={{ width: `${Math.max(0, 100 - pctTerjual)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Investors */}
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h3 className="font-bold text-sm text-[var(--ink)] mb-3">Investor Terbaru</h3>
          {investors.length === 0 ? (
            <p className="text-xs text-[var(--muted)] text-center py-4">Belum ada investor</p>
          ) : (
            <div className="space-y-2">
              {investors.slice(-5).reverse().map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--line)]/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      inv.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {inv.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{inv.nama.startsWith("[") ? "—" : inv.nama}</div>
                      <div className="text-[10px] text-[var(--muted)]">{inv.unit} unit · {fmtRp(inv.nominal)}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inv.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-500" />
          Alert & Notifikasi
        </h3>
        <div className="space-y-2">
          {pctTerjual < 10 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <ArrowUpRight size={14} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Early Stage:</strong> Baru {pctTerjual.toFixed(1)}% terkumpul. Pertimbangkan early-bird bonus 2% tambahan bagi investor pertama.
              </div>
            </div>
          )}
          {totalPending > 0 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
              <Clock size={14} className="text-orange-600 mt-0.5 shrink-0" />
              <div className="text-xs text-orange-800">
                <strong>Pending:</strong> {fmtRp(totalPending)} dari {investors.filter(i => i.status === "Menunggu").length} investor belum aktif. Follow up untuk penyelesaian KYC.
              </div>
            </div>
          )}
          {(nilaiSukuk - totalNominal) > 0 && pctTerjual < 100 && (
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <ArrowDownRight size={14} className="text-gray-500 mt-0.5 shrink-0" />
              <div className="text-xs text-gray-600">
                <strong>Sisa:</strong> {fmtRp(nilaiSukuk - totalNominal)} lagi untuk fully subscribed ({Math.ceil((nilaiSukuk - totalNominal) / 1000000)} unit).
              </div>
            </div>
          )}
          {investors.filter(i => i.nama.startsWith("[")).length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-xs text-yellow-800">
                <strong>Placeholder:</strong> {investors.filter(i => i.nama.startsWith("[")).length} slot investor masih placeholder. Ganti dengan data sebenarnya.
              </div>
            </div>
          )}
          {pctTerjual >= 100 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
              <div className="text-xs text-green-800">
                <strong>Fully Subscribed!</strong> Semua unit sukuk telah terjual. Saatnya penandatanganan akad dan penerimaan dana.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-[var(--muted)] pt-2">
        Data diambil dari Google Sheets · Auto-refresh saat halaman di-reload · Waktu server: {currentTime.toLocaleTimeString("id-ID")}
      </div>
    </div>
  );
}
