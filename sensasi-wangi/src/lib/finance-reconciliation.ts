// src/lib/finance-reconciliation.ts
// P1-4: Finance Reconciliation Engine
// Rekonsiliasi data keuangan: Google Sheets ↔ SQLite ↔ Dashboard
// Cocokkan transaksi, deteksi selisih, generate laporan

import { getDb } from "./swi-db";
// import { readRange } from "@/holding-swi/src/lib/sheets"; — cross-module import handled separately

// ── Types ──────────────────────────────────────────────────────

export interface ReconciliationResult {
  status: "matched" | "mismatch" | "missing_in_db" | "missing_in_sheets";
  formula_code?: string;
  sheets_amount?: number;
  db_amount?: number;
  difference?: number;
  notes: string;
}

export interface ReconciliationReport {
  checked: number;
  matched: number;
  mismatches: number;
  missing_in_db: number;
  missing_in_sheets: number;
  details: ReconciliationResult[];
  generated_at: string;
}

export interface DailySummary {
  date: string;
  total_revenue: number;
  total_cogs: number;
  total_profit: number;
  transaction_count: number;
  payment_methods: Record<string, number>;
}

// ── Formula-level Reconciliation ───────────────────────────────

export function reconcileFormulas(checkSheet?: boolean): ReconciliationResult[] {
  const db = getDb();

  // Get all confirmed/completed formulas with their financial data
  const formulas = db.prepare(`
    SELECT f.formula_code, f.total_cost, f.selling_price,
           COALESCE(SUM(fi.cost_at_time), 0) as actual_ingredient_cost,
           COUNT(fi.id) as ingredient_count
    FROM formulas f
    LEFT JOIN formula_ingredients fi ON fi.formula_id = f.id
    WHERE f.status IN ('confirmed', 'completed', 'mixed')
    GROUP BY f.id
  `).all() as {
    formula_code: string; total_cost: number; selling_price: number;
    actual_ingredient_cost: number; ingredient_count: number;
  }[];

  const results: ReconciliationResult[] = [];

  for (const f of formulas) {
    const costDiff = Math.abs(f.total_cost - f.actual_ingredient_cost);
    const costDiffPct = f.total_cost > 0 ? (costDiff / f.total_cost) * 100 : 0;

    if (costDiff === 0) {
      results.push({
        status: "matched",
        formula_code: f.formula_code,
        sheets_amount: f.actual_ingredient_cost,
        db_amount: f.total_cost,
        notes: "Biaya bahan baku ✓",
      });
    } else if (costDiffPct <= 5) {
      // Within 5% tolerance
      results.push({
        status: "matched",
        formula_code: f.formula_code,
        sheets_amount: f.actual_ingredient_cost,
        db_amount: f.total_cost,
        difference: costDiff,
        notes: `Selisih ${costDiffPct.toFixed(1)}% (toleransi 5%)`,
      });
    } else {
      results.push({
        status: "mismatch",
        formula_code: f.formula_code,
        sheets_amount: f.actual_ingredient_cost,
        db_amount: f.total_cost,
        difference: Math.abs(f.total_cost - f.actual_ingredient_cost),
        notes: `Selisih biaya signifikan: ${costDiff.toLocaleString("id-ID")} IDR (${costDiffPct.toFixed(1)}%)`,
      });
    }
  }

  return results;
}

// ── Full Reconciliation Report ──────────────────────────────────

export function generateReconciliationReport(): ReconciliationReport {
  const details = reconcileFormulas();

  const matched = details.filter(d => d.status === "matched").length;
  const mismatches = details.filter(d => d.status === "mismatch").length;
  const missingInDb = details.filter(d => d.status === "missing_in_db").length;
  const missingInSheets = details.filter(d => d.status === "missing_in_sheets").length;

  return {
    checked: details.length,
    matched,
    mismatches,
    missing_in_db: missingInDb,
    missing_in_sheets: missingInSheets,
    details,
    generated_at: new Date().toISOString(),
  };
}

// ── Daily Financial Summary ─────────────────────────────────────

export function getDailySummary(days: number = 30): DailySummary[] {
  const db = getDb();

  const formulas = db.prepare(`
    SELECT
      DATE(f.created_at) as date,
      COUNT(*) as count,
      COALESCE(SUM(f.selling_price), 0) as total_revenue,
      COALESCE(SUM(f.total_cost), 0) as total_cogs
    FROM formulas f
    WHERE f.status IN ('confirmed', 'completed')
      AND f.created_at >= date('now', ?)
    GROUP BY DATE(f.created_at)
    ORDER BY date DESC
  `).all(`-${days} days`) as { date: string; count: number; total_revenue: number; total_cogs: number }[];

  return formulas.map(f => ({
    date: f.date,
    total_revenue: f.total_revenue,
    total_cogs: f.total_cogs,
    total_profit: f.total_revenue - f.total_cogs,
    transaction_count: f.count,
    payment_methods: { cash: 0, transfer: 0, qris: 0, }, // placeholder for future payment tracking
  }));
}

// ── Revenue vs Cost Analysis ────────────────────────────────────

export function getRevenueAnalysis(days: number = 30): {
  total_revenue: number;
  total_cogs: number;
  total_profit: number;
  avg_margin_pct: number;
  best_day: string | null;
  best_day_revenue: number;
  daily: DailySummary[];
} {
  const daily = getDailySummary(days);
  const totalRevenue = daily.reduce((s, d) => s + d.total_revenue, 0);
  const totalCogs = daily.reduce((s, d) => s + d.total_cogs, 0);
  const totalProfit = totalRevenue - totalCogs;
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  const bestDay = daily.reduce((best, d) => d.total_revenue > (best?.total_revenue || 0) ? d : best, daily[0] || null);

  return {
    total_revenue: totalRevenue,
    total_cogs: totalCogs,
    total_profit: totalProfit,
    avg_margin_pct: Math.round(avgMargin * 10) / 10,
    best_day: bestDay?.date || null,
    best_day_revenue: bestDay?.total_revenue || 0,
    daily,
  };
}

// ── Auto-fix: Update formula total_cost from actual ingredients ─

export function fixFormulaCostDiscrepancies(): { fixed: number; details: string[] } {
  const db = getDb();
  const details: string[] = [];
  let fixed = 0;

  const formulas = db.prepare(`
    SELECT f.id, f.formula_code, f.total_cost,
           COALESCE(SUM(fi.cost_at_time), 0) as actual_cost
    FROM formulas f
    LEFT JOIN formula_ingredients fi ON fi.formula_id = f.id
    WHERE f.status IN ('confirmed', 'completed', 'mixed')
    GROUP BY f.id
    HAVING ABS(f.total_cost - actual_cost) > 0
  `).all() as { id: number; formula_code: string; total_cost: number; actual_cost: number }[];

  for (const f of formulas) {
    db.prepare("UPDATE formulas SET total_cost = ? WHERE id = ?").run(f.actual_cost, f.id);
    details.push(`${f.formula_code}: ${f.total_cost.toLocaleString()} → ${f.actual_cost.toLocaleString()} IDR`);
    fixed++;
  }

  return { fixed, details };
}
