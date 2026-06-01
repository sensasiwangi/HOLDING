// src/components/LaporanPanel.tsx
// Laporan Dashboard — Laporan bulanan, cashflow, budget vs actual
"use client";

import { useState, useEffect } from "react";

interface LaporanSummary {
  periode: string;
  totalPemasukan: number;
  totalPengeluaran: number;
  labaRugi: number;
  perDivisi: Record<string, { pemasukan: number; pengeluaran: number; laba: number }>;
  cashflow: { operasional: number; investasi: number; pendanaan: number };
  budgetVsActual: Array<{ kategori: string; budget: number; actual: number; variance: number; variancePct: number }>;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function LaporanPanel() {
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<LaporanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"ringkasan" | "cashflow" | "bva">("ringkasan");

  useEffect(() => {
    fetchLaporan();
  }, [periode]);

  async function fetchLaporan() {
    setLoading(true);
    try {
      const res = await fetch(`/api/laporan?periode=${periode}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-2 border-tosca border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Laporan Keuangan</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Laporan bulanan, cashflow, budget vs actual</p>
        </div>
        <input
          type="month"
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tosca focus:outline-none"
        />
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2">
        {[
          { key: "ringkasan", label: "Ringkasan" },
          { key: "cashflow", label: "Cashflow" },
          { key: "bva", label: "Budget vs Actual" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              subTab === t.key ? "bg-tosca text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!data ? (
        <div className="text-center py-12 text-gray-400">Tidak ada data untuk periode {periode}</div>
      ) : subTab === "ringkasan" ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Pemasukan", value: fmt(data.totalPemasukan), color: "text-green-600", bg: "bg-green-50" },
              { label: "Pengeluaran", value: fmt(data.totalPengeluaran), color: "text-red-500", bg: "bg-red-50" },
              { label: "Laba/Rugi", value: fmt(data.labaRugi), color: data.labaRugi >= 0 ? "text-green-600" : "text-red-500", bg: data.labaRugi >= 0 ? "bg-green-50" : "bg-red-50" },
              { label: "Margin", value: data.totalPemasukan > 0 ? `${((data.labaRugi / data.totalPemasukan) * 100).toFixed(1)}%` : "0%", color: "text-blue-600", bg: "bg-blue-50" },
            ].map((c) => (
              <div key={c.label} className={`border border-[var(--line)] rounded-xl p-4 ${c.bg}`}>
                <div className="text-xs text-gray-500">{c.label}</div>
                <div className={`text-lg font-extrabold mt-1 ${c.color}`}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Per Divisi */}
          <div className="border border-[var(--line)] rounded-xl bg-white p-5">
            <h4 className="font-bold text-[var(--ink)] mb-3">Per Divisi</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500">
                    <th className="py-2 px-3 text-left">Divisi</th>
                    <th className="py-2 px-3 text-right">Pemasukan</th>
                    <th className="py-2 px-3 text-right">Pengeluaran</th>
                    <th className="py-2 px-3 text-right">Laba/Rugi</th>
                    <th className="py-2 px-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.perDivisi).map(([div, d]) => (
                    <tr key={div} className="border-t border-gray-100">
                      <td className="py-2 px-3 font-medium">{div}</td>
                      <td className="py-2 px-3 text-right text-green-600">{fmt(d.pemasukan)}</td>
                      <td className="py-2 px-3 text-right text-red-500">{fmt(d.pengeluaran)}</td>
                      <td className={`py-2 px-3 text-right font-bold ${d.laba >= 0 ? "text-green-600" : "text-red-500"}`}>{fmt(d.laba)}</td>
                      <td className="py-2 px-3 text-right text-xs">{d.pemasukan > 0 ? `${((d.laba / d.pemasukan) * 100).toFixed(1)}%` : "0%"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : subTab === "cashflow" ? (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h4 className="font-bold text-[var(--ink)] mb-3">Cashflow</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Operasional", value: data.cashflow.operasional, color: "text-blue-600" },
              { label: "Investasi", value: data.cashflow.investasi, color: "text-purple-600" },
              { label: "Pendanaan", value: data.cashflow.pendanaan, color: "text-emerald-600" },
            ].map((c) => (
              <div key={c.label} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">{c.label}</div>
                <div className={`text-lg font-extrabold mt-1 ${c.color}`}>{fmt(c.value)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h4 className="font-bold text-[var(--ink)] mb-3">Budget vs Actual</h4>
          <div className="space-y-3">
            {data.budgetVsActual.map((bva, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{bva.kategori}</span>
                  <span className={`font-bold ${bva.variance >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {fmt(bva.actual)} / {fmt(bva.budget)} ({bva.variancePct >= 0 ? "+" : ""}{bva.variancePct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bva.actual > bva.budget ? "bg-red-500" : "bg-tosca"}`} style={{ width: `${Math.min(Math.abs(bva.variancePct), 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
