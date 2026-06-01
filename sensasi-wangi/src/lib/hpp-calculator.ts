// src/lib/hpp-calculator.ts
// HPP (Harga Pokok Produksi) — Cost per Bottle Calculator
// Sensasi Wangi Indonesia
//
// Menghitung total biaya produksi per botol parfum:
//   bahan baku (dari formula) + packaging + tenaga kerja + overhead
//
// Semua harga dalam IDR (Rupiah Indonesia)

import { getDb } from "./swi-db";
import type { FormulaIngredient } from "./formula-engine";

// ════════════════════════════════════════════
// Types
// ════════════════════════════════════════════

/** Biaya packaging default per botol (dalam IDR) */
export interface PackagingCosts {
  botol: number;    // Botol parfum 30ml
  stiker: number;   // Label stiker
  kotak: number;    // Kotak kemasan
  tisu: number;     // Tisu pelindung
  pouch: number;   // Pouch / tas kain
  labor: number;    // Tenaga kerja
  overhead: number; // Overhead produksi
}

/** Biaya bahan baku per formula */
export interface MaterialCostDetail {
  raw_material_id: number;
  name: string;
  quantity_ml: number;
  cost_per_ml: number;
  total_cost: number;
}

/** Rincian biaya packaging */
export interface PackagingCostDetail {
  item: string;
  label: string;
  unit_cost: number;
  quantity: number;
  total_cost: number;
}

/** Breakdown biaya lengkap per botol */
export interface CostBreakdown {
  formula_id: number;
  formula_code: string;
  formula_name: string;
  batch_size: number;

  // Per-unit costs
  bahan_baku: {
    total: number;
    items: MaterialCostDetail[];
  };
  packaging: {
    total: number;
    items: PackagingCostDetail[];
  };
  labor: number;
  overhead: number;

  // Totals
  hpp_per_unit: number;
  hpp_per_batch: number;

  // Metadata
  selling_price: number;
  gross_margin: number;
  margin_percent: number;
  currency: string;
  calculated_at: string;
}

/** Hasil perhitungan margin */
export interface MarginResult {
  hpp: number;
  selling_price: number;
  gross_margin: number;
  margin_percent: number;
  is_profitable: boolean;
}

/** Hasil break-even analysis */
export interface BreakEvenResult {
  fixed_costs: number;
  contribution_margin: number;
  contribution_margin_ratio: number;
  break_even_units: number;
  break_even_revenue: number;
  break_even_months?: number;
}

/** Proyeksi profit per bulan */
export interface MonthlyProjection {
  month: number;
  units_sold: number;
  revenue: number;
  total_cost: number;
  gross_profit: number;
  cumulative_profit: number;
}

/** Proyeksi profit lengkap */
export interface ProfitProjection {
  monthly_units: number;
  hpp: number;
  selling_price: number;
  gross_margin_per_unit: number;
  months: number;
  projections: MonthlyProjection[];
  summary: {
    total_units: number;
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    avg_monthly_profit: number;
  };
}

/** Data historis HPP */
export interface HppHistoryEntry {
  formula_id: number;
  formula_code: string;
  batch_size: number;
  hpp_per_unit: number;
  selling_price: number;
  margin_percent: number;
  calculated_at: string;
}

// ════════════════════════════════════════════
// Default Packaging Costs (IDR)
// ════════════════════════════════════════════

export const DEFAULT_PACKAGING_COSTS: PackagingCosts = {
  botol: 3000,
  stiker: 500,
  kotak: 1500,
  tisu: 300,
  pouch: 700,
  labor: 2000,
  overhead: 1000,
};

/** Total biaya packaging default per botol (tidak termasuk bahan baku) */
export const DEFAULT_PACKAGING_TOTAL =
  DEFAULT_PACKAGING_COSTS.botol +
  DEFAULT_PACKAGING_COSTS.stiker +
  DEFAULT_PACKAGING_COSTS.kotak +
  DEFAULT_PACKAGING_COSTS.tisu +
  DEFAULT_PACKAGING_COSTS.pouch +
  DEFAULT_PACKAGING_COSTS.labor +
  DEFAULT_PACKAGING_COSTS.overhead;

// ════════════════════════════════════════════
// Main HPP Calculator
// ════════════════════════════════════════════

/**
 * Menghitung HPP (Harga Pokok Produksi) per botol berdasarkan formula ID.
 * 
 * HPP = total biaya bahan baku (dari formula) + biaya packaging tetap
 *
 * @param formulaId - ID formula di database
 * @param packagingCosts - Biaya packaging (opsional, default: DEFAULT_PACKAGING_COSTS)
 * @param batchSize - Ukuran batch dalam botol (default: 1)
 * @returns CostBreakdown lengkap per unit dan per batch
 */
export function calculateHpp(
  formulaId: number,
  packagingCosts: PackagingCosts = DEFAULT_PACKAGING_COSTS,
  batchSize: number = 1
): CostBreakdown {
  const db = getDb();

  // Ambil data formula
  const formula = db.prepare(`
    SELECT f.*, 
           COALESCE(SUM(fi.cost_at_time), 0) as ingredients_cost
    FROM formulas f
    LEFT JOIN formula_ingredients fi ON fi.formula_id = f.id
    WHERE f.id = ?
    GROUP BY f.id
  `).get(formulaId) as
    | {
        id: number;
        formula_code: string;
        total_cost: number;
        selling_price: number;
        formula_name?: string;
        ingredients_cost: number;
      }
    | undefined;

  if (!formula) {
    throw new Error(`Formula ID ${formulaId} tidak ditemukan`);
  }

  // Ambil detail bahan baku
  const ingredients = db.prepare(`
    SELECT 
      fi.raw_material_id,
      COALESCE(rm.name, fi.step_label) as name,
      fi.quantity_ml,
      fi.cost_at_time as total_cost,
      CASE WHEN fi.quantity_ml > 0 THEN fi.cost_at_time * 1.0 / fi.quantity_ml ELSE 0 END as cost_per_ml
    FROM formula_ingredients fi
    LEFT JOIN raw_materials rm ON rm.id = fi.raw_material_id
    WHERE fi.formula_id = ?
    ORDER BY fi.display_order
  `).all(formulaId) as MaterialCostDetail[];

  const bahanBakuTotal = ingredients.reduce((sum, ing) => sum + ing.total_cost, 0);

  // Rincian packaging
  const packagingItems: PackagingCostDetail[] = [
    { item: "botol", label: "Botol 30ml", unit_cost: packagingCosts.botol, quantity: 1, total_cost: packagingCosts.botol },
    { item: "stiker", label: "Stiker Label", unit_cost: packagingCosts.stiker, quantity: 1, total_cost: packagingCosts.stiker },
    { item: "kotak", label: "Kotak Kemasan", unit_cost: packagingCosts.kotak, quantity: 1, total_cost: packagingCosts.kotak },
    { item: "tisu", label: "Tisu Pelindung", unit_cost: packagingCosts.tisu, quantity: 1, total_cost: packagingCosts.tisu },
    { item: "pouch", label: "Pouch/Kain", unit_cost: packagingCosts.pouch, quantity: 1, total_cost: packagingCosts.pouch },
    { item: "labor", label: "Tenaga Kerja", unit_cost: packagingCosts.labor, quantity: 1, total_cost: packagingCosts.labor },
    { item: "overhead", label: "Overhead", unit_cost: packagingCosts.overhead, quantity: 1, total_cost: packagingCosts.overhead },
  ];

  const packagingTotal = packagingItems.reduce((sum, p) => sum + p.total_cost, 0);

  // HPP per unit = bahan baku + packaging
  const hppPerUnit = bahanBakuTotal + packagingTotal;

  // HPP per batch
  const hppPerBatch = hppPerUnit * batchSize;

  // Margin
  const sellingPrice = formula.selling_price || 0;
  const grossMargin = sellingPrice - hppPerUnit;
  const marginPercent = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;

  return {
    formula_id: formulaId,
    formula_code: formula.formula_code,
    formula_name: formula.formula_code,
    batch_size: batchSize,
    bahan_baku: {
      total: bahanBakuTotal,
      items: ingredients,
    },
    packaging: {
      total: packagingTotal,
      items: packagingItems,
    },
    labor: packagingCosts.labor,
    overhead: packagingCosts.overhead,
    hpp_per_unit: hppPerUnit,
    hpp_per_batch: hppPerBatch,
    selling_price: sellingPrice,
    gross_margin: grossMargin,
    margin_percent: Math.round(marginPercent * 100) / 100,
    currency: "IDR",
    calculated_at: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════
// HPP dari custom input (tanpa formula ID)
// ════════════════════════════════════════════

/**
 * Menghitung HPP dari input langsung (custom calculation tanpa formula di DB).
 * Berguna untuk simulasi / "what-if" analysis.
 */
export function calculateHppCustom(
  ingredients: FormulaIngredient[],
  packagingCosts: PackagingCosts = DEFAULT_PACKAGING_COSTS,
  sellingPrice: number = 0,
  batchSize: number = 1
): CostBreakdown {
  const bahanBakuTotal = ingredients.reduce((sum, ing) => sum + ing.cost, 0);

  const materialDetails: MaterialCostDetail[] = ingredients.map((ing) => ({
    raw_material_id: ing.raw_material_id,
    name: ing.name,
    quantity_ml: ing.quantity_ml,
    cost_per_ml: ing.quantity_ml > 0 ? ing.cost / ing.quantity_ml : 0,
    total_cost: ing.cost,
  }));

  const packagingItems: PackagingCostDetail[] = [
    { item: "botol", label: "Botol 30ml", unit_cost: packagingCosts.botol, quantity: 1, total_cost: packagingCosts.botol },
    { item: "stiker", label: "Stiker Label", unit_cost: packagingCosts.stiker, quantity: 1, total_cost: packagingCosts.stiker },
    { item: "kotak", label: "Kotak Kemasan", unit_cost: packagingCosts.kotak, quantity: 1, total_cost: packagingCosts.kotak },
    { item: "tisu", label: "Tisu Pelindung", unit_cost: packagingCosts.tisu, quantity: 1, total_cost: packagingCosts.tisu },
    { item: "pouch", label: "Pouch/Kain", unit_cost: packagingCosts.pouch, quantity: 1, total_cost: packagingCosts.pouch },
    { item: "labor", label: "Tenaga Kerja", unit_cost: packagingCosts.labor, quantity: 1, total_cost: packagingCosts.labor },
    { item: "overhead", label: "Overhead", unit_cost: packagingCosts.overhead, quantity: 1, total_cost: packagingCosts.overhead },
  ];

  const packagingTotal = packagingItems.reduce((sum, p) => sum + p.total_cost, 0);
  const hppPerUnit = bahanBakuTotal + packagingTotal;
  const hppPerBatch = hppPerUnit * batchSize;
  const grossMargin = sellingPrice - hppPerUnit;
  const marginPercent = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;

  return {
    formula_id: 0,
    formula_code: "CUSTOM",
    formula_name: "Custom Calculation",
    batch_size: batchSize,
    bahan_baku: {
      total: bahanBakuTotal,
      items: materialDetails,
    },
    packaging: {
      total: packagingTotal,
      items: packagingItems,
    },
    labor: packagingCosts.labor,
    overhead: packagingCosts.overhead,
    hpp_per_unit: hppPerUnit,
    hpp_per_batch: hppPerBatch,
    selling_price: sellingPrice,
    gross_margin: grossMargin,
    margin_percent: Math.round(marginPercent * 100) / 100,
    currency: "IDR",
    calculated_at: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════
// Margin Calculator
// ════════════════════════════════════════════

/**
 * Menghitung gross margin dan margin percentage.
 * 
 * @param hpp - Harga pokok produksi per unit
 * @param sellingPrice - Harga jual per unit
 * @returns MarginResult dengan gross margin dan persentase
 * 
 * @example
 * calculateMargin(15000, 45000)
 * // → { hpp: 15000, selling_price: 45000, gross_margin: 30000, margin_percent: 66.67, is_profitable: true }
 */
export function calculateMargin(hpp: number, sellingPrice: number): MarginResult {
  const grossMargin = sellingPrice - hpp;
  const marginPercent = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;

  return {
    hpp,
    selling_price: sellingPrice,
    gross_margin: Math.round(grossMargin),
    margin_percent: Math.round(marginPercent * 100) / 100,
    is_profitable: grossMargin > 0,
  };
}

// ════════════════════════════════════════════
// Break-Even Calculator
// ════════════════════════════════════════════

/**
 * Menghitung titik impas (break-even point).
 * 
 * BEP (units) = Fixed Costs / Contribution Margin per unit
 * Contribution Margin = Selling Price - Variable Cost per unit
 * 
 * @param fixedCosts - Total biaya tetap (sewa, gaji tetap, dll) dalam IDR
 * @param contributionMargin - Margin kontribusi per unit (harga jual - biaya variabel per unit)
 * @param monthlyUnits - Unit yang dijual per bulan (untuk estimasi waktu BEP)
 * @returns BreakEvenResult
 * 
 * @example
 * calculateBreakEven(5000000, 30000, 200)
 * // → BEP = 167 unit, ~0.83 bulan
 */
export function calculateBreakEven(
  fixedCosts: number,
  contributionMargin: number,
  monthlyUnits?: number
): BreakEvenResult {
  if (contributionMargin <= 0) {
    return {
      fixed_costs: fixedCosts,
      contribution_margin: contributionMargin,
      contribution_margin_ratio: 0,
      break_even_units: Infinity,
      break_even_revenue: Infinity,
      break_even_months: Infinity,
    };
  }

  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * contributionMargin + fixedCosts;
  const contributionMarginRatio = contributionMargin / (fixedCosts / breakEvenUnits + contributionMargin) * 100;

  const result: BreakEvenResult = {
    fixed_costs: fixedCosts,
    contribution_margin: contributionMargin,
    contribution_margin_ratio: Math.round(contributionMarginRatio * 100) / 100,
    break_even_units: breakEvenUnits,
    break_even_revenue: Math.round(breakEvenRevenue),
  };

  if (monthlyUnits && monthlyUnits > 0) {
    result.break_even_months = Math.round((breakEvenUnits / monthlyUnits) * 100) / 100;
  }

  return result;
}

// ════════════════════════════════════════════
// Profit Projection Calculator
// ════════════════════════════════════════════

/**
 * Membuat proyeksi profit untuk beberapa bulan ke depan.
 * 
 * @param monthlyUnits - Jual per bulan
 * @param hpp - HPP per unit
 * @param sellingPrice - Harga jual per unit
 * @param months - Jumlah bulan untuk proyeksi
 * @returns ProfitProjection lengkap dengan detail per bulan
 * 
 * @example
 * calculateProfitProjection(50, 18800, 45000, 12)
 */
export function calculateProfitProjection(
  monthlyUnits: number,
  hpp: number,
  sellingPrice: number,
  months: number
): ProfitProjection {
  const grossMarginPerUnit = sellingPrice - hpp;
  const projections: MonthlyProjection[] = [];
  let cumulativeProfit = 0;

  for (let m = 1; m <= months; m++) {
    const revenue = monthlyUnits * sellingPrice;
    const totalCost = monthlyUnits * hpp;
    const grossProfit = monthlyUnits * grossMarginPerUnit;
    cumulativeProfit += grossProfit;

    projections.push({
      month: m,
      units_sold: monthlyUnits,
      revenue,
      total_cost: totalCost,
      gross_profit: grossProfit,
      cumulative_profit: cumulativeProfit,
    });
  }

  const totalUnits = monthlyUnits * months;
  const totalRevenue = totalUnits * sellingPrice;
  const totalCost = totalUnits * hpp;
  const totalProfit = totalUnits * grossMarginPerUnit;

  return {
    monthly_units: monthlyUnits,
    hpp,
    selling_price: sellingPrice,
    gross_margin_per_unit: grossMarginPerUnit,
    months,
    projections,
    summary: {
      total_units: totalUnits,
      total_revenue: totalRevenue,
      total_cost: totalCost,
      total_profit: totalProfit,
      avg_monthly_profit: totalProfit / months,
    },
  };
}

// ════════════════════════════════════════════
// Cost Breakdown Detail
// ════════════════════════════════════════════

/**
 * Mendapatkan rincian biaya lengkap (cost breakdown) per komponen untuk formula tertentu.
 * Lebih detail dari calculateHpp() — menghasilkan persentase per komponen.
 * 
 * @param formulaId - ID formula
 * @returns CostBreakdown dengan rinci
 */
export function getCostBreakdown(formulaId: number): CostBreakdown {
  const db = getDb();

  // Ambil formula + ingredients
  const formula = db.prepare("SELECT * FROM formulas WHERE id = ?").get(formulaId) as
    | { id: number; formula_code: string; total_cost: number; selling_price: number }
    | undefined;

  if (!formula) {
    throw new Error(`Formula ID ${formulaId} tidak ditemukan`);
  }

  return calculateHpp(formulaId);
}

// ════════════════════════════════════════════
// HPP History
// ════════════════════════════════════════════

/**
 * Mendapatkan data historis HPP dari semua formula yang sudah dikonfirmasi.
 * Setiap formula menunjukkan HPP per unit, harga jual, dan margin.
 * 
 * @returns Array of HppHistoryEntry
 */
export function getHppHistory(): HppHistoryEntry[] {
  const db = getDb();

  const formulas = db.prepare(`
    SELECT 
      f.id as formula_id,
      f.formula_code,
      COALESCE(SUM(fi.cost_at_time), 0) as ingredients_cost,
      f.selling_price,
      f.created_at
    FROM formulas f
    LEFT JOIN formula_ingredients fi ON fi.formula_id = f.id
    WHERE f.status IN ('confirmed', 'mixed', 'matured', 'completed')
    GROUP BY f.id
    ORDER BY f.created_at DESC
  `).all() as {
    formula_id: number;
    formula_code: string;
    ingredients_cost: number;
    selling_price: number;
    created_at: string;
  }[];

  return formulas.map((f) => {
    const hppPerUnit = f.ingredients_cost + DEFAULT_PACKAGING_TOTAL;
    const marginPercent =
      f.selling_price > 0
        ? ((f.selling_price - hppPerUnit) / f.selling_price) * 100
        : 0;

    return {
      formula_id: f.formula_id,
      formula_code: f.formula_code,
      batch_size: 1,
      hpp_per_unit: hppPerUnit,
      selling_price: f.selling_price,
      margin_percent: Math.round(marginPercent * 100) / 100,
      calculated_at: f.created_at,
    };
  });
}

// ════════════════════════════════════════════
// HPP Comparison Across Formulas
// ════════════════════════════════════════════

/**
 * Membandingkan HPP antar beberapa formula.
 * Berguna untuk memilih formula yang paling profitable.
 * 
 * @param formulaIds - Array of formula IDs untuk dibandingkan
 * @returns Array of CostBreakdown, sorted by hpp_per_unit ascending
 */
export function compareHpp(formulaIds: number[]): CostBreakdown[] {
  const results: CostBreakdown[] = [];

  for (const id of formulaIds) {
    try {
      results.push(calculateHpp(id));
    } catch {
      // Skip formula yang tidak ditemukan
    }
  }

  // Sort by HPP ascending (cheapest first)
  return results.sort((a, b) => a.hpp_per_unit - b.hpp_per_unit);
}

// ════════════════════════════════════════════
// Utility: Format IDR Currency
// ════════════════════════════════════════════

/**
 * Format angka ke mata uang Indonesia.
 * @example formatIdr(150000) → "Rp 150.000"
 */
export function formatIdr(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}
