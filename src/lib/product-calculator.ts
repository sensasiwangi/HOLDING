// src/lib/product-calculator.ts
// Product & Sales Calculator
// Hitung penjualan per varian, per brand, COGS, margin, pendapatan
import { readRange, writeRange, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export interface ProductVariant {
  brand: string;
  sku: string;
  nama: string;
  cogs: number;        // Harga pokok
  hargaJual: number;
  margin: number;      // dalam rupiah
  marginPct: number;   // dalam persen
  batch: string;
  terjual: number;     // unit
  pendapatan: number;  // hargaJual × terjual
  status: string;
}

export interface MerchItem {
  sku: string;
  nama: string;
  kategori: string;
  ukuran: string;
  warna: string;
  cogs: number;
  hargaJual: number;
  marginPct: number;
  stok: number;
  minStok: number;
  supplier: string;
  status: string;
}

export interface BrandSalesSummary {
  brand: string;
  totalPendapatan: number;
  totalCogs: number;
  totalMargin: number;
  totalUnit: number;
  marginAvg: number;
  variantCount: number;
  topVariant: string;
  variants: ProductVariant[];
}

export interface SalesReport {
  brands: BrandSalesSummary[];
  merch: MerchItem[];
  totalPendapatan: number;
  totalCogs: number;
  totalMargin: number;
  totalUnit: number;
  generatedAt: string;
}

// ── Parse Brand_Tracking ───────────────────────────────────────────

export function parseBrandTracking(data: string[][]): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0] || !r[1]) continue; // skip baris kosong

    const brand = String(r[0] || "").trim();
    const sku = String(r[1] || "").trim();
    const nama = String(r[2] || "").trim();
    const cogs = parseNum(r[3]);
    const hargaJual = parseNum(r[4]);
    const marginPct = parseNum(r[5]);
    const batch = String(r[6] || "").trim();
    const terjual = parseNum(r[7]);
    const pendapatan = parseNum(r[8]) || (hargaJual * terjual);
    const status = String(r[9] || "").trim();

    variants.push({ brand, sku, nama, cogs, hargaJual, margin: hargaJual - cogs, marginPct, batch, terjual, pendapatan, status });
  }
  return variants;
}

// ── Parse Merch_TIM ────────────────────────────────────────────────

export function parseMerchTim(data: string[][]): MerchItem[] {
  const items: MerchItem[] = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0] || !r[1]) continue;

    items.push({
      sku: String(r[0] || "").trim(),
      nama: String(r[1] || "").trim(),
      kategori: String(r[2] || "").trim(),
      ukuran: String(r[3] || "").trim(),
      warna: String(r[4] || "").trim(),
      cogs: parseNum(r[5]),
      hargaJual: parseNum(r[6]),
      marginPct: parseNum(r[7]),
      stok: parseNum(r[8]),
      minStok: parseNum(r[9]),
      supplier: String(r[10] || "").trim(),
      status: String(r[11] || "").trim(),
    });
  }
  return items;
}

// ── Calculate ──────────────────────────────────────────────────────

function parseNum(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/** Agregasi penjualan per brand */
export function calculateBrandSales(variants: ProductVariant[]): BrandSalesSummary[] {
  const byBrand: Record<string, ProductVariant[]> = {};

  variants.forEach((v) => {
    if (!byBrand[v.brand]) byBrand[v.brand] = [];
    byBrand[v.brand].push(v);
  });

  return Object.entries(byBrand).map(([, vars]) => {
    const totalPendapatan = vars.reduce((s, v) => s + v.pendapatan, 0);
    const totalCogs = vars.reduce((s, v) => s + v.cogs * v.terjual, 0);
    const totalMargin = totalPendapatan - totalCogs;
    const totalUnit = vars.reduce((s, v) => s + v.terjual, 0);
    const marginAvg = vars.length > 0 ? vars.reduce((s, v) => s + v.marginPct, 0) / vars.length : 0;

    // Top variant by pendapatan
    const sorted = [...vars].sort((a, b) => b.pendapatan - a.pendapatan);
    const topVariant = sorted[0]?.nama || "";

    return {
      brand: vars[0].brand,
      totalPendapatan,
      totalCogs,
      totalMargin,
      totalUnit,
      marginAvg,
      variantCount: vars.length,
      topVariant,
      variants: vars,
    };
  }).sort((a, b) => b.totalPendapatan - a.totalPendapatan);
}

// ── Generate report ────────────────────────────────────────────────

export async function generateSalesReport(): Promise<SalesReport> {
  const [brandData, merchData] = await Promise.all([
    readRange("Brand_Tracking!A1:K50"),
    readRange("Merch_TIM!A1:L20"),
  ]);

  const variants = parseBrandTracking(brandData);
  const merch = parseMerchTim(merchData);
  const brands = calculateBrandSales(variants);

  const totalPendapatan = brands.reduce((s, b) => s + b.totalPendapatan, 0) +
    merch.reduce((s, m) => s + m.hargaJual * m.stok, 0); // stok × harga = nilai stok
  const totalCogs = brands.reduce((s, b) => s + b.totalCogs, 0);
  const totalMargin = brands.reduce((s, b) => s + b.totalMargin, 0);
  const totalUnit = brands.reduce((s, b) => s + b.totalUnit, 0);

  return { brands, merch, totalPendapatan, totalCogs, totalMargin, totalUnit, generatedAt: new Date().toISOString() };
}

// ── Write/update penjualan ────────────────────────────────────────

/** Update penjualan varian (tambah unit terjual) */
export async function recordSale(sku: string, units: number): Promise<{ success: boolean; variant?: ProductVariant; error?: string }> {
  try {
    const data = await readRange("Brand_Tracking!A1:K50");
    const variants = parseBrandTracking(data);

    const idx = variants.findIndex((v) => v.sku === sku);
    if (idx === -1) return { success: false, error: `SKU ${sku} tidak ditemukan` };

    const v = variants[idx];
    const newTerjual = v.terjual + units;
    const newPendapatan = v.hargaJual * newTerjual;

    // Update baris di sheet (row = idx + 2 karena header)
    const rowNumber = idx + 2;
    await writeRange(`Brand_Tracking!H${rowNumber}:I${rowNumber}`, [[newTerjual, newPendapatan]]);

    return { success: true, variant: { ...v, terjual: newTerjual, pendapatan: newPendapatan } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/** Tambah varian baru */
export async function addVariant(variant: Omit<ProductVariant, "margin" | "pendapatan">): Promise<{ success: boolean }> {
  const margin = variant.hargaJual - variant.cogs;
  const row = [
    variant.brand,
    variant.sku,
    variant.nama,
    variant.cogs,
    variant.hargaJual,
    variant.marginPct,
    variant.batch,
    variant.terjual || 0,
    (variant.hargaJual * (variant.terjual || 0)),
    variant.status || "Active",
  ];

  await writeRange("Brand_Tracking!A:K:append", { values: [row] } as any);
  return { success: true };
}

// ── Analisis ──────────────────────────────────────────────────────

/** Hitung break-even per varian */
export function calculateBreakEven(fixedCosts: number, variants: ProductVariant[]) {
  return variants.map((v) => {
    const contributionMargin = v.hargaJual - v.cogs;
    const breakEvenUnit = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
    const breakEvenRevenue = breakEvenUnit * v.hargaJual;

    return {
      sku: v.sku,
      nama: v.nama,
      brand: v.brand,
      contributionMargin,
      breakEvenUnit,
      breakEvenRevenue,
      isProfitable: contributionMargin > 0,
    };
  });
}

/** Hitung proyeksi penjualan */
export function projectSales(variants: ProductVariant[], growthPct: number, months: number) {
  return variants.map((v) => {
    const monthlySales = v.terjual; // asumsi/bulan
    let projected = monthlySales;
    const projections: { month: number; units: number; revenue: number }[] = [];

    for (let m = 1; m <= months; m++) {
      projected = Math.round(projected * (1 + growthPct / 100));
      projections.push({ month: m, units: projected, revenue: projected * v.hargaJual });
    }

    return {
      sku: v.sku,
      nama: v.nama,
      brand: v.brand,
      currentMonthly: monthlySales,
      growthPct,
      projections,
      totalProjectedRevenue: projections.reduce((s, p) => s + p.revenue, 0),
    };
  });
}
