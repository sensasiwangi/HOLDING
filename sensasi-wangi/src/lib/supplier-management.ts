// src/lib/supplier-management.ts
// P2-2: Supplier Management
// Manajemen supplier bahan baku + packaging, PO, lead time tracking

import { getDb } from "./swi-db";

// ── Types ──────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  category: string; // "raw_material", "packaging", "equipment", "service"
  rating: number; // 1-5
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name: string | null;
  status: "draft" | "sent" | "confirmed" | "partial" | "received" | "cancelled";
  total_amount: number;
  expected_delivery: string | null;
  actual_delivery: string | null;
  lead_time_days: number | null;
  notes: string | null;
  created_at: string;
}

export interface POLineItem {
  id: number;
  po_id: number;
  material_id: number | null;
  material_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  received_qty: number;
}

export interface SupplierPerformance {
  supplier_id: number;
  supplier_name: string;
  total_pos: number;
  on_time_deliveries: number;
  late_deliveries: number;
  on_time_rate_pct: number;
  avg_lead_time_days: number;
  total_spent: number;
  rating: number;
}

// ── Schema ─────────────────────────────────────────────────────

export function createSupplierTables(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      category TEXT DEFAULT 'raw_material',
      rating INTEGER DEFAULT 3 CHECK(rating BETWEEN 1 AND 5),
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled')),
      total_amount INTEGER DEFAULT 0,
      expected_delivery TEXT,
      actual_delivery TEXT,
      lead_time_days INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS po_line_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      material_id INTEGER,
      material_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT DEFAULT 'ml',
      unit_price INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      received_qty INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
    CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
    CREATE INDEX IF NOT EXISTS idx_po_line_po ON po_line_items(po_id);
  `);
}

// ── Supplier CRUD ──────────────────────────────────────────────

export function addSupplier(data: Omit<Supplier, "id" | "created_at">): number {
  const db = getDb();
  createSupplierTables();

  const info = db.prepare(`
    INSERT INTO suppliers (name, contact_person, phone, email, address, category, rating, is_active, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.name, data.contact_person, data.phone, data.email, data.address, data.category, data.rating, data.is_active ? 1 : 0, data.notes);

  return info.lastInsertRowid as number;
}

export function getSuppliers(category?: string): Supplier[] {
  const db = getDb();
  createSupplierTables();

  if (category) {
    return db.prepare("SELECT * FROM suppliers WHERE category = ? AND is_active = 1 ORDER BY name").all(category) as Supplier[];
  }
  return db.prepare("SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name").all() as Supplier[];
}

export function getSupplier(id: number): Supplier | null {
  const db = getDb();
  createSupplierTables();
  return db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id) as Supplier | null;
}

export function updateSupplier(id: number, data: Partial<Omit<Supplier, "id" | "created_at">>): boolean {
  const db = getDb();
  createSupplierTables();

  const sets: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      sets.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (sets.length === 0) return false;

  sets.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE suppliers SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  return true;
}

// ── Purchase Order ─────────────────────────────────────────────

export function createPO(supplierId: number, items: Omit<POLineItem, "id" | "po_id" | "total_price">[], expectedDelivery?: string, notes?: string): string {
  const db = getDb();
  createSupplierTables();

  const supplier = getSupplier(supplierId);
  if (!supplier) throw new Error("Supplier tidak ditemukan");

  // Generate PO number: PO-YYYYMMDD-XXX
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = db.prepare("SELECT COUNT(*) as c FROM purchase_orders WHERE po_number LIKE ?").get(`PO-${date}%`) as { c: number };
  const poNumber = `PO-${date}-${String((count.c || 0) + 1).padStart(3, "0")}`;

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  const info = db.prepare(`
    INSERT INTO purchase_orders (po_number, supplier_id, total_amount, expected_delivery, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(poNumber, supplierId, totalAmount, expectedDelivery || null, notes || null);

  const poId = info.lastInsertRowid as number;

  const stmt = db.prepare(`
    INSERT INTO po_line_items (po_id, material_id, material_name, quantity, unit, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    stmt.run(poId, item.material_id, item.material_name, item.quantity, item.unit, item.unit_price, item.quantity * item.unit_price);
  }

  return poNumber;
}

export function getPOs(status?: string): (PurchaseOrder & { line_items: POLineItem[] })[] {
  const db = getDb();
  createSupplierTables();

  let pos: any[];
  if (status) {
    pos = db.prepare("SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON s.id = po.supplier_id WHERE po.status = ? ORDER BY po.created_at DESC").all(status);
  } else {
    pos = db.prepare("SELECT po.*, s.name as supplier_name FROM purchase_orders po LEFT JOIN suppliers s ON s.id = po.supplier_id ORDER BY po.created_at DESC").all();
  }

  return pos.map(po => ({
    id: po.id,
    po_number: po.po_number,
    supplier_id: po.supplier_id,
    supplier_name: po.supplier_name,
    status: po.status,
    total_amount: po.total_amount,
    expected_delivery: po.expected_delivery,
    actual_delivery: po.actual_delivery,
    lead_time_days: po.lead_time_days,
    notes: po.notes,
    created_at: po.created_at,
    line_items: db.prepare("SELECT * FROM po_line_items WHERE po_id = ?").all(po.id) as POLineItem[],
  }));
}

export function updatePOStatus(poId: number, status: PurchaseOrder["status"], actualDelivery?: string): boolean {
  const db = getDb();
  createSupplierTables();

  const po = db.prepare("SELECT * FROM purchase_orders WHERE id = ?").get(poId) as any;
  if (!po) return false;

  let leadTime: number | null = po.lead_time_days;
  if (status === "received" && actualDelivery) {
    const created = new Date(po.created_at);
    const delivered = new Date(actualDelivery);
    leadTime = Math.round((delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  db.prepare(`
    UPDATE purchase_orders SET status = ?, actual_delivery = ?, lead_time_days = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(status, actualDelivery || null, leadTime, poId);

  // If received, update stock
  if (status === "received") {
    const lineItems = db.prepare("SELECT * FROM po_line_items WHERE po_id = ?").all(poId) as POLineItem[];
    for (const item of lineItems) {
      if (item.material_id) {
        db.prepare("UPDATE raw_materials SET stock_ml = stock_ml + ?, updated_at = datetime('now') WHERE id = ?").run(item.quantity, item.material_id);
      }
      db.prepare("UPDATE po_line_items SET received_qty = quantity WHERE id = ?").run(item.id);
    }
  }

  return true;
}

// ── Supplier Performance ───────────────────────────────────────

export function getSupplierPerformance(): SupplierPerformance[] {
  const db = getDb();
  createSupplierTables();

  const suppliers = getSuppliers();
  return suppliers.map(s => {
    const pos = db.prepare("SELECT * FROM purchase_orders WHERE supplier_id = ? AND status IN ('received', 'partial')").all(s.id) as any[];

    const onTime = pos.filter(po => {
      if (!po.expected_delivery || !po.actual_delivery) return true;
      return new Date(po.actual_delivery) <= new Date(po.expected_delivery);
    }).length;

    const late = pos.length - onTime;
    const avgLead = pos.length > 0 ? pos.reduce((sum: number, po: any) => sum + (po.lead_time_days || 0), 0) / pos.length : 0;
    const totalSpent = pos.reduce((sum: number, po: any) => sum + po.total_amount, 0);

    return {
      supplier_id: s.id,
      supplier_name: s.name,
      total_pos: pos.length,
      on_time_deliveries: onTime,
      late_deliveries: late,
      on_time_rate_pct: pos.length > 0 ? Math.round((onTime / pos.length) * 100) : 0,
      avg_lead_time_days: Math.round(avgLead),
      total_spent: totalSpent,
      rating: s.rating,
    };
  });
}

// ── Lead Time Alert ────────────────────────────────────────────

export function getOverduePOs(): (PurchaseOrder & { supplier_name: string })[] {
  const db = getDb();
  createSupplierTables();

  return db.prepare(`
    SELECT po.*, s.name as supplier_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON s.id = po.supplier_id
    WHERE po.status IN ('sent', 'confirmed', 'partial')
      AND po.expected_delivery < date('now')
    ORDER BY po.expected_delivery ASC
  `).all() as any[];
}
