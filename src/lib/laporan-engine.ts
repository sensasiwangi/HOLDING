// src/lib/laporan-engine.ts
// Laporan Engine — Laporan bulanan, cashflow, budget vs actual
import { readRange, writeRange, appendRows, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export interface LaporanBulanan {
  bulan: string;           // YYYY-MM
  divisi: string;
  pemasukan: number;
  pengeluaran: number;
  labaRugi: number;
  setoran30: number;
  sisaOperasional: number;
  kumulatifSaldo: number;
}

export interface CashflowEntry {
  tanggal: string;
  divisi: string;
  kategori: string;
  deskripsi: string;
  inflow: number;
  outflow: number;
  saldo: number;
  tipe: "operasional" | "investasi" | "pendanaan";
}

export interface BudgetVsActual {
  kategori: string;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
}

export interface LaporanSummary {
  periode: string;
  totalPemasukan: number;
  totalPengeluaran: number;
  labaRugi: number;
  perDivisi: Record<string, { pemasukan: number; pengeluaran: number; laba: number }>;
  cashflow: { operasional: number; investasi: number; pendanaan: number };
  budgetVsActual: BudgetVsActual[];
}

// ── Generate Laporan Bulanan ───────────────────────────────────────

export async function generateLaporanBulanan(bulan: string): Promise<LaporanBulanan[]> {
  // Baca data cash harian
  const data = await readRange("Cash_Harian!A1:I200");

  const divisiList = ["Holding", "Produksi", "Event", "Store", "Ecommerse"];
  const laporan: LaporanBulanan[] = [];

  // Filter data per bulan
  const monthData = data.filter((r) => r[0] && r[0].startsWith(bulan));

  let kumulatifSaldo = 0;

  for (const divisi of divisiList) {
    const divData = monthData.filter((r) => r[7] === divisi);
    const pemasukan = divData.reduce((s, r) => s + parseNum(r[4]), 0);
    const pengeluaran = divData.reduce((s, r) => s + parseNum(r[5]), 0);
    const labaRugi = pemasukan - pengeluaran;
    const setoran30 = Math.round(pemasukan * 0.3);
    const sisaOperasional = labaRugi - setoran30;
    kumulatifSaldo += sisaOperasional;

    laporan.push({
      bulan,
      divisi,
      pemasukan,
      pengeluaran,
      labaRugi,
      setoran30,
      sisaOperasional,
      kumulatifSaldo,
    });
  }

  return laporan;
}

// ── Generate Cashflow ──────────────────────────────────────────────

export async function generateCashflow(periode: string): Promise<CashflowEntry[]> {
  const data = await readRange("Cash_Harian!A1:I200");
  const entries: CashflowEntry[] = [];

  let saldo = 0;
  let lastMonth = "";

  for (const row of data) {
    if (!row[0]) continue;

    const tanggal = String(row[0]);
    const bulan = tanggal.slice(0, 7);

    if (periode !== "all" && !bulan.startsWith(periode)) continue;

    const inflow = parseNum(row[4]);
    const outflow = parseNum(row[5]);
    saldo += inflow - outflow;

    // Tentukan tipe cashflow
    const kategori = String(row[2] || "").toLowerCase();
    const tipe: "operasional" | "investasi" | "pendanaan" =
      kategori.includes("aset") || kategori.includes("beli") || kategori.includes("modal") ? "investasi" :
      kategori.includes("saham") || kategori.includes("sukuk") || kategori.includes("investor") ? "pendanaan" :
      "operasional";

    entries.push({
      tanggal,
      divisi: String(row[7] || "Holding"),
      kategori: String(row[2] || ""),
      deskripsi: String(row[3] || ""),
      inflow,
      outflow,
      saldo,
      tipe,
    });
  }

  return entries;
}

// ── Budget vs Actual ───────────────────────────────────────────────

export async function generateBudgetVsActual(bulan: string): Promise<BudgetVsActual[]> {
  // Baca budget dari Budget_vs_Actual sheet
  const budgetData = await readRange("Budget_vs_Actual!A1:R50");
  const actualData = await readRange("Cash_Harian!A1:I200");

  const budgetMap: Record<string, number> = {};
  const actualMap: Record<string, number> = {};

  // Parse budget (asumsi kolom: Kategori, Budget, ...)
  for (const row of budgetData.slice(1)) {
    if (!row[0]) continue;
    const kategori = String(row[0]).trim();
    const budget = parseNum(row[1]) || parseNum(row[2]) || 0;
    budgetMap[kategori] = budget;
  }

  // Parse actual dari cash harian
  const monthData = actualData.filter((r) => r[0] && r[0].startsWith(bulan));
  for (const row of monthData) {
    const kategori = String(row[2] || "Lainnya").trim();
    const outflow = parseNum(row[5]);
    actualMap[kategori] = (actualMap[kategori] || 0) + outflow;
  }

  // Gabungkan
  const allKeys = new Set([...Object.keys(budgetMap), ...Object.keys(actualMap)]);
  const result: BudgetVsActual[] = [];

  for (const kategori of allKeys) {
    const budget = budgetMap[kategori] || 0;
    const actual = actualMap[kategori] || 0;
    const variance = budget - actual;
    const variancePct = budget > 0 ? (variance / budget) * 100 : 0;

    result.push({ kategori, budget, actual, variance, variancePct });
  }

  return result.sort((a, b) => b.budget - a.budget);
}

// ── Summary Laporan ────────────────────────────────────────────────

export async function generateLaporanSummary(periode: string): Promise<LaporanSummary> {
  const [bulananData, cashflowData, bvaData] = await Promise.all([
    generateLaporanBulanan(periode),
    generateCashflow(periode),
    generateBudgetVsActual(periode),
  ]);

  const perDivisi: Record<string, { pemasukan: number; pengeluaran: number; laba: number }> = {};
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  for (const l of bulananData) {
    perDivisi[l.divisi] = { pemasukan: l.pemasukan, pengeluaran: l.pengeluaran, laba: l.labaRugi };
    totalPemasukan += l.pemasukan;
    totalPengeluaran += l.pengeluaran;
  }

  const cashflow = {
    operasional: cashflowData.filter((c) => c.tipe === "operasional").reduce((s, c) => s + c.inflow - c.outflow, 0),
    investasi: cashflowData.filter((c) => c.tipe === "investasi").reduce((s, c) => s + c.inflow - c.outflow, 0),
    pendanaan: cashflowData.filter((c) => c.tipe === "pendanaan").reduce((s, c) => s + c.inflow - c.outflow, 0),
  };

  return {
    periode,
    totalPemasukan,
    totalPengeluaran,
    labaRugi: totalPemasukan - totalPengeluaran,
    perDivisi,
    cashflow,
    budgetVsActual: bvaData,
  };
}

function parseNum(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
