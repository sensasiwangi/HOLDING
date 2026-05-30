"use client";

import { useEffect, useState } from "react";
import {
  DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight,
  Building2, Calendar, ShoppingBag, Store, Globe, FileSpreadsheet, PenLine,
} from "lucide-react";
import TransactionForm from "@/components/TransactionForm";

interface FinanceData {
  spreadsheetId: string;
  spreadsheetUrl: string;
  dashboard: string[][] | null;
  rekapSetoran: string[][] | null;
  holding: string[][] | null;
  rekeningKoran: string[][] | null;
  coa: string[][] | null;
  fetchedAt: string;
}

interface COAItem {
  code: string;
  name: string;
  type: string;
  category: string;
}

const DIVISIS = [
  { key: "Produksi", icon: <Building2 size={16} />, color: "blue" },
  { key: "Event", icon: <Calendar size={16} />, color: "purple" },
  { key: "Store", icon: <Store size={16} />, color: "green" },
  { key: "Ecommerse", icon: <Globe size={16} />, color: "orange" },
];

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function safeNum(v: string | undefined): number {
  if (!v) return 0;
  const cleaned = v.replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseCOA(coaData: string[][] | null): COAItem[] {
  if (!coaData) return [];
  const items: COAItem[] = [];
  // Skip header row (row 0), data starts at row 1
  for (let i = 1; i < coaData.length; i++) {
    const row = coaData[i];
    if (row[0] && row[1]) {
      items.push({
        code: row[0],
        name: row[1],
        type: row[2] || "",
        category: row[3] || "",
      });
    }
  }
  return items;
}

export default function FinancePanel() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subTab, setSubTab] = useState<"ringkasan" | "input">("ringkasan");

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.detail || d.error);
        else setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--risk)] text-sm mb-3">
          {error || "Gagal memuat data keuangan"}
        </p>
        <a
          href={`https://docs.google.com/spreadsheets/d/${data?.spreadsheetId || ""}/edit`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm font-bold hover:bg-[var(--brand-2)] transition"
        >
          <FileSpreadsheet size={14} /> Buka Google Sheets
        </a>
      </div>
    );
  }

  const coa = parseCOA(data.coa);

  // Parse dashboard data
  const rows = data.dashboard || [];
  let tableRows: string[][] = [];
  let headerRow: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] === "Divisi" || row[0] === "TOTAL") {
      if (row[0] === "Divisi") headerRow = row;
      else tableRows.push(row);
    } else if (row[0] && DIVISIS.some((d) => d.key === row[0])) {
      tableRows.push(row);
    }
  }

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let totalSetoran = 0;
  tableRows.forEach((r) => {
    totalPemasukan += safeNum(r[1]);
    totalPengeluaran += safeNum(r[2]);
    totalSetoran += safeNum(r[4]);
  });

  const totalRow = tableRows.find((r) => r[0] === "TOTAL");
  if (totalRow) {
    totalPemasukan = safeNum(totalRow[1]) || totalPemasukan;
    totalPengeluaran = safeNum(totalRow[2]) || totalPengeluaran;
    totalSetoran = safeNum(totalRow[4]) || totalSetoran;
  }

  const totalLabaRugi = totalPemasukan - totalPengeluaran;
  const sisaSetoran = totalLabaRugi - totalSetoran;

  // Parse rekening koran
  const rekeningRows = data.rekeningKoran || [];

  return (
    <div className="space-y-4">
      {/* Sub Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab("ringkasan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            subTab === "ringkasan"
              ? "bg-tosca text-white shadow-lg shadow-tosca/25"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <DollarSign size={14} /> Ringkasan
        </button>
        <button
          onClick={() => setSubTab("input")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            subTab === "input"
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <PenLine size={14} /> Input Transaksi
        </button>
      </div>

      {/* Sub Tab: Input Transaksi */}
      {subTab === "input" && (
        <div className="space-y-4">
          {/* Rekening Koran Quick View */}
          {rekeningRows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rekeningRows.map((rk, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">{rk[1] || rk[0]}</div>
                  <div className="text-lg font-bold text-white">{rk[2] || "—"}</div>
                  <div className="text-xs text-gray-500 mt-1">{rk[0]}</div>
                </div>
              ))}
            </div>
          )}

          <TransactionForm coa={coa} />
        </div>
      )}

      {/* Sub Tab: Ringkasan */}
      {subTab === "ringkasan" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--ink)]">
                Ringkasan Keuangan
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Data dari Google Sheets —{" "}
                {data.fetchedAt
                  ? new Date(data.fetchedAt).toLocaleString("id-ID")
                  : "baru saja"}
              </p>
            </div>
            <a
              href={data.spreadsheetUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--line)] text-xs font-bold hover:border-[var(--brand)] transition"
            >
              <FileSpreadsheet size={14} /> Google Sheets
            </a>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Pemasukan", value: totalPemasukan, icon: <ArrowUpRight size={18} />, color: "text-green-600", bg: "bg-green-50" },
              { label: "Total Pengeluaran", value: totalPengeluaran, icon: <ArrowDownRight size={18} />, color: "text-red-500", bg: "bg-red-50" },
              { label: "Laba/Rugi", value: totalLabaRugi, icon: <DollarSign size={18} />, color: totalLabaRugi >= 0 ? "text-green-600" : "text-red-500", bg: totalLabaRugi >= 0 ? "bg-green-50" : "bg-red-50" },
              { label: "Setoran 30%", value: totalSetoran, icon: <TrendingDown size={18} />, color: "text-[var(--brand)]", bg: "bg-blue-50" },
            ].map((c) => (
              <div key={c.label} className="border border-[var(--line)] rounded-xl bg-white p-4">
                <div className={`inline-flex p-2 rounded-lg ${c.bg} mb-3`}>
                  <span className={c.color}>{c.icon}</span>
                </div>
                <div className="text-xs text-[var(--muted)]">{c.label}</div>
                <div className={`text-lg font-extrabold mt-1 ${c.color}`}>{fmt(c.value)}</div>
              </div>
            ))}
          </div>

          {/* Sisa Setoran */}
          <div className="border border-[var(--line)] rounded-xl bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--muted)]">Sisa Setelah Setoran 30%</div>
                <div className={`text-2xl font-extrabold mt-1 ${sisaSetoran >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {fmt(sisaSetoran)}
                </div>
              </div>
              <div className="text-right text-xs text-[var(--muted)]">
                {totalPemasukan > 0
                  ? `Rasio setoran: ${((totalSetoran / totalPemasukan) * 100).toFixed(1)}%`
                  : "Belum ada data"}
              </div>
            </div>
          </div>

          {/* Rekening Koran */}
          {rekeningRows.length > 0 && (
            <div className="border border-[var(--line)] rounded-xl bg-white p-5">
              <h3 className="font-bold text-[var(--ink)] mb-3">Rekening Koran</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rekeningRows.map((rk, i) => (
                  <div key={i} className="flex items-center justify-between bg-[var(--soft)] rounded-lg p-3">
                    <div>
                      <div className="text-xs text-[var(--muted)]">{rk[1]}</div>
                      <div className="text-xs font-mono text-gray-400">{rk[0]}</div>
                    </div>
                    <div className="text-lg font-extrabold text-[var(--ink)]">
                      {fmt(safeNum(rk[2]))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per Divisi Breakdown */}
          <div className="border border-[var(--line)] rounded-xl bg-white p-5">
            <h3 className="font-bold text-[var(--ink)] mb-4">Rekap Per Divisi</h3>
            {tableRows.filter((r) => r[0] !== "TOTAL").length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={32} className="mx-auto text-[var(--muted)] mb-2" />
                <p className="text-sm text-[var(--muted)]">Belum ada data transaksi</p>
                <p className="text-xs text-[var(--muted)] mt-1">Gunakan tab &quot;Input Transaksi&quot; untuk mencatat transaksi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                      <th className="py-2 px-3 text-left">Divisi</th>
                      <th className="py-2 px-3 text-right">Pemasukan</th>
                      <th className="py-2 px-3 text-right">Pengeluaran</th>
                      <th className="py-2 px-3 text-right">Laba/Rugi</th>
                      <th className="py-2 px-3 text-right">Setoran 30%</th>
                      <th className="py-2 px-3 text-right">Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows
                      .filter((r) => r[0] !== "TOTAL")
                      .map((row, i) => {
                        const income = safeNum(row[1]);
                        const expense = safeNum(row[2]);
                        const profit = safeNum(row[3]) || income - expense;
                        const setoran = safeNum(row[4]);
                        const sisa = safeNum(row[5]) || profit - setoran;
                        return (
                          <tr key={i} className="border-b border-[var(--line)]">
                            <td className="py-2.5 px-3 font-medium">{row[0]}</td>
                            <td className="py-2.5 px-3 text-right text-green-700">{fmt(income)}</td>
                            <td className="py-2.5 px-3 text-right text-red-600">{fmt(expense)}</td>
                            <td className={`py-2.5 px-3 text-right font-medium ${profit >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(profit)}</td>
                            <td className="py-2.5 px-3 text-right text-blue-700">{fmt(setoran)}</td>
                            <td className={`py-2.5 px-3 text-right font-medium ${sisa >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(sisa)}</td>
                          </tr>
                        );
                      })}
                    {totalRow && (
                      <tr className="bg-[var(--soft)] font-bold">
                        <td className="py-2.5 px-3">{totalRow[0]}</td>
                        <td className="py-2.5 px-3 text-right text-green-700">{fmt(safeNum(totalRow[1]))}</td>
                        <td className="py-2.5 px-3 text-right text-red-600">{fmt(safeNum(totalRow[2]))}</td>
                        <td className={`py-2.5 px-3 text-right ${safeNum(totalRow[3]) >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(safeNum(totalRow[3]))}</td>
                        <td className="py-2.5 px-3 text-right text-blue-700">{fmt(safeNum(totalRow[4]))}</td>
                        <td className={`py-2.5 px-3 text-right ${safeNum(totalRow[5]) >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(safeNum(totalRow[5]))}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Divisi Quick View Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {DIVISIS.map((d) => {
                const row = tableRows.find((r) => r[0] === d.key);
                const income = safeNum(row?.[1]);
                const expense = safeNum(row?.[2]);
                const profit = safeNum(row?.[3]) || income - expense;
                return (
                  <div key={d.key} className="border border-[var(--line)] rounded-lg p-3 bg-[var(--soft)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[var(--brand)]">{d.icon}</span>
                      <span className="font-bold text-sm">{d.key}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">Pemasukan</span>
                      <span className="font-bold text-green-700">{fmt(income)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-[var(--muted)]">Pengeluaran</span>
                      <span className="font-bold text-red-600">{fmt(expense)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1 pt-1 border-t border-[var(--line)]">
                      <span className="text-[var(--muted)]">Laba/Rugi</span>
                      <span className={`font-bold ${profit >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(profit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rekap Setoran 30% per Bulan */}
          <div className="border border-[var(--line)] rounded-xl bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--ink)]">Rekap Setoran 30% per Bulan</h3>
              <span className="text-xs text-[var(--muted)]">12 Bulan Terakhir</span>
            </div>
            {data.rekapSetoran && data.rekapSetoran.length > 1 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--soft)] text-xs text-[var(--muted)]">
                      <th className="py-2 px-3 text-left">Bulan</th>
                      <th className="py-2 px-3 text-right">Produksi</th>
                      <th className="py-2 px-3 text-right">Event</th>
                      <th className="py-2 px-3 text-right">Store</th>
                      <th className="py-2 px-3 text-right">Ecommerse</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rekapSetoran.slice(1, 14).map((row, i) => (
                      <tr key={i} className="border-b border-[var(--line)]">
                        <td className="py-2 px-3 font-medium text-xs">{row[0] || ""}</td>
                        <td className="py-2 px-3 text-right text-xs">{fmt(safeNum(row[1]))}</td>
                        <td className="py-2 px-3 text-right text-xs">{fmt(safeNum(row[2]))}</td>
                        <td className="py-2 px-3 text-right text-xs">{fmt(safeNum(row[3]))}</td>
                        <td className="py-2 px-3 text-right text-xs">{fmt(safeNum(row[4]))}</td>
                        <td className="py-2 px-3 text-right text-xs font-bold">{fmt(safeNum(row[5]))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--muted)]">Belum ada data setoran bulanan</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-[var(--muted)] py-4">
            <p>Data otomatis tersinkronisasi dari Google Sheets. Angka laba/rugi = pemasukan − pengeluaran tiap divisi. Setoran = 30% × pemasukan tiap divisi.</p>
            <p className="mt-1">
              Terakhir diperbarui: {data.fetchedAt ? new Date(data.fetchedAt).toLocaleString("id-ID") : "—"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
