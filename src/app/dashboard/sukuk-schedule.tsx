"use client";

import { useState } from "react";
import {
  CalendarCheck, TrendingUp, HandCoins,
  ChevronDown, ChevronUp, CheckCircle, Clock,
  AlertTriangle,
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

interface PaymentRow {
  periode: string;
  kuartal: string;
  tahun: string;
  revenue: number;
  biayaOp: number;
  labaKotor: number;
  biayaLain: number;
  labaBersih: number;
  bagiInvestor: number;
  bagiSWI: number;
  kumulatif: number;
  status: string;
}

export default function SukukPaymentSchedulePanel({
  paymentSchedule,
}: {
  paymentSchedule?: string[][] | null;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Parse data
  const rows: PaymentRow[] = [];
  let totalBagiInvestor = 0;
  let totalBagiSWI = 0;
  let totalLabaBersih = 0;
  let maxKumulatif = 0;

  if (paymentSchedule) {
    for (let i = 1; i < paymentSchedule.length; i++) {
      const r = paymentSchedule[i];
      if (!r[0]) continue;
      const row: PaymentRow = {
        periode: r[0] || "",
        kuartal: r[1] || "",
        tahun: r[2] || "",
        revenue: safeNum(r[3]),
        biayaOp: safeNum(r[4]),
        labaKotor: safeNum(r[5]),
        biayaLain: safeNum(r[6]),
        labaBersih: safeNum(r[7]),
        bagiInvestor: safeNum(r[8]),
        bagiSWI: safeNum(r[9]),
        kumulatif: safeNum(r[10]),
        status: r[11] || "Proyeksi",
      };
      totalBagiInvestor += row.bagiInvestor;
      totalBagiSWI += row.bagiSWI;
      totalLabaBersih += row.labaBersih;
      if (row.kumulatif > maxKumulatif) maxKumulatif = row.kumulatif;
      rows.push(row);
    }
  }

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Group by year
  const byYear: Record<string, PaymentRow[]> = {};
  for (const row of rows) {
    if (!byYear[row.tahun]) byYear[row.tahun] = [];
    byYear[row.tahun].push(row);
  }

  const nilaSukuk = 1_000_000_000;
  const avgQuarterlyYield = rows.length > 0 ? (totalBagiInvestor / rows.length / nilaSukuk * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">
          📅 Jadwal Pembayaran Sukuk Musyarakah
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          16 kuartal pembagian hasil — Jul 2026 s/d Jun 2030 (4 tahun tenor)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-green-50 mb-2">
            <HandCoins size={18} className="text-green-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Total Bagi Hasil Investor</div>
          <div className="text-lg font-extrabold text-green-600 mt-1">
            {fmtRp(totalBagiInvestor)}
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">16 kuartal</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2">
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Total Bagi Hasil SWI</div>
          <div className="text-lg font-extrabold text-blue-600 mt-1">
            {fmtRp(totalBagiSWI)}
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">50% nisbah</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-purple-50 mb-2">
            <CalendarCheck size={18} className="text-purple-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Rata-rata per Kuartal</div>
          <div className="text-lg font-extrabold text-purple-600 mt-1">
            {fmtRp(totalBagiInvestor / (rows.length || 1))}
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">bagi investor</div>
        </div>
        <div className="border border-[var(--line)] rounded-xl bg-white p-4">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 mb-2">
            <CheckCircle size={18} className="text-orange-600" />
          </div>
          <div className="text-xs text-[var(--muted)]">Estimasi Yield</div>
          <div className="text-lg font-extrabold text-orange-600 mt-1">
            {(avgQuarterlyYield * 4).toFixed(1)}% <span className="text-xs font-normal">p.a.</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">annualized</div>
        </div>
      </div>

      {/* Cumulative Progress */}
      <div className="border border-[var(--line)] rounded-xl bg-white p-5">
        <h3 className="font-bold text-sm text-[var(--ink)] mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--brand)]" />
          Progresif Kumulatif Bagi Hasil Investor
        </h3>
        <div className="relative h-40 flex items-end gap-1">
          {rows.map((row, i) => {
            const pct = maxKumulatif > 0 ? (row.kumulatif / maxKumulatif) * 100 : 0;
            const totalPct = nilaSukuk > 0 ? (row.kumulatif / nilaSukuk) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <div className="font-bold">{row.kuartal} {row.tahun}</div>
                    <div>Kumulatif: {fmtRp(row.kumulatif)}</div>
                    <div>of Rp 1M ({totalPct.toFixed(1)}%)</div>
                  </div>
                </div>
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 transition-all cursor-pointer min-h-[2px]"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
                <div className="text-[7px] text-[var(--muted)] mt-1 rotate-[-45deg] origin-top-left whitespace-nowrap">
                  {row.kuartal}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-[10px] text-[var(--muted)] border-t border-[var(--line)] pt-2">
          <span>Q3 2026</span>
          <span>Target: Rp 1 Miliar (Return of Capital)</span>
          <span>Q2 2030</span>
        </div>
      </div>

      {/* Schedule Table - Grouped by Year */}
      {Object.entries(byYear).map(([year, yearRows]) => (
        <div key={year} className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
          {/* Year Header */}
          <div className="bg-[var(--soft)] px-5 py-3 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--ink)] flex items-center gap-2">
              <CalendarCheck size={14} className="text-[var(--brand)]" />
              Tahun {year}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[var(--muted)]">
                Total kuartal: {yearRows.length}
              </span>
              <span className="font-bold text-green-600">
                {fmtRp(yearRows.reduce((a, r) => a + r.bagiInvestor, 0))} bagi investor
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 px-4 text-left">Kuartal</th>
                  <th className="py-2 px-4 text-right">Laba Bersih</th>
                  <th className="py-2 px-4 text-right">Bagi Investor</th>
                  <th className="py-2 px-4 text-right">Bagi SWI</th>
                  <th className="py-2 px-4 text-right">Kumulatif</th>
                  <th className="py-2 px-4 text-center">Status</th>
                  <th className="py-2 px-4 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {yearRows.map((row, i) => {
                  const globalIdx = rows.indexOf(row);
                  const isExpanded = expandedRows.has(globalIdx);
                  const kumulatifPct = nilaSukuk > 0 ? (row.kumulatif / nilaSukuk) * 100 : 0;

                  return (
                    <>
                      <tr
                        key={`row-${globalIdx}`}
                        className="border-b border-[var(--line)] hover:bg-[var(--soft)] transition cursor-pointer"
                        onClick={() => toggleRow(globalIdx)}
                      >
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-xs">{row.kuartal} {row.tahun}</div>
                          <div className="text-[10px] text-[var(--muted)]">{row.periode}</div>
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium">{fmtRp(row.labaBersih)}</td>
                        <td className="py-2.5 px-4 text-right text-green-700 font-bold">{fmtRp(row.bagiInvestor)}</td>
                        <td className="py-2.5 px-4 text-right text-blue-700 font-bold">{fmtRp(row.bagiSWI)}</td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="font-bold text-xs">{fmtRp(row.kumulatif)}</div>
                          <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${Math.min(kumulatifPct, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.status === "Aktif" || row.status === "Proyeksi"
                              ? "bg-blue-100 text-blue-700"
                              : row.status === "Dibayar"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                          }`}>
                            {row.status === "Dibayar" ? <CheckCircle size={9} /> : <Clock size={9} />}
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isExpanded ? <ChevronUp size={14} className="text-[var(--muted)]" /> : <ChevronDown size={14} className="text-[var(--muted)]" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`detail-${globalIdx}`} className="border-b border-[var(--line)] bg-[var(--soft)]">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-[var(--muted)]">Revenue</span>
                                <div className="font-bold">{fmtRp(row.revenue)}</div>
                              </div>
                              <div>
                                <span className="text-[var(--muted)]">Biaya Operasional</span>
                                <div className="font-bold text-red-600">{fmtRp(row.biayaOp)}</div>
                              </div>
                              <div>
                                <span className="text-[var(--muted)]">Laba Kotor</span>
                                <div className="font-bold">{fmtRp(row.labaKotor)}</div>
                              </div>
                              <div>
                                <span className="text-[var(--muted)]">Biaya Lain</span>
                                <div className="font-bold text-red-600">{fmtRp(row.biayaLain)}</div>
                              </div>
                              <div className="col-span-2 md:col-span-4 pt-2 border-t border-[var(--line)] mt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[var(--muted)] text-[10px]">Kembalian Pokok:</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                      style={{ width: `${Math.min(kumulatifPct, 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-green-700 text-[10px]">{kumulatifPct.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Catatan */}
      <div className="border border-orange-200 rounded-xl bg-orange-50 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-600 mt-0.5 shrink-0" />
          <div className="text-xs text-orange-800 space-y-1">
            <p><strong>Disclaimer:</strong> Jadwal pembayaran di atas merupakan proyeksi berbasis kinerja Store. Aktual pembagian hasil dapat berbeda.</p>
            <p><strong>Nisbah 50:50</strong> — Setiap kuartal, laba bersih dibagi rata antara investor (kolektif) dan SWI Holding sebagai mudharib.</p>
            <p><strong>Return of Capital:</strong> Kumulatif bagi hasil investor dihitung dari Rp 0. Saat kumulatif mencapai Rp 1 Miliar, pokok investasi telah kembali.</p>
            <p><strong>Total 16 kuartal</strong> (4 tahun) — Musyarakah Sukuk Store tenor 4 tahun terhitung Q3 2026.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
