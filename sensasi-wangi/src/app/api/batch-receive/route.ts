// src/app/api/batch-receive/route.ts
// Flow 1: Receive raw material batch
// POST: Receive a new raw material batch, update stock, log movement

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import { createPackagingInventoryTable } from "@/lib/inventory-alert";
import { createSupplierTables } from "@/lib/supplier-management";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplier_id,
      material_name,
      material_id,
      quantity_ml,
      unit_cost,
      batch_number,
      expiry_date,
      qc_status,
      checked_by,
    } = body;

    // Validate required fields
    if (!material_name || !quantity_ml || !batch_number) {
      return NextResponse.json(
        { success: false, error: "material_name, quantity_ml, dan batch_number wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();
    createSupplierTables();
    createPackagingInventoryTable();

    // Ensure raw_material_batches table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS raw_material_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lot_number TEXT UNIQUE,
        raw_material_id INTEGER,
        supplier_id INTEGER,
        supplier_name TEXT,
        supplier_batch TEXT,
        received_date TEXT DEFAULT (datetime('now')),
        expiry_date TEXT,
        quantity_ml REAL NOT NULL,
        remaining_ml REAL NOT NULL,
        cost_per_ml REAL DEFAULT 0,
        quality_status TEXT DEFAULT 'pending',
        storage_location TEXT,
        received_by TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Resolve raw_material_id from name if not provided
    let resolvedMaterialId = material_id;
    if (!resolvedMaterialId) {
      const mat = db.prepare("SELECT id FROM raw_materials WHERE name = ? OR synonym = ? LIMIT 1").get(material_name, material_name) as { id: number } | undefined;
      if (mat) {
        resolvedMaterialId = mat.id;
      }
    }

    // Resolve supplier name if supplier_id provided
    let supplierName: string | null = null;
    if (supplier_id) {
      const sup = db.prepare("SELECT name FROM suppliers WHERE id = ?").get(supplier_id) as { name: string } | undefined;
      supplierName = sup?.name || null;
    }

    // Determine initial quality status
    const initialQcStatus = qc_status || "pending";

    // Insert raw material batch record
    const lotNumber = batch_number || `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
    const batchInfo = db.prepare(`
      INSERT INTO raw_material_batches (
        lot_number, raw_material_id, supplier_id, supplier_name, supplier_batch,
        received_date, expiry_date, quantity_ml, remaining_ml,
        cost_per_ml, quality_status, received_by
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?)
    `).run(
      lotNumber,
      resolvedMaterialId || null,
      supplier_id || null,
      supplierName,
      batch_number,
      expiry_date || null,
      quantity_ml,
      quantity_ml,
      unit_cost ? (unit_cost / quantity_ml) : 0,
      initialQcStatus,
      checked_by || "system"
    );

    const batchId = batchInfo.lastInsertRowid as number;

    // Update raw_materials stock
    let newStockMl = 0;
    if (resolvedMaterialId) {
      if (initialQcStatus === "failed") {
        // Quarantine: set stock to 0 (do not add)
        const current = db.prepare("SELECT stock_ml FROM raw_materials WHERE id = ?").get(resolvedMaterialId) as { stock_ml: number } | undefined;
        if (current) {
          // Move current stock to quarantine (set to 0)
          db.prepare("UPDATE raw_materials SET stock_ml = 0, updated_at = datetime('now') WHERE id = ?").run(resolvedMaterialId);
          newStockMl = 0;
        }
      } else {
        // passed or pending: add to stock
        db.prepare("UPDATE raw_materials SET stock_ml = stock_ml + ?, updated_at = datetime('now') WHERE id = ?").run(quantity_ml, resolvedMaterialId);
        const updated = db.prepare("SELECT stock_ml FROM raw_materials WHERE id = ?").get(resolvedMaterialId) as { stock_ml: number };
        newStockMl = updated.stock_ml;
      }
    }

    // Insert stock movement record
    const movementChange = initialQcStatus === "failed" ? 0 : quantity_ml;
    db.prepare(`
      INSERT INTO stock_movements (item_type, item_id, change_amount, reason)
      VALUES ('raw_material', ?, ?, ?)
    `).run(
      resolvedMaterialId || 0,
      movementChange,
      `batch_receive: ${lotNumber} | qc: ${initialQcStatus}`
    );

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      lot_number: lotNumber,
      new_stock_ml: newStockMl,
      qc_status: initialQcStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
