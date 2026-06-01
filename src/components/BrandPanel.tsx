// src/components/BrandPanel.tsx
// Brand Dashboard — tampilkan data + formula per brand
"use client";

import { useEffect, useState } from "react";

interface BrandSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  labaRugi: number;
  margin: number;
  setoran30: number;
  sisaSetoran: number;
  jumlahTransaksi: number;
  avgTransaksi: number;
  pemasukanPerKategori: Record<string, number>;
  pengeluaranPerKategori: Record<string, number>;
}

interface BrandReport {
  brand: string;
  summary: BrandSummary;
  generatedAt: string;
}

const BRANDS = ["Produksi", "Event", "Store", "Ecommerse"];
const BRAND_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Produksi: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "🏭" },
  Event:    { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "🎪" },
  Store:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "🏪" },
  Ecommerse:{ bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "🌐" },
};

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function BrandPanel() {
  const [reports, setReports] = useState<BrandReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchBrandData();
  }, []);

  async function fetchBrandData() {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (data.brands) {
        setReports(data.brands.map((b: any) => ({
          brand: b.name,
          summary: b.summary,
          generatedAt: data.generatedAt,
        })));
      } else if (data.error) {
        setError(data.detail || data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculate() {
    setCalculating(true);
    try {
      const res = await fetch("/api/brands/calculate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchBrandData(); // refresh
      }
    } catch (e) {
      console.error(e);
    }
    setCalculating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-tosca border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <button onClick={fetchBrandData} className="px-4 py-2 bg-tosca text-white rounded-lg text-sm">
          Coba Lagi
        </button>
      </div>
    );
  }

  const activeReport = activeBrand ? reports.find((r) => r.brand === activeBrand) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Brand Dashboard</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Penjualan, modal, laba/rugi per brand — otomatis terhitung dari Google Sheets
          </p>
        </div>
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="flex items-center gap-2 px-4 py-2 bg-tosca text-white rounded-lg text-sm font-medium hover:bg-tosca/80 disabled:opacity-50 transition"
        >
          {calculating ? "Menghitung..." : "🔄 Hitung Ulang"}
        </button>
      </div>

      {/* Brand Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BRANDS.map((brand) => {
          const report = reports.find((r) => r.brand === brand);
          const s = report?.summary;
          const color = BRAND_COLORS[brand];
          const isActive = activeBrand === brand;

          return (
            <button
              key={brand}
              onClick={() => setActiveBrand(isActive ? null : brand)}
              className={`text-left border rounded-xl p-4 transition-all ${
                isActive ? `${color.bg} ${color.border} shadow-lg` : "border-[var(--line)] bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{color.icon}</span>
                <span className={`font-bold text-sm ${isActive ? color.text : "text-[var(--ink)]"}`}>
                  {brand}
                </span>
              </div>

              {s ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Pemasukan</span>
                    <span className="font-bold text-green-600">{fmt(s.totalPemasukan)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Pengeluaran</span>
                    <span className="font-bold text-red-500">{fmt(s.totalPengeluaran)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[var(--line)]">
                    <span className="text-[var(--muted)]">Laba/Rugi</span>
                    <span className={`font-bold ${s.labaRugi >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {fmt(s.labaRugi)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Margin</span>
                    <span className={`font-bold ${s.margin >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {s.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Setoran 30%</span>
                    <span className="font-bold text-blue-600">{fmt(s.setoran30)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--muted)]">Klik untuk lihat detail</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {activeReport && (
        <div className={`border rounded-xl p-6 ${BRAND_COLORS[activeReport.brand].bg} ${BRAND_COLORS[activeReport.brand].border}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{BRAND_COLORS[activeReport.brand].icon}</span>
            <h3 className={`text-lg font-extrabold ${BRAND_COLORS[activeReport.brand].text}`}>
              {activeReport.brand} — Detail
            </h3>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Pemasukan", value: activeReport.summary.totalPemasukan, color: "text-green-600" },
              { label: "Total Pengeluaran", value: activeReport.summary.totalPengeluaran, color: "text-red-500" },
              { label: "Laba/Rugi", value: activeReport.summary.labaRugi, color: activeReport.summary.labaRugi >= 0 ? "text-green-600" : "text-red-500" },
              { label: "Margin", value: `${activeReport.summary.margin.toFixed(1)}%`, color: activeReport.summary.margin >= 0 ? "text-green-600" : "text-red-500" },
              { label: "Setoran 30%", value: activeReport.summary.setoran30, color: "text-blue-600" },
              { label: "Sisa Setoran", value: activeReport.summary.sisaSetoran, color: activeReport.summary.sisaSetoran >= 0 ? "text-green-600" : "text-red-500" },
              { label: "Jumlah Transaksi", value: activeReport.summary.jumlahTransaksi, color: "text-gray-700" },
              { label: "Avg Transaksi", value: Math.round(activeReport.summary.avgTransaksi), color: "text-gray-700" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg p-3 border border-white/50">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className={`text-lg font-extrabold mt-1 ${item.color}`}>
                  {typeof item.value === "number" ? fmt(item.value) : item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown per kategori */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pemasukan */}
            {Object.keys(activeReport.summary.pemasukanPerKategori).length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-white/50">
                <h4 className="font-bold text-sm text-green-700 mb-3">📈 Pemasukan per Kategori</h4>
                <div className="space-y-2">
                  {Object.entries(activeReport.summary.pemasukanPerKategori)
                    .sort((a, b) => b[1] - a[1])
                    .map(([kategori, jumlah]) => {
                      const pct = activeReport.summary.totalPemasukan > 0
                        ? (jumlah / activeReport.summary.totalPemasukan) * 100
                        : 0;
                      return (
                        <div key={kategori}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{kategori}</span>
                            <span className="font-bold text-green-600">{fmt(jumlah)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Pengeluaran */}
            {Object.keys(activeReport.summary.pengeluaranPerKategori).length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-white/50">
                <h4 className="font-bold text-sm text-red-600 mb-3">📉 Pengeluaran per Kategori</h4>
                <div className="space-y-2">
                  {Object.entries(activeReport.summary.pengeluaranPerKategori)
                    .sort((a, b) => b[1] - a[1])
                    .map(([kategori, jumlah]) => {
                      const pct = activeReport.summary.totalPengeluaran > 0
                        ? (jumlah / activeReport.summary.totalPengeluaran) * 100
                        : 0;
                      return (
                        <div key={kategori}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{kategori}</span>
                            <span className="font-bold text-red-500">{fmt(jumlah)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400 mt-4 text-center">
            Terakhir dihitung: {new Date(activeReport.generatedAt).toLocaleString("id-ID")}
          </div>
        </div>
      )}
    </div>
  );
}
