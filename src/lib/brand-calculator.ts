// src/lib/brand-calculator.ts
// Brand Calculator — Formula engine untuk setiap brand/divisi
// Hitung: total pemasukan, pengeluaran, laba/rugi, margin, setoran, dll
import { readRange, writeRange, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export interface BrandTransactions {
  pemasukan: TransactionRow[];
  pengeluaran: TransactionRow[];
}

export interface TransactionRow {
  no: string;
  tanggal: string;
  tipe: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  info: string;
  referensi: string;
  rowNumber: number; // baris di sheet (1-indexed)
}

export interface BrandSummary {
  // Revenue
  totalPemasukan: number;
  totalPengeluaran: number;
  labaRugi: number;
  margin: number; // %

  // Breakdown per kategori
  pemasukanPerKategori: Record<string, number>;
  pengeluaranPerKategori: Record<string, number>;

  // Setoran 30%
  setoran30: number;
  sisaSetoran: number;

  // Metrics
  avgTransaksi: number;
  maxPemasukan: number;
  maxPengeluaran: number;
  jumlahTransaksi: number;
}

export interface BrandReport {
  brand: string;
  summary: BrandSummary;
  transactions: BrandTransactions;
  generatedAt: string;
}

// ── Parse sheet data ───────────────────────────────────────────────

/** Parse sheet brand — baca semua transaksi pemasukan & pengeluaran */
export async function parseBrandSheet(brandName: string): Promise<BrandTransactions> {
  // Baca seluruh data sheet (A1:Z100 cukup untuk semua brand)
  const data = await readRange(`${brandName}!A1:Z100`);

  const pemasukan: TransactionRow[] = [];
  const pengeluaran: TransactionRow[] = [];

  let section: "header" | "pemasukan" | "pengeluaran" | "unknown" = "header";

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1; // 1-indexed

    // Deteksi section
    if (row[2] && String(row[2]).trim().toUpperCase() === "PEMASUKAN") {
      section = "pemasukan";
      continue;
    }
    if (row[2] && String(row[2]).trim().toUpperCase() === "PENGELUARAN") {
      section = "pengeluaran";
      continue;
    }

    // Skip header row dan baris kosong
    if (section === "header" || !row[0]) continue;

    // Parse row — pastikan ada cukup kolom
    if (row.length < 6) continue;

    const tx: TransactionRow = {
      no: String(row[0] || "").trim(),
      tanggal: String(row[1] || "").trim(),
      tipe: String(row[2] || "").trim(),
      kategori: String(row[3] || "").trim(),
      deskripsi: String(row[4] || "").trim(),
      jumlah: parseJumlah(row[5]),
      info: String(row[6] || "").trim(),
      referensi: String(row[7] || "").trim(),
      rowNumber,
    };

    // Skip baris yang nomornya kosong atau bukan angka
    if (!tx.no || isNaN(parseInt(tx.no))) continue;

    if (section === "pemasukan") {
      pemasukan.push(tx);
    } else if (section === "pengeluaran") {
      pengeluaran.push(tx);
    }
  }

  return { pemasukan, pengeluaran };
}

/** Parse jumlah dari format Rp atau angka */
function parseJumlah(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ── Calculate formulas ─────────────────────────────────────────────

/** Hitung summary/brand metrics */
export function calculateBrandSummary(transactions: BrandTransactions): BrandSummary {
  const { pemasukan, pengeluaran } = transactions;

  // Total
  const totalPemasukan = pemasukan.reduce((s, t) => s + t.jumlah, 0);
  const totalPengeluaran = pengeluaran.reduce((s, t) => s + t.jumlah, 0);
  const labaRugi = totalPemasukan - totalPengeluaran;

  // Margin
  const margin = totalPemasukan > 0 ? (labaRugi / totalPemasukan) * 100 : 0;

  // Per kategori
  const pemasukanPerKategori: Record<string, number> = {};
  const pengeluaranPerKategori: Record<string, number> = {};

  pemasukan.forEach((t) => {
    const key = t.kategori || "Lainnya";
    pemasukanPerKategori[key] = (pemasukanPerKategori[key] || 0) + t.jumlah;
  });

  pengeluaran.forEach((t) => {
    const key = t.kategori || "Lainnya";
    pengeluaranPerKategori[key] = (pengeluaranPerKategori[key] || 0) + t.jumlah;
  });

  // Setoran 30%
  const setoran30 = Math.round(totalPemasukan * 0.3);
  const sisaSetoran = labaRugi - setoran30;

  // Metrics
  const allTx = [...pemasukan, ...pengeluaran];
  const avgTransaksi = allTx.length > 0
    ? allTx.reduce((s, t) => s + t.jumlah, 0) / allTx.length
    : 0;
  const maxPemasukan = pemasukan.length > 0
    ? Math.max(...pemasukan.map((t) => t.jumlah))
    : 0;
  const maxPengeluaran = pengeluaran.length > 0
    ? Math.max(...pengeluaran.map((t) => t.jumlah))
    : 0;

  return {
    totalPemasukan,
    totalPengeluaran,
    labaRugi,
    margin,
    pemasukanPerKategori,
    pengeluaranPerKategori,
    setoran30,
    sisaSetoran,
    avgTransaksi,
    maxPemasukan,
    maxPengeluaran,
    jumlahTransaksi: allTx.length,
  };
}

// ── Generate report ────────────────────────────────────────────────

/** Generate lengkap report untuk satu brand */
export async function generateBrandReport(brandName: string): Promise<BrandReport> {
  const transactions = await parseBrandSheet(brandName);
  const summary = calculateBrandSummary(transactions);

  return {
    brand: brandName,
    summary,
    transactions,
    generatedAt: new Date().toISOString(),
  };
}

// ── Write formulas ke sheet ────────────────────────────────────────

/** Tulis ringkasan ke sheet brand (bagian bawah pengeluaran) */
export async function writeBrandSummary(brandName: string): Promise<BrandReport> {
  const report = await generateBrandReport(brandName);
  const s = report.summary;

  // Tentukan baris pertama yang kosong setelah pengeluaran
  const data = await readRange(`${brandName}!A1:Z100`);
  let lastDataRow = 1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0]) lastDataRow = i + 1;
  }

  const summaryStartRow = lastDataRow + 3; // 3 baris kosong sebagai pemisah

  // Data summary yang akan ditulis
  const summaryRows: (string | number)[][] = [
    // Section RINGKASAN
    ["", "", "RINGKASAN", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "Total Pemasukan", s.totalPemasukan, "", "", "", "", ""],
    ["", "Total Pengeluaran", s.totalPengeluaran, "", "", "", "", ""],
    ["", "Laba/Rugi", s.labaRugi, "", "", "Margin", `${s.margin.toFixed(1)}%`, ""],
    ["", "Setoran 30%", s.setoran30, "", "", "Sisa Setoran", s.sisaSetoran, ""],
    ["", "", "", "", "", "", "", ""],
    ["", "Jumlah Transaksi", s.jumlahTransaksi, "", "", "Avg Transaksi", Math.round(s.avgTransaksi), ""],
    ["", "", "", "", "", "", "", ""],
    // Pemasukan per kategori
    ["", "PEMASUKAN PER KATEGORI", "", "", "", "", "", ""],
    ...Object.entries(s.pemasukanPerKategori).map(([k, v]) => ["", `  ${k}`, v, "", "", "", "", ""]),
    ["", "", "", "", "", "", "", ""],
    // Pengeluaran per kategori
    ["", "PENGELUARAN PER KATEGORI", "", "", "", "", "", ""],
    ...Object.entries(s.pengeluaranPerKategori).map(([k, v]) => ["", `  ${k}`, v, "", "", "", "", ""]),
  ];

  const range = `${brandName}!A${summaryStartRow}:H${summaryStartRow + summaryRows.length - 1}`;
  await writeRange(range, summaryRows);

  return report;
}

// ── Semua brands ──────────────────────────────────────────────────

export const BRANDS = ["Produksi", "Event", "Store", "Ecommerse"];

/** Generate report untuk semua brand */
export async function generateAllBrandReports(): Promise<BrandReport[]> {
  const reports: BrandReport[] = [];
  for (const brand of BRANDS) {
    try {
      const report = await generateBrandReport(brand);
      reports.push(report);
    } catch (e) {
      console.error(`Error generating report for ${brand}:`, e);
    }
  }
  return reports;
}

/** Hitung total keseluruhan dari semua brand */
export function calculateHoldingTotal(reports: BrandReport[]) {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  reports.forEach((r) => {
    totalPemasukan += r.summary.totalPemasukan;
    totalPengeluaran += r.summary.totalPengeluaran;
  });

  const labaRugi = totalPemasukan - totalPengeluaran;
  const setoran30 = Math.round(totalPemasukan * 0.3);

  return {
    totalPemasukan,
    totalPengeluaran,
    labaRugi,
    setoran30,
    sisaSetoran: labaRugi - setoran30,
    margin: totalPemasukan > 0 ? (labaRugi / totalPemasukan) * 100 : 0,
  };
}
