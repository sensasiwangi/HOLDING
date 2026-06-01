// src/components/RabPanel.tsx
// RAB Dashboard — Rencana Anggaran Biaya per divisi
"use client";

import { useState, useEffect } from "react";

interface RabItem {
  kode: string;
  kategori: string;
  item: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  total: number;
  sumberDana: string;
  pic: string;
  fase: string;
}

interface RabSummary {
  divisi: string;
  totalAnggaran: number;
  totalRealisasi: number;
  sisaAnggaran: number;
  progresPct: number;
  perFase: Record<string, { anggaran: number; realisasi: number }>;
  perKategori: Record<string, { anggaran: number; realisasi: number }>;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function RabPanel() {
  const [items, setItems] = useState<RabItem[]>([]);
  const [summary, setSummary] = useState<RabSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterFase, setFilterFase] = useState<string>("all");

  useEffect(() => {
    fetchRab();
  }, []);

  async function fetchRab() {
    try {
      const res = await fetch("/api/rab?divisi=Store");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setSummary(data.summary);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = filterFase === "all" ? items : items.filter((i) => i.fase === filterFase);

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-2 border-tosca border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-[var(--ink)]">RAB — Rencana Anggaran Biaya</h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">Tracking anggaran vs realisasi per divisi, fase, dan kategori</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Anggaran", value: fmt(summary.totalAnggaran), color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Realisasi", value: fmt(summary.totalRealisasi), color: "text-green-600", bg: "bg-green-50" },
            { label: "Sisa", value: fmt(summary.sisaAnggaran), color: summary.sisaAnggaran >= 0 ? "text-blue-600" : "text-red-500", bg: summary.sisaAnggaran >= 0 ? "bg-blue-50" : "bg-red-50" },
            { label: "Progres", value: `${summary.progresPct.toFixed(1)}%`, color: summary.progresPct >= 100 ? "text-red-500" : "text-emerald-600", bg: summary.progresPct >= 100 ? "bg-red-50" : "bg-emerald-50" },
          ].map((c) => (
            <div key={c.label} className={`border border-[var(--line)] rounded-xl p-4 ${c.bg}`}>
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className={`text-lg font-extrabold mt-1 ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Per Fase */}
      {summary?.perFase && (
        <div className="border border-[var(--line)] rounded-xl bg-white p-5">
          <h4 className="font-bold text-[var(--ink)] mb-3">Per Fase</h4>
          <div className="space-y-3">
            {Object.entries(summary.perFase).map(([fase, data]) => {
              const pct = data.anggaran > 0 ? (data.realisasi / data.anggaran) * 100 : 0;
              return (
                <div key={fase}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{fase.toUpperCase()}</span>
                    <span className="text-gray-600">{fmt(data.realisasi)} / {fmt(data.anggaran)} <span className="text-xs text-gray-400">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 100 ? "bg-red-500" : "bg-tosca"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "phase1", "phase2", "phase3"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterFase(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterFase === f ? "bg-tosca text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "Semua Fase" : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Detail Table */}
      <div className="border border-[var(--line)] rounded-xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="py-2 px-3 text-left">Kode</th>
                <th className="py-2 px-3 text-left">Kategori</th>
                <th className="py-2 px-3 text-left">Item</th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Harga</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-left">Sumber</th>
                <th className="py-2 px-3 text-left">Fase</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-xs">{item.kode}</td>
                  <td className="py-2 px-3">{item.kategori}</td>
                  <td className="py-2 px-3">{item.item}</td>
                  <td className="py-2 px-3 text-right">{item.qty} {item.satuan}</td>
                  <td className="py-2 px-3 text-right">{fmt(item.hargaSatuan)}</td>
                  <td className="py-2 px-3 text-right font-bold">{fmt(item.total)}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.sumberDana === "investor" ? "bg-blue-100 text-blue-700" :
                      item.sumberDana === "swi" ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {item.sumberDana}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs">{item.fase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
