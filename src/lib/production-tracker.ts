// src/lib/production-tracker.ts
// Production Tracker — Catat seluruh alur produksi per batch
// Bahan → Formula → Bottling → Packaging → Produk Jadi → Penjualan
import { readRange, writeRange, appendRows, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export interface BahanBaku {
  kode: string;
  nama: string;
  satuan: string;
  hargaSatuan: number;
  stok: number;
  minStok: number;
  supplier: string;
  kategori: string; // "botol", "essence", "label", "stiker", "packaging", "lain"
}

export interface FormulaItem {
  kodeFormula: string;
  brand: string;
  skuProduk: string;
  namaProduk: string;
  bahan: FormulaBahan[];
  yieldUnit: number;      // berapa unit per batch
  tanggalBuat: string;
  status: "draft" | "active" | "inactive";
}

export interface FormulaBahan {
  kodeBahan: string;
  namaBahan: string;
  jumlah: number;         // ml, pcs, gram, dll
  satuan: string;
  hargaSatuan: number;
  subtotal: number;
}

export interface BottlingRecord {
  kodeBottling: string;
  kodeFormula: string;
  brand: string;
  skuProduk: string;
  namaProduk: string;
  tanggal: string;
  batchProduk: string;
  unitDiproduksi: number;
  upahPerUnit: number;
  totalUpah: number;
  pic: string;
  catatan: string;
}

export interface PackagingRecord {
  kodePackaging: string;
  kodeFormula: string;
  brand: string;
  skuProduk: string;
  namaProduk: string;
  tanggal: string;
  unitDipackaging: number;
  biayaPerUnit: number;   // stiker, box, dll
  totalBiaya: number;
  pic: string;
}

export interface ProdukJadi {
  brand: string;
  sku: string;
  namaProduk: string;
  batch: string;
  totalUnit: number;
  totalCogsPerUnit: number; // = bahan + bottling + packaging
  hargaJual: number;
  marginPerUnit: number;
  marginPct: number;
  tanggalProduksi: string;
  status: "produksi" | "siap_jual" | "laku";
}

// ── Bahan Baku ─────────────────────────────────────────────────────

/** Catat pembelian bahan baku */
export async function catatBahanBaku(bahan: {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  hargaSatuan: number;
  qtyBeli: number;
  supplier: string;
  tanggal?: string;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const d = bahan.tanggal || new Date().toISOString().split("T")[0];

  // Tulis ke sheet Produksi (sebagai pengeluaran)
  // Format: No, Tanggal, Tipe, Kategori, Deskripsi, Jumlah, Info, Referensi
  const row = [
    "", // No otomatis
    d,
    "Pembelian Bahan",
    bahan.kategori,
    `${bahan.nama} (${bahan.satuan}) — ${bahan.qtyBeli} ${bahan.satuan}`,
    bahan.hargaSatuan * bahan.qtyBeli,
    `Supplier: ${bahan.supplier} | Kode: ${bahan.kode}`,
    now,
  ];

  await appendRows("Produksi", [row]);

  // Juga catat ke pengeluaran Produksi
  return { success: true, totalBiaya: bahan.hargaSatuan * bahan.qtyBeli };
}

// ── Formula ────────────────────────────────────────────────────────

/** Catat formula/resep baru per varian */
export async function catatFormula(formula: FormulaItem) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Cost breakdown per unit
  const bahanCost = formula.bahan.reduce((s, b) => s + b.subtotal, 0);
  const costPerUnit = formula.yieldUnit > 0 ? Math.round(bahanCost / formula.yieldUnit) : 0;

  // Tulis ke Produksi (pemasukan → formulasi)
  const rows: (string | number)[][] = [
    [
      "",
      formula.tanggalBuat,
      "Formula",
      formula.brand,
      `Formula ${formula.kodeFormula}: ${formula.namaProduk}`,
      bahanCost,
      `Yield: ${formula.yieldUnit} unit | Cost/unit: Rp ${costPerUnit}`,
      now,
    ],
  ];

  // Detail bahan
  for (const b of formula.bahan) {
    rows.push([
      "",
      formula.tanggalBuat,
      "Bahan Formula",
      b.kodeBahan,
      `  └ ${b.namaBahan}: ${b.jumlah} ${b.satuan}`,
      b.subtotal,
      `${formula.kodeFormula} → ${formula.skuProduk}`,
      now,
    ]);
  }

  await appendRows("Produksi", rows);

  return { success: true, kodeFormula: formula.kodeFormula, costPerUnit, bahanCost };
}

// ── Bottling ───────────────────────────────────────────────────────

/** Catat proses bottling (upah) */
export async function catatBottling(record: {
  kodeFormula: string;
  brand: string;
  skuProduk: string;
  namaProduk: string;
  tanggal: string;
  batchProduk: string;
  unitDiproduksi: number;
  upahPerUnit: number;
  pic: string;
  catatan?: string;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const totalUpah = record.unitDiproduksi * record.upahPerUnit;
  const kodeBottling = `BTL-${record.batchProduk}-${Date.now().toString(36).slice(-4)}`;

  await appendRows("Produksi", [[
    "",
    record.tanggal,
    "Bottling",
    record.brand,
    `Bottling ${record.namaProduk} — Batch ${record.batchProduk}`,
    totalUpah,
    `${record.unitDiproduksi} unit × Rp ${record.upahPerUnit} | PIC: ${record.pic}`,
    now,
  ]]);

  return { success: true, kodeBottling, totalUpah };
}

// ── Packaging ──────────────────────────────────────────────────────

/** Catat proses packaging */
export async function catatPackaging(record: {
  kodeFormula: string;
  brand: string;
  skuProduk: string;
  namaProduk: string;
  tanggal: string;
  unitDipackaging: number;
  biayaPerUnit: number;
  pic: string;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const totalBiaya = record.unitDipackaging * record.biayaPerUnit;
  const kodePackaging = `PKG-${record.skuProduk}-${Date.now().toString(36).slice(-4)}`;

  await appendRows("Produksi", [[
    "",
    record.tanggal,
    "Packaging",
    record.brand,
    `Packaging ${record.namaProduk} — ${record.unitDipackaging} unit`,
    totalBiaya,
    `Rp ${record.biayaPerUnit}/unit (stiker, box, seal) | PIC: ${record.pic}`,
    now,
  ]]);

  return { success: true, kodePackaging, totalBiaya };
}

// ── Produk Jadi ────────────────────────────────────────────────────

/** Catat produk jadi → aggregasi COGS dari semua komponen */
export async function catatProdukJadi(data: {
  brand: string;
  sku: string;
  namaProduk: string;
  batch: string;
  totalUnit: number;
  totalBahanCost: number;    // dari formula
  totalBottlingCost: number; // dari bottling
  totalPackagingCost: number;// dari packaging
  hargaJual: number;
  tanggalProduksi: string;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const totalCogs = data.totalBahanCost + data.totalBottlingCost + data.totalPackagingCost;
  const cogsPerUnit = data.totalUnit > 0 ? Math.round(totalCogs / data.totalUnit) : 0;
  const marginPerUnit = data.hargaJual - cogsPerUnit;
  const marginPct = data.hargaJual > 0 ? (marginPerUnit / data.hargaJual) * 100 : 0;

  // Tulis ke Produksi (produk jadi)
  await appendRows("Produksi", [[
    "",
    data.tanggalProduksi,
    "Produk Jadi",
    data.brand,
    `${data.namaProduk} — Batch ${data.batch} — ${data.totalUnit} unit`,
    totalCogs,
    `COGS/unit: Rp ${cogsPerUnit} | Jual: Rp ${data.hargaJual} | Margin: ${marginPct.toFixed(1)}%`,
    now,
  ]]);

  return {
    success: true,
    cogsPerUnit,
    marginPerUnit,
    marginPct,
    totalPendapatan: data.hargaJual * data.totalUnit,
    totalMargin: marginPerUnit * data.totalUnit,
  };
}

// ── Penjualan ──────────────────────────────────────────────────────

/** Catat penjualan produk */
export async function catatPenjualan(data: {
  brand: string;
  sku: string;
  namaProduk: string;
  tanggal: string;
  unitTerjual: number;
  hargaJual: number;
  batch: string;
  catatan?: string;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const pendapatan = data.unitTerjual * data.hargaJual;

  // Tulis ke Produksi (pemasukan → penjualan)
  await appendRows("Produksi", [[
    "",
    data.tanggal,
    "Penjualan",
    data.brand,
    `Penjualan ${data.namaProduk} — ${data.unitTerjual} unit`,
    pendapatan,
    `Batch: ${data.batch} | ${data.catatan || ""}`,
    now,
  ]]);

  // Update Brand_Tracking
  const brandData = await readRange("Brand_Tracking!A1:K50");
  let rowNumber = -1;
  for (let i = 1; i < brandData.length; i++) {
    if (brandData[i][1]?.toString().trim() === data.sku) {
      rowNumber = i + 1;
      break;
    }
  }

  if (rowNumber > 0) {
    // Update unit terjual dan pendapatan
    await writeRange(`Brand_Tracking!H${rowNumber}:I${rowNumber}`, [
      [data.unitTerjual, pendapatan],
    ]);
  }

  return { success: true, pendapatan, unitTerjual: data.unitTerjual };
}

// ── Analisis ──────────────────────────────────────────────────────

/** Hitung COGS breakdown per produk */
export async function analyzeCogs(sku: string): Promise<{
  bahan: number;
  bottling: number;
  packaging: number;
  total: number;
  perUnit: number;
} | null> {
  const data = await readRange("Produksi!A1:H100");

  let bahan = 0, bottling = 0, packaging = 0;

  for (const row of data) {
    if (!row[4]) continue;
    const desc = String(row[4]);
    const jumlah = parseNum(row[5]);

    if (desc.includes(sku)) {
      if (desc.includes("Bahan") || desc.includes("Formula") || desc.includes("Pembelian")) {
        bahan += jumlah;
      } else if (desc.includes("Bottling")) {
        bottling += jumlah;
      } else if (desc.includes("Packaging")) {
        packaging += jumlah;
      }
    }
  }

  const total = bahan + bottling + packaging;
  const perUnit = total; // sederhana

  return { bahan, bottling, packaging, total, perUnit };
}

function parseNum(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// ── Master: Catat seluruh alur sekaligus ──────────────────────────

/** Catat 1 batch produksi lengkap — dari bahan sampai produk jadi */
export async function catatBatchProduk(data: {
  brand: string;
  sku: string;
  namaProduk: string;
  batch: string;
  tanggal: string;
  bahan: { nama: string; jumlah: number; satuan: string; hargaSatuan: number }[];
  unitProduksi: number;
  upahBottlingPerUnit: number;
  biayaPackagingPerUnit: number;
  hargaJual: number;
  picBottling: string;
  picPackaging: string;
}) {
  const results: Record<string, any> = {};

  // 1. Catat pembelian bahan
  let totalBahan = 0;
  for (const b of data.bahan) {
    await catatBahanBaku({
      kode: `BH-${b.nama.substring(0, 3).toUpperCase()}`,
      nama: b.nama,
      kategori: getBahanKategori(b.nama),
      satuan: b.satuan,
      hargaSatuan: b.hargaSatuan,
      qtyBeli: b.jumlah,
      supplier: "",
      tanggal: data.tanggal,
    });
    totalBahan += b.jumlah * b.hargaSatuan;
  }
  results.bahanCost = totalBahan;

  // 2. Catat bottling
  const bottlingResult = await catatBottling({
    kodeFormula: `FRM-${data.batch}`,
    brand: data.brand,
    skuProduk: data.sku,
    namaProduk: data.namaProduk,
    tanggal: data.tanggal,
    batchProduk: data.batch,
    unitDiproduksi: data.unitProduksi,
    upahPerUnit: data.upahBottlingPerUnit,
    pic: data.picBottling,
  });
  results.bottlingCost = bottlingResult.totalUpah;

  // 3. Catat packaging
  const packagingResult = await catatPackaging({
    kodeFormula: `FRM-${data.batch}`,
    brand: data.brand,
    skuProduk: data.sku,
    namaProduk: data.namaProduk,
    tanggal: data.tanggal,
    unitDipackaging: data.unitProduksi,
    biayaPerUnit: data.biayaPackagingPerUnit,
    pic: data.picPackaging,
  });
  results.packagingCost = packagingResult.totalBiaya;

  // 4. Catat produk jadi
  const produkResult = await catatProdukJadi({
    brand: data.brand,
    sku: data.sku,
    namaProduk: data.namaProduk,
    batch: data.batch,
    totalUnit: data.unitProduksi,
    totalBahanCost: totalBahan,
    totalBottlingCost: bottlingResult.totalUpah,
    totalPackagingCost: packagingResult.totalBiaya,
    hargaJual: data.hargaJual,
    tanggalProduksi: data.tanggal,
  });
  results.produkJadi = produkResult;

  return results;
}

function getBahanKategori(nama: string): string {
  const n = nama.toLowerCase();
  if (n.includes("botol")) return "botol";
  if (n.includes("essence") || n.includes("fragrance") || n.includes("aroma")) return "essence";
  if (n.includes("label")) return "label";
  if (n.includes("stiker") || n.includes("sticker")) return "stiker";
  if (n.includes("box") || n.includes("kardus") || n.includes("packaging")) return "packaging";
  if (n.includes("alkohol") || n.includes("alcohol")) return "alkohol";
  return "lain";
}
