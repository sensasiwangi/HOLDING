"use client";

import { useState } from "react";
import {
  Building2, FileSpreadsheet, TrendingUp, ChevronDown, ChevronUp,
  CheckCircle, DollarSign, Package, Users, ShieldCheck, Wrench,
  Megaphone, ClipboardCheck, AlertTriangle, Clock, Rocket,
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

const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PHASE1: { label: "Phase 1: Mandatory (Investor Cash)", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <Rocket size={14} /> },
  PHASE2: { label: "Phase 2: Dari Laba (Bulan 2-3)", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <Clock size={14} /> },
  PHASE3: { label: "Phase 3: Dari Laba (Bulan 4-6)", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <TrendingUp size={14} /> },
};

interface RABItem {
  no: string;
  kategori: string;
  item: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  total: number;
  sumber: string;
  pic: string;
  keterangan: string;
  fase: string;
}

export default function SukukRABPanel({
  rabData,
  skemaData,
  cashflowData,
}: {
  rabData?: string[][] | null;
  skemaData?: string[][] | null;
  cashflowData?: string[][] | null;
}) {
  const [expandedFase, setExpandedFase] = useState<string | null>("PHASE1");

  // Parse RAB data
  const allItems: RABItem[] = [];
  let totalInvestor = 0;
  let totalSWI = 0;
  let totalLaba = 0;
  let grandTotal = 0;
  const faseTotals: Record<string, number> = {};
  const faseSources: Record<string, { investor: number; swi: number; laba: number }> = {};

  if (rabData) {
    // Find header row
    let headerIdx = -1;
    for (let i = 0; i < rabData.length; i++) {
      if (rabData[i][0] === "No" && rabData[i][1] === "Kategori") {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx >= 0) {
      for (let i = headerIdx + 1; i < rabData.length; i++) {
        const r = rabData[i];
        if (!r[0] && !r[1]) continue;

        const no = r[0] || "";
        const kat = r[1] || "";
        const item = r[2] || "";

        // Skip summary/formula rows
        if (no.startsWith("▸") || no.startsWith("══") || no === "") {
          if (item.includes("SUBTOTAL") || item.includes("TOTAL") || item.includes("GRAND")) {
            // Could parse summaries here if needed
          }
          continue;
        }

        // Skip category header rows (no item name)
        if (kat && !item) continue;
        if (!item) continue;

        const qty = safeNum(r[3]);
        const satuan = r[4] || "";
        const harga = safeNum(r[5]);
        const total = safeNum(r[6]);
        const sumber = r[7] || "";
        const pic = r[8] || "";
        const ket = r[9] || "";
        const fase = r[10] || "PHASE1";

        if (total <= 0 && !item) continue;

        allItems.push({ no, kategori: kat, item, qty, satuan, hargaSatuan: harga, total, sumber, pic, keterangan: ket, fase });

        if (total > 0) {
          grandTotal += total;
          if (!faseTotals[fase]) faseTotals[fase] = 0;
          faseTotals[fase] += total;
          if (!faseSources[fase]) faseSources[fase] = { investor: 0, swi: 0, laba: 0 };

          if (sumber.includes("SWI")) {
            totalSWI += total;
            faseSources[fase].swi += total;
          } else if (sumber.includes("Laba")) {
            totalLaba += total;
            faseSources[fase].laba += total;
          } else {
            totalInvestor += total;
            faseSources[fase].investor += total;
          }
        }
      }
    }
  }

  // Group by phase
  const byFase: Record<string, RABItem[]> = {};
  for (const item of allItems) {
    const fase = item.fase || "PHASE1";
    if (!byFase[fase]) byFase[fase] = [];
    byFase[fase].push(item);
  }

  // Parse cashflow
  const cfRows: { bulan: string; unit: number; revenue: number; cogs: number; gross: number; biayaFix: number; labaKotor: number; timFee: number; reserve: number; sisa: number; investor: number; swi: number; kumulatif: number; status: string }[] = [];
  if (cashflowData && cashflowData.length > 10) {
    for (let i = 14; i < cashflowData.length; i++) {
      const r = cashflowData[i];
      if (!r[0] || r[0] === "Bulan" || r[0] === "TOTAL" || r[0] === "" || r[0].includes("RATA") || r[0].includes("ROI")) continue;
      cfRows.push({
        bulan: r[0] || "",
        unit: safeNum(r[1]),
        revenue: safeNum(r[3]),
        cogs: safeNum(r[4]),
        gross: safeNum(r[5]),
        biayaFix: safeNum(r[6]),
        labaKotor: safeNum(r[7]),
        timFee: safeNum(r[8]),
        reserve: safeNum(r[9]),
        sisa: safeNum(r[10]),
        investor: safeNum(r[11]),
        swi: safeNum(r[12]),
        kumulatif: safeNum(r[13]),
        status: r[14] || "",
      });
    }
  }

  const totalCFInvestor = cfRows.reduce((a, r) => a + r.investor, 0);
  const totalCFSWI = cfRows.reduce((a, r) => a + r.swi, 0);
  const totalCFTIM = cfRows.reduce((a, r) => a + r.timFee, 0);
  const totalCFRevenue = cfRows.reduce((a, r) => a + r.revenue, 0);
  const lastKumulatif = cfRows.length > 0 ? cfRows[cfRows.length - 1].kumulatif : 0;
  const breakEvenMonth = cfRows.find(r => r.kumulatif >= 50000000)?.bulan || "—";

  const toggleFase = (f: string) => setExpandedFase(prev => prev === f ? null : f);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">
          📊 RAB Store TIM — Skema A Tight (Bootstrap)
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Modal investor Rp 50jt + kontribusi SWI in-kind → Mulai kecil, buktikan profit, scale up
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-green-200 rounded-xl bg-green-50 p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-100 mb-2">
            <DollarSign size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-green-700">Investor Cash (Phase 1)</div>
          <div className="text-lg font-extrabold text-green-700 mt-1">{fmtRp(totalInvestor)}</div>
          <div className="text-[10px] text-green-600">dari budget Rp 50jt</div>
        </div>
        <div className="border border-purple-200 rounded-xl bg-purple-50 p-4">
          <div className="inline-flex p-2 rounded-lg bg-purple-100 mb-2">
            <Wrench size={18} className="text-purple-600" />
          </div>
          <div className="text-xs text-purple-700">SWI (In-Kind)</div>
          <div className="text-lg font-extrabold text-purple-700 mt-1">{fmtRp(totalSWI)}</div>
          <div className="text-[10px] text-purple-600">sistem, desain, training</div>
        </div>
        <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-100 mb-2">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-blue-700">Laba Ditahan (Phase 2+3)</div>
          <div className="text-lg font-extrabold text-blue-700 mt-1">{fmtRp(totalLaba)}</div>
          <div className="text-[10px] text-blue-600">dari profit bulan 2-6</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <Building2 size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Grand Total</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">{fmtRp(grandTotal)}</div>
          <div className="text-[10px] text-[var(--muted)]">{totalInvestor + totalSWI > 0 ? `Nisbah ${Math.round(totalInvestor / (totalInvestor + totalSWI) * 100)}:${Math.round(totalSWI / (totalInvestor + totalSWI) * 100)}` : "—"}</div>
        </div>
      </div>

      {/* Investor Budget Status */}
      <div className="border border-green-200 rounded-xl bg-green-50 p-4">
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
          <div className="text-sm text-green-800">
            <strong>Status Budget: PAS ✅</strong>
            <p className="text-xs mt-1 text-green-700">
              Investor cash: <strong>{fmtRp(totalInvestor)}</strong> dari budget <strong>Rp 50.000.000</strong>
              {totalInvestor <= 50000000 ? (
                <> — sisa buffer <strong>{fmtRp(50000000 - totalInvestor)}</strong> untuk keperluan darurat</>
              ) : (
                <> — kelebihan <strong>{fmtRp(totalInvestor - 50000000)}</strong>, perlu revisi</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Phase Breakdown */}
      {["PHASE1", "PHASE2", "PHASE3"].map(fase => {
        const config = PHASE_CONFIG[fase];
        const items = byFase[fase] || [];
        const isExpanded = expandedFase === fase;
        const faseTotal = faseTotals[fase] || 0;
        const sources = faseSources[fase] || { investor: 0, swi: 0, laba: 0 };
        const totalDirect = sources.investor + sources.swi;

        if (items.length === 0) return null;

        return (
          <div key={fase} className={`border rounded-xl bg-white overflow-hidden ${isExpanded ? "border-[var(--brand)]" : "border-[var(--line)]"}`}>
            {/* Phase Header */}
            <button
              onClick={() => toggleFase(fase)}
              className={`w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--soft)] transition ${config.bg}`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm">
                {config.icon}
              </div>
              <div className="flex-1">
                <div className={`font-bold text-sm ${config.color}`}>{config.label}</div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--muted)]">
                  <span>{items.length} item</span>
                  {sources.investor > 0 && <span className="text-green-700">Investor: {fmtRp(sources.investor)}</span>}
                  {sources.swi > 0 && <span className="text-purple-700">SWI: {fmtRp(sources.swi)}</span>}
                  {sources.laba > 0 && <span className="text-blue-700">Laba: {fmtRp(sources.laba)}</span>}
                </div>
              </div>
              <div className="text-right mr-2">
                <div className={`font-extrabold text-sm ${config.color}`}>{fmtRp(faseTotal)}</div>
                <div className="text-[10px] text-[var(--muted)]">
                  {totalDirect > 0 ? `Nisbah ${Math.round(sources.investor / totalDirect * 100)}:${Math.round(sources.swi / totalDirect * 100)}` : ""}
                </div>
              </div>
              {isExpanded ? <ChevronUp size={16} className="text-[var(--muted)]" /> : <ChevronDown size={16} className="text-[var(--muted)]" />}
            </button>

            {/* Phase Items */}
            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--soft)] text-[var(--muted)] border-b border-[var(--line)]">
                      <th className="py-2 px-5 text-left">Item</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Harga</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-left">Sumber</th>
                      <th className="py-2 px-3 text-left">PIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} className="border-b border-[var(--line)]/50 hover:bg-[var(--soft)]/50">
                        <td className="py-2 px-5">
                          <div className="font-medium text-[var(--ink)]">{it.item}</div>
                          {it.keterangan && <div className="text-[10px] text-[var(--muted)] mt-0.5">{it.keterangan}</div>}
                        </td>
                        <td className="py-2 px-3 text-right">{it.qty || "—"} {it.satuan}</td>
                        <td className="py-2 px-3 text-right">{fmtRp(it.hargaSatuan)}</td>
                        <td className="py-2 px-3 text-right font-bold">{fmtRp(it.total)}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            it.sumber.includes("SWI") ? "bg-purple-100 text-purple-700" :
                            it.sumber.includes("Laba") ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {it.sumber}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[var(--muted)]">{it.pic}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={`font-bold ${config.color} ${config.bg}`}>
                      <td className="py-2 px-5" colSpan={3}>Total {config.label}</td>
                      <td className="py-2 px-3 text-right">{fmtRp(faseTotal)}</td>
                      <td className="py-2 px-3" colSpan={2}>
                        {sources.investor > 0 && `Inv: ${fmtRp(sources.investor)}`}
                        {sources.swi > 0 && ` | SWI: ${fmtRp(sources.swi)}`}
                        {sources.laba > 0 && ` | Laba: ${fmtRp(sources.laba)}`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Nisbah Summary */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--brand)]" />
          Struktur Bagi Hasil (Nisbah)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-700">TIM (Ju'alah)</span>
            </div>
            <div className="text-xl font-extrabold text-orange-700">10%</div>
            <div className="text-[10px] text-orange-600 mt-1">Dari laba bersih, pengelolaan operasional</div>
          </div>
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-xs font-bold text-green-700">Investor</span>
            </div>
            <div className="text-xl font-extrabold text-green-700">42.5%</div>
            <div className="text-[10px] text-green-600 mt-1">50% dari sisa 85% (modal 100% dari investor)</div>
          </div>
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={14} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-700">SWI</span>
            </div>
            <div className="text-xl font-extrabold text-purple-700">42.5%</div>
            <div className="text-[10px] text-purple-600 mt-1">50% dari sisa 85% (kontribusi in-kind setara)</div>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-[var(--muted)] text-center">
          Reserve Fund 5% disisihkan setiap periode untuk coverage kerugian
        </div>
      </div>

      {/* Cashflow Projection */}
      {cfRows.length > 0 && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h3 className="font-bold text-[var(--ink)] mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--brand)]" />
            Proyeksi Cashflow & Bagi Hasil — 15 Bulan
          </h3>
          <p className="text-xs text-[var(--muted)] mb-4">
            Asumsi: harga jual rata-rata Rp 120.000/unit, COGS 45%, biaya fix Rp 16jt/bln (sewa+op), nisbah Investor:SWI = 50:50
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--soft)] text-[var(--muted)]">
                  <th className="py-2 px-2 text-left">Bulan</th>
                  <th className="py-2 px-2 text-right">Unit</th>
                  <th className="py-2 px-2 text-right">Revenue</th>
                  <th className="py-2 px-2 text-right">COGS</th>
                  <th className="py-2 px-2 text-right">Laba Kotor</th>
                  <th className="py-2 px-2 text-right">TIM</th>
                  <th className="py-2 px-2 text-right">Investor</th>
                  <th className="py-2 px-2 text-right">SWI</th>
                  <th className="py-2 px-2 text-right">Kumulatif</th>
                </tr>
              </thead>
              <tbody>
                {cfRows.map((row, i) => {
                  const isLoss = row.labaKotor <= 0;
                  return (
                    <tr key={i} className={`border-b border-[var(--line)] ${isLoss ? "bg-red-50" : ""}`}>
                      <td className="py-2 px-2 font-medium">{row.bulan}</td>
                      <td className="py-2 px-2 text-right">{row.unit}</td>
                      <td className="py-2 px-2 text-right">{fmtRp(row.revenue)}</td>
                      <td className="py-2 px-2 text-right text-red-600">{fmtRp(row.cogs)}</td>
                      <td className={`py-2 px-2 font-medium ${isLoss ? "text-red-600" : ""}`}>{fmtRp(row.labaKotor)}</td>
                      <td className="py-2 px-2 text-right text-orange-600">{fmtRp(row.timFee)}</td>
                      <td className="py-2 px-2 text-right text-green-700 font-bold">{fmtRp(row.investor)}</td>
                      <td className="py-2 px-2 text-right text-purple-700 font-bold">{fmtRp(row.swi)}</td>
                      <td className="py-2 px-2 text-right font-medium">{fmtRp(row.kumulatif)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--soft)] font-bold">
                  <td className="py-2 px-2">TOTAL</td>
                  <td className="py-2 px-2 text-right">{cfRows.reduce((a, r) => a + r.unit, 0)}</td>
                  <td className="py-2 px-2 text-right">{fmtRp(totalCFRevenue)}</td>
                  <td className="py-2 px-2 text-right">—</td>
                  <td className="py-2 px-2 text-right">—</td>
                  <td className="py-2 px-2 text-right">{fmtRp(totalCFTIM)}</td>
                  <td className="py-2 px-2 text-right text-green-700">{fmtRp(totalCFInvestor)}</td>
                  <td className="py-2 px-2 text-right text-purple-700">{fmtRp(totalCFSWI)}</td>
                  <td className="py-2 px-2 text-right">{fmtRp(lastKumulatif)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cashflow Summary */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="border border-green-200 rounded-lg bg-green-50 p-3 text-center">
              <div className="text-[10px] text-green-700 font-bold">Total Investor</div>
              <div className="text-lg font-extrabold text-green-700">{fmtRp(totalCFInvestor)}</div>
            </div>
            <div className="border border-purple-200 rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-[10px] text-purple-700 font-bold">Total SWI</div>
              <div className="text-lg font-extrabold text-purple-700">{fmtRp(totalCFSWI)}</div>
            </div>
            <div className="border border-orange-200 rounded-lg bg-orange-50 p-3 text-center">
              <div className="text-[10px] text-orange-700 font-bold">Total TIM Fee</div>
              <div className="text-lg font-extrabold text-orange-700">{fmtRp(totalCFTIM)}</div>
            </div>
            <div className="border border-blue-200 rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-[10px] text-blue-700 font-bold">ROI (15 bln)</div>
              <div className="text-lg font-extrabold text-blue-700">{totalCFInvestor > 0 ? ((totalCFInvestor / 50000000) * 100).toFixed(1) : 0}%</div>
            </div>
            <div className="border border-[var(--line)] rounded-lg bg-white p-3 text-center">
              <div className="text-[10px] text-[var(--muted)] font-bold">Break-Even Modal</div>
              <div className="text-lg font-extrabold text-[var(--ink)]">{breakEvenMonth}</div>
            </div>
          </div>

          {/* Return of Capital Progress */}
          <div className="mt-4">
            <h4 className="font-bold text-xs text-[var(--ink)] mb-2">Progress Return of Capital (Target: Rp 50.000.000)</h4>
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all flex items-center justify-end pr-2"
                style={{ width: `${Math.min((lastKumulatif / 50000000) * 100, 100)}%` }}
              >
                {(lastKumulatif / 50000000 * 100) > 20 && (
                  <span className="text-[9px] font-bold text-white">{(lastKumulatif / 50000000 * 100).toFixed(0)}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-[var(--muted)]">
              <span>Rp 0</span>
              <span>{fmtRp(lastKumulatif)} / Rp 50.000.000</span>
              <span>Rp 50.000.000</span>
            </div>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Skema A Tight = Bootstrap:</strong> Renovasi DIY, furniture second, tanpa karyawan (owner-operated). Fokus ke revenue dulu.</p>
            <p><strong>Phase 2 & 3:</strong> Didanai dari laba. Jika profit bulan 2-3 stabil, langsung upgrade AC, CCTV, restock, ads.</p>
            <p><strong>SWI In-Kind Rp 46,5jt:</strong> POS system (35jt), izin legal (3jt), desain interior (5jt), training (3jt), product photos (0.5jt).</p>
            <p><strong>Upgrade path:</strong> Jika sukses bulan 4-6, bisa cari investor kedua untuk upgrade ke Skema B (standard store).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
