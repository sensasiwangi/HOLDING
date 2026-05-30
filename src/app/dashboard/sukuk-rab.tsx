"use client";

import { useState } from "react";
import {
  Building2, FileSpreadsheet, TrendingUp, ChevronDown, ChevronUp,
  CheckCircle, DollarSign, Package, Users, ShieldCheck, Wrench,
  Megaphone, ClipboardCheck, AlertTriangle,
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

const CAT_ICONS: Record<string, React.ReactNode> = {
  A: <DollarSign size={14} />,
  B: <Wrench size={14} />,
  C: <ClipboardCheck size={14} />,
  D: <Package size={14} />,
  E: <Megaphone size={14} />,
  F: <Users size={14} />,
  G: <ShieldCheck size={14} />,
  H: <Building2 size={14} />,
};

const CAT_LABELS: Record<string, string> = {
  A: "Lokasi & Sewa",
  B: "Renovasi & Interior",
  C: "Peralatan & Sistem",
  D: "Raw Material & Inventory",
  E: "Branding & Marketing",
  F: "SDM & Tenaga Kerja",
  G: "Legal & Admin",
  H: "Pre-Opening",
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
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  // Parse RAB data (skip header rows 0-4, headers at row 5)
  const items: RABItem[] = [];
  const catTotals: Record<string, number> = {};
  let totalInvestor = 0;
  let totalSWI = 0;
  let totalLaba = 0;
  let grandTotal = 0;

  if (rabData) {
    for (let i = 6; i < rabData.length; i++) {
      const r = rabData[i];
      if (!r[0] && !r[1]) continue;
      const cat = r[0] || "";
      const sub = r[1] || "";
      const item = r[2] || "";
      const qty = safeNum(r[3]);
      const satuan = r[4] || "";
      const harga = safeNum(r[5]);
      const total = safeNum(r[6]);
      const sumber = r[7] || "";
      const pic = r[8] || "";
      const ket = r[9] || "";

      if (sub && !item) {
        // Category header row
        continue;
      }

      if (!item) continue;

      const catKey = cat.substring(0, 1);
      if (!catTotals[catKey]) catTotals[catKey] = 0;
      catTotals[catKey] += total;
      grandTotal += total;

      if (sumber.includes("Investor") && !sumber.includes("SWI") && !sumber.includes("Laba")) {
        totalInvestor += total;
      } else if (sumber.includes("SWI")) {
        totalSWI += total;
      } else if (sumber.includes("Laba")) {
        totalLaba += total;
      }

      items.push({ no: cat, kategori: sub, item, qty, satuan, hargaSatuan: harga, total, sumber, pic, keterangan: ket });
    }
  }

  // Group items by category
  const byCat: Record<string, RABItem[]> = {};
  for (const item of items) {
    const key = item.no.substring(0, 1);
    if (!byCat[key]) byCat[key] = [];
    byCat[key].push(item);
  }

  // Parse cashflow data
  const cfRows: { bulan: string; unit: number; revenue: number; cogs: number; gross: number; biayaOp: number; labaKotor: number; timFee: number; reserve: number; sisa: number; investor: number; swi: number; kumulatif: number }[] = [];
  if (cashflowData && cashflowData.length > 12) {
    for (let i = 12; i < cashflowData.length - 1; i++) {
      const r = cashflowData[i];
      if (!r[0] || r[0] === "Bulan" || r[0] === "TOTAL" || r[0] === "") continue;
      if (r[0].includes("ROI")) continue;
      cfRows.push({
        bulan: r[0] || "",
        unit: safeNum(r[1]),
        revenue: safeNum(r[2]),
        cogs: safeNum(r[3]),
        gross: safeNum(r[4]),
        biayaOp: safeNum(r[5]),
        labaKotor: safeNum(r[6]),
        timFee: safeNum(r[7]),
        reserve: safeNum(r[8]),
        sisa: safeNum(r[9]),
        investor: safeNum(r[10]),
        swi: safeNum(r[11]),
        kumulatif: safeNum(r[12]),
      });
    }
  }

  const totalCFInvestor = cfRows.reduce((a, r) => a + r.investor, 0);
  const totalCFSWI = cfRows.reduce((a, r) => a + r.swi, 0);
  const totalCFTIM = cfRows.reduce((a, r) => a + r.timFee, 0);
  const totalCFRevenue = cfRows.reduce((a, r) => a + r.revenue, 0);
  const lastKumulatif = cfRows.length > 0 ? cfRows[cfRows.length - 1].kumulatif : 0;

  const toggleCat = (cat: string) => {
    setExpandedCat(prev => prev === cat ? null : cat);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">
          📊 RAB Store TIM — Rencana Anggaran Biaya
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Rincian biaya pendirian & operasional SWI Store di TIM
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <Building2 size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Total RAB Skema A</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">
            {fmtRp(grandTotal)}
          </div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <DollarSign size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Investor (Cash)</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">
            {fmtRp(totalInvestor)}
          </div>
          <div className="text-[10px] text-[var(--muted)]">{grandTotal > 0 ? (totalInvestor / grandTotal * 100).toFixed(1) : 0}% dari total</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-purple-50 mb-2">
            <Wrench size={18} className="text-purple-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">SWI (In-Kind)</div>
          <div className="text-lg font-extrabold text-purple-600 mt-1">
            {fmtRp(totalSWI)}
          </div>
          <div className="text-[10px] text-[var(--muted)]">{grandTotal > 0 ? (totalSWI / grandTotal * 100).toFixed(1) : 0}% dari total</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <TrendingUp size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Total Investor + SWI</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">
            {fmtRp(totalInvestor + totalSWI)}
          </div>
          <div className="text-[10px] text-[var(--muted)]">Nisbah {totalInvestor + totalSWI > 0 ? (totalInvestor / (totalInvestor + totalSWI) * 100).toFixed(0) : 0}:{totalInvestor + totalSWI > 0 ? (totalSWI / (totalInvestor + totalSWI) * 100).toFixed(0) : 0}</div>
        </div>
      </div>

      {/* Investor Funding Gap */}
      <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <DollarSign size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <strong>Kebutuhan Investor Skema A: {fmtRp(totalInvestor)}</strong>
            <p className="text-xs mt-1 text-blue-700">
              Dengan 1 investor @ Rp 50jt, store bisa beroperasi Skema A (mini-store, owner-operated).
              Untuk Skema B (standard) butuh ~Rp 200jt ({fmtRp(200000000 - totalInvestor)} tambahan).
              Untuk Skema C (full) butuh ~Rp 236jt ({fmtRp(235650000 - totalInvestor)} tambahan).
            </p>
          </div>
        </div>
      </div>

      {/* RAB Detail by Category */}
      <div className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
        <div className="bg-[var(--soft)] px-5 py-3">
          <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-[var(--brand)]" />
            Rincian Anggaran Biaya per Kategori
          </h3>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {Object.entries(byCat).map(([catKey, catItems]) => {
            const catTotal = catTotals[catKey] || 0;
            const isExpanded = expandedCat === catKey;
            const catLabel = CAT_LABELS[catKey] || catKey;
            const icon = CAT_ICONS[catKey] || <Package size={14} />;

            return (
              <div key={catKey}>
                <button
                  onClick={() => toggleCat(catKey)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[var(--soft)] transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--soft)] flex items-center justify-center text-[var(--brand)]">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-[var(--ink)]">
                      {catKey}. {catLabel}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {catItems.length} item
                    </div>
                  </div>
                  <div className="text-right mr-2">
                    <div className="font-extrabold text-sm text-[var(--ink)]">
                      {fmtRp(catTotal)}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {grandTotal > 0 ? (catTotal / grandTotal * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-[var(--muted)]" /> : <ChevronDown size={14} className="text-[var(--muted)]" />}
                </button>

                {isExpanded && (
                  <div className="bg-[var(--soft)]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                          <th className="py-2 px-5 text-left">Item</th>
                          <th className="py-2 px-4 text-right">Qty</th>
                          <th className="py-2 px-4 text-right">Harga</th>
                          <th className="py-2 px-4 text-right">Total</th>
                          <th className="py-2 px-4 text-left">Sumber</th>
                          <th className="py-2 px-4 text-left">PIC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catItems.map((it, idx) => (
                          <tr key={idx} className="border-b border-[var(--line)]/50">
                            <td className="py-2 px-5">
                              <div className="font-medium text-[var(--ink)]">{it.item}</div>
                              {it.keterangan && <div className="text-[10px] text-[var(--muted)]">{it.keterangan}</div>}
                            </td>
                            <td className="py-2 px-4 text-right">{it.qty} {it.satuan}</td>
                            <td className="py-2 px-4 text-right">{fmtRp(it.hargaSatuan)}</td>
                            <td className="py-2 px-4 text-right font-bold">{fmtRp(it.total)}</td>
                            <td className="py-2 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                it.sumber.includes("SWI") ? "bg-purple-100 text-purple-700" :
                                it.sumber.includes("Laba") ? "bg-orange-100 text-orange-700" :
                                "bg-green-100 text-green-700"
                              }`}>
                                {it.sumber}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-[var(--muted)]">{it.pic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="border-t-2 border-[var(--line)] px-5 py-4 flex items-center justify-between">
          <span className="font-extrabold text-sm text-[var(--ink)]">TOTAL RAB SKEMA A</span>
          <span className="font-extrabold text-lg text-[var(--brand)]">{fmtRp(grandTotal)}</span>
        </div>
      </div>

      {/* Sumber Pendana Split */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-green-200 rounded-xl bg-green-50 p-4 text-center">
          <div className="text-xs font-bold text-green-700 mb-1">Investor (Cash)</div>
          <div className="text-xl font-extrabold text-green-700">{fmtRp(totalInvestor)}</div>
        </div>
        <div className="border border-purple-200 rounded-xl bg-purple-50 p-4 text-center">
          <div className="text-xs font-bold text-purple-700 mb-1">SWI (In-Kind)</div>
          <div className="text-xl font-extrabold text-purple-700">{fmtRp(totalSWI)}</div>
        </div>
        <div className="border border-orange-200 rounded-xl bg-orange-50 p-4 text-center">
          <div className="text-xs font-bold text-orange-700 mb-1">Laba Ditahan</div>
          <div className="text-xl font-extrabold text-orange-700">{fmtRp(totalLaba)}</div>
        </div>
      </div>

      {/* Cashflow Projection */}
      {cfRows.length > 0 && (
        <>
          <div className="border border-[var(--line)] rounded-xl bg-white p-5">
            <h3 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--brand)]" />
              Proyeksi Cashflow & Bagi Hasil — Skema A
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Asumsi: harga jual rata-rata Rp 150.000/unit, COGS 55%, biaya op Rp 12jt/bulan, TIM 10%, Reserve 5%, Investor:SWI = 75:25
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                    <th className="py-2 px-2 text-left">Bulan</th>
                    <th className="py-2 px-2 text-right">Unit</th>
                    <th className="py-2 px-2 text-right">Revenue</th>
                    <th className="py-2 px-2 text-right">COGS</th>
                    <th className="py-2 px-2 text-right">Gross</th>
                    <th className="py-2 px-2 text-right">Biaya Op</th>
                    <th className="py-2 px-2 text-right">Laba Kotor</th>
                    <th className="py-2 px-2 text-right">TIM 10%</th>
                    <th className="py-2 px-2 text-right">Reserve 5%</th>
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
                        <td className="py-2 px-2 font-medium text-xs">{row.bulan}</td>
                        <td className="py-2 px-2 text-right">{row.unit}</td>
                        <td className="py-2 px-2 text-right">{fmtRp(row.revenue)}</td>
                        <td className="py-2 px-2 text-right text-red-600">{fmtRp(row.cogs)}</td>
                        <td className="py-2 px-2 text-right">{fmtRp(row.gross)}</td>
                        <td className="py-2 px-2 text-right">{fmtRp(row.biayaOp)}</td>
                        <td className={`py-2 px-2 text-right font-medium ${isLoss ? "text-red-600" : ""}`}>
                          {fmtRp(row.labaKotor)}
                        </td>
                        <td className="py-2 px-2 text-right text-orange-600">{fmtRp(row.timFee)}</td>
                        <td className="py-2 px-2 text-right">{fmtRp(row.reserve)}</td>
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
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 px-2 text-right">{fmtRp(totalCFTIM)}</td>
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 px-2 text-right text-green-700">{fmtRp(totalCFInvestor)}</td>
                    <td className="py-2 px-2 text-right text-purple-700">{fmtRp(totalCFSWI)}</td>
                    <td className="py-2 px-2 text-right">{fmtRp(lastKumulatif)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Cashflow Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border border-green-200 rounded-xl bg-green-50 p-4">
              <div className="text-xs text-green-700 font-bold mb-1">Total Bagi Investor</div>
              <div className="text-2xl font-extrabold text-green-700">{fmtRp(totalCFInvestor)}</div>
              <div className="text-[10px] text-green-600 mt-1">15 bulan proyeksi</div>
            </div>
            <div className="border border-purple-200 rounded-xl bg-purple-50 p-4">
              <div className="text-xs text-purple-700 font-bold mb-1">Total Bagi SWI</div>
              <div className="text-2xl font-extrabold text-purple-700">{fmtRp(totalCFSWI)}</div>
              <div className="text-[10px] text-purple-600 mt-1">35% dari sisa 85%</div>
            </div>
            <div className="border border-orange-200 rounded-xl bg-orange-50 p-4">
              <div className="text-xs text-orange-700 font-bold mb-1">Total TIM Fee</div>
              <div className="text-2xl font-extrabold text-orange-700">{fmtRp(totalCFTIM)}</div>
              <div className="text-[10px] text-orange-600 mt-1">10% dari laba</div>
            </div>
            <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
              <div className="text-xs text-blue-700 font-bold mb-1">ROI Investor (15 bln)</div>
              <div className="text-2xl font-extrabold text-blue-700">
                {totalCFInvestor > 0 && totalInvestor > 0 ? ((totalCFInvestor / 50000000) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-[10px] text-blue-600 mt-1">dari modal Rp 50jt</div>
            </div>
          </div>

          {/* Return of Capital Progress */}
          <div className="border border-[var(--line)] rounded-xl bg-white p-5">
            <h3 className="font-bold text-sm text-[var(--ink)] mb-4">Progress Return of Capital (Investor Rp 50jt)</h3>
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all flex items-center justify-end pr-3"
                style={{ width: `${Math.min((lastKumulatif / 50000000) * 100, 100)}%` }}
              >
                {lastKumulatif / 50000000 * 100 > 15 && (
                  <span className="text-[10px] font-bold text-white">
                    {((lastKumulatif / 50000000) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              {lastKumulatif / 50000000 * 100 <= 15 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">
                  {((lastKumulatif / 50000000) * 100).toFixed(1)}% dari Rp 50jt
                </span>
              )}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[var(--muted)]">
              <span>Rp 0</span>
              <span>Target: Rp 50.000.000 (Return of Capital)</span>
              <span>Rp 50.000.000</span>
            </div>
          </div>
        </>
      )}

      {/* Catatan */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Catatan:</strong> RAB Skema A = mini-store owner-operated. Tanpa gaji karyawan — investor/SWI yang langsung mengelola untuk menghemat biaya di tahun pertama.</p>
            <p><strong>SWI In-Kind:</strong> Sistem POS (Rp 35jt), Training (Rp 3jt), Desain interior (Rp 5jt), Foto produk (Rp 3jt), Legal (Rp 5jt) — total ~Rp 50jt kontribusi non-tunai SWI.</p>
            <p><strong>Scaling:</strong> Jika profit bulan 3-6 stabil, bisa upgrade ke Skema B dengan menambah investor kedua/ketiga.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
