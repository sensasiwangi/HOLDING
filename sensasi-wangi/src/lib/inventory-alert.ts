// src/lib/inventory-alert.ts
// P1-2: Inventory Reorder Alert Engine
// Monitor stok bahan baku + packaging, generate alert & reorder list

import { getDb } from "./swi-db";

// ── Types ──────────────────────────────────────────────────────

export interface StockItem {
  id: number;
  name: string;
  stock_ml: number;
  min_stock_ml: number;
  alert_level: "ok" | "low" | "critical" | "empty";
  deficit_ml: number;
  suggested_order_ml: number;
  estimated_cost: number;
}

export interface PackagingItem {
  type: "botol" | "stiker" | "kotak" | "tisu" | "pouch";
  label: string;
  current: number;
  min_alert: number;
  alert_level: "ok" | "low" | "critical" | "empty";
  estimated_unit_cost: number;
}

export interface ReorderList {
  raw_materials: StockItem[];
  packaging: PackagingItem[];
  total_estimate_cost: number;
  generated_at: string;
}

// ── Packaging Defaults ─────────────────────────────────────────

const PACKAGING_DEFAULTS: Record<string, { label: string; min_alert: number; unit_cost: number }> = {
  botol: { label: "Botol 30ml", min_alert: 30, unit_cost: 3000 },
  stiker: { label: "Stiker Label", min_alert: 30, unit_cost: 500 },
  kotak: { label: "Kotak Packaging", min_alert: 20, unit_cost: 1500 },
  tisu: { label: "Tisu Pembungkus", min_alert: 50, unit_cost: 300 },
  pouch: { label: "Pouch Kain", min_alert: 15, unit_cost: 700 },
};

// ── Helpers ────────────────────────────────────────────────────

function getAlertLevel(current: number, minAlert: number): "ok" | "low" | "critical" | "empty" {
  if (current <= 0) return "empty";
  if (current < minAlert * 0.5) return "critical";
  if (current < minAlert) return "low";
  return "ok";
}

// ── Schema ─────────────────────────────────────────────────────

export function createPackagingInventoryTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS packaging_inventory (
      type TEXT PRIMARY KEY,
      current_count INTEGER DEFAULT 0,
      min_alert INTEGER DEFAULT 30,
      notes TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL,
      item_id INTEGER,
      change_amount INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default packaging stock
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO packaging_inventory (type, current_count, min_alert) VALUES (?, ?, ?)
  `);
  for (const [type, cfg] of Object.entries(PACKAGING_DEFAULTS)) {
    stmt.run(type, cfg.min_alert * 3, cfg.min_alert);
  }
}

// ── Stock Level Check ──────────────────────────────────────────

export function checkStockLevels(): StockItem[] {
  const db = getDb();
  createPackagingInventoryTable();

  const materials = db.prepare(`
    SELECT rm.id, rm.name, rm.stock_ml, rm.min_stock_ml,
           rm.price_per_50ml, rm.price_per_100ml, rm.price_per_500ml
    FROM raw_materials rm
    WHERE rm.kategori_rm NOT IN ('solvent', 'eco_base')
    ORDER BY rm.stock_ml / NULLIF(rm.min_stock_ml, 0) ASC
  `).all() as {
    id: number; name: string; stock_ml: number; min_stock_ml: number;
    price_per_50ml: number; price_per_100ml: number; price_per_500ml: number;
  }[];

  return materials.map(m => {
    const level = getAlertLevel(m.stock_ml, m.min_stock_ml);
    const deficit = Math.max(0, m.min_stock_ml - m.stock_ml);
    // Suggest 2x min stock as reorder quantity
    const suggested = Math.max(m.min_stock_ml * 2, deficit);
    const pricePerMl = (m.price_per_500ml / 500) || (m.price_per_100ml / 100) || (m.price_per_50ml / 50) || 0;
    const cost = Math.round(suggested * pricePerMl);

    return {
      id: m.id,
      name: m.name,
      stock_ml: m.stock_ml,
      min_stock_ml: m.min_stock_ml,
      alert_level: level,
      deficit_ml: deficit,
      suggested_order_ml: Math.round(suggested),
      estimated_cost: cost,
    };
  });
}

export function getStockStatus(): {
  all: StockItem[];
  alerts: StockItem[];
  summary: { ok: number; low: number; critical: number; empty: number; total: number };
} {
  const all = checkStockLevels();
  const alerts = all.filter(i => i.alert_level !== "ok");

  const summary = { ok: 0, low: 0, critical: 0, empty: 0, total: all.length };
  for (const item of all) {
    summary[item.alert_level]++;
  }

  return { all, alerts, summary };
}

// ── Monthly Usage ──────────────────────────────────────────────

export function getMonthlyUsage(materialId: number): number {
  const db = getDb();
  const result = db.prepare(`
    SELECT COALESCE(SUM(fi.quantity_ml), 0) as total_ml
    FROM formula_ingredients fi
    JOIN formulas f ON f.id = fi.formula_id
    WHERE fi.raw_material_id = ?
      AND f.status IN ('confirmed', 'mixed', 'completed')
      AND f.created_at >= date('now', '-30 days')
  `).get(materialId) as { total_ml: number };

  return result.total_ml;
}

export function calculateReorderQuantity(materialId: number): number {
  const db = getDb();
  const mat = db.prepare("SELECT min_stock_ml FROM raw_materials WHERE id = ?").get(materialId) as { min_stock_ml: number } | undefined;
  if (!mat) return 0;

  const monthlyUsage = getMonthlyUsage(materialId);
  // Reorder = 3 months usage + min buffer, minimum 2x min_stock
  const reorder = Math.max(mat.min_stock_ml * 2, monthlyUsage * 3);
  return Math.round(reorder);
}

// ── Reorder List ───────────────────────────────────────────────

export function generateReorderList(): ReorderList {
  const db = getDb();
  createPackagingInventoryTable();

  // Raw materials needing reorder
  const stockItems = checkStockLevels();
  const needsReorder = stockItems.filter(i => i.alert_level !== "ok");

  // Packaging needing reorder
  const pkgItems = db.prepare(`
    SELECT type, current_count, min_alert FROM packaging_inventory
  `).all() as { type: string; current_count: number; min_alert: number }[];

  const packagingAlerts: PackagingItem[] = pkgItems
    .map(p => {
      const cfg = PACKAGING_DEFAULTS[p.type];
      if (!cfg) return null;
      return {
        type: p.type as any,
        label: cfg.label,
        current: p.current_count,
        min_alert: p.min_alert,
        alert_level: getAlertLevel(p.current_count, p.min_alert),
        estimated_unit_cost: cfg.unit_cost,
      };
    })
    .filter(Boolean) as PackagingItem[];
  const pkgAlerts = packagingAlerts.filter(p => p.alert_level !== "ok");

  // Total estimate
  const matCost = needsReorder.reduce((s, i) => s + i.estimated_cost, 0);
  const pkgCost = pkgAlerts.reduce((s, p) => s + (p.min_alert * 2 - p.current) * p.estimated_unit_cost, 0);

  return {
    raw_materials: needsReorder,
    packaging: pkgAlerts,
    total_estimate_cost: matCost + pkgCost,
    generated_at: new Date().toISOString(),
  };
}

export function getReorderCostEstimate(): { cost: number; item_count: number; currency: string } {
  const list = generateReorderList();
  return {
    cost: list.total_estimate_cost,
    item_count: list.raw_materials.length + list.packaging.length,
    currency: "IDR",
  };
}

// ── Packaging Management ───────────────────────────────────────

export function updatePackagingStock(type: string, delta: number, reason?: string): boolean {
  const db = getDb();
  createPackagingInventoryTable();

  const current = db.prepare("SELECT current_count FROM packaging_inventory WHERE type = ?").get(type) as { current_count: number } | undefined;
  if (!current) return false;

  const newCount = Math.max(0, current.current_count + delta);
  db.prepare("UPDATE packaging_inventory SET current_count = ?, updated_at = datetime('now') WHERE type = ?").run(newCount, type);

  // Log movement
  db.prepare("INSERT INTO stock_movements (item_type, change_amount, reason) VALUES (?, ?, ?)").run(type, delta, reason || "manual_adjustment");

  return true;
}

export function checkPackagingAlerts(): PackagingItem[] {
  createPackagingInventoryTable();

  const stockItems = checkStockLevels();
  const db = getDb();
  const pkgItems = db.prepare("SELECT type, current_count, min_alert FROM packaging_inventory").all() as { type: string; current_count: number; min_alert: number }[];

  return pkgItems
    .map(p => {
      const cfg = PACKAGING_DEFAULTS[p.type];
      if (!cfg) return null;
      return {
        type: p.type as any,
        label: cfg.label,
        current: p.current_count,
        min_alert: p.min_alert,
        alert_level: getAlertLevel(p.current_count, p.min_alert),
        estimated_unit_cost: cfg.unit_cost,
      };
    })
    .filter((p): p is PackagingItem => p !== null);
}

// ── Stock Update (raw materials) ───────────────────────────────

export function updateRawMaterialStock(materialId: number, delta: number, reason?: string): boolean {
  const db = getDb();
  const mat = db.prepare("SELECT stock_ml FROM raw_materials WHERE id = ?").get(materialId) as { stock_ml: number } | undefined;
  if (!mat) return false;

  const newStock = Math.max(0, mat.stock_ml + delta);
  db.prepare("UPDATE raw_materials SET stock_ml = ?, updated_at = datetime('now') WHERE id = ?").run(newStock, materialId);

  // Log movement
  db.prepare("INSERT INTO stock_movements (item_type, item_id, change_amount, reason) VALUES ('raw_material', ?, ?, ?)").run(materialId, delta, reason || "manual_adjustment");

  return true;
}
