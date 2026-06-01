// src/app/api/produce/route.ts
// Flow 3: Start production batch
// Validate formula, check stock, deduct materials, create product batch + QC batch

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import { createQCTables, createQCBatch, getCheckItems } from "@/lib/qc-flow";
import { generateBatchNumber } from "@/lib/compliance-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      formula_id,
      batch_name,
      target_units,
      staff_name,
      notes,
    } = body;

    if (!formula_id) {
      return NextResponse.json(
        { success: false, error: "formula_id wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();
    createQCTables();

    // Ensure product_batches table exists with all needed columns
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_number TEXT UNIQUE NOT NULL,
        formula_id INTEGER NOT NULL,
        batch_name TEXT,
        status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'produced', 'matured', 'completed', 'shipped', 'cancelled')),
        qc_status TEXT DEFAULT 'pending',
        target_units INTEGER DEFAULT 1,
        produced_by TEXT,
        notes TEXT,
        sold_count INTEGER DEFAULT 0,
        maturation_start_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    const units = target_units || 1;

    // Validate formula exists
    const formula = db.prepare("SELECT * FROM formulas WHERE id = ?").get(formula_id) as any;
    if (!formula) {
      return NextResponse.json(
        { success: false, error: "Formula tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate formula status is 'confirmed'
    if (formula.status !== "confirmed") {
      return NextResponse.json(
        { success: false, error: `Formula status harus 'confirmed', saat ini: '${formula.status}'` },
        { status: 400 }
      );
    }

    // Get formula ingredients
    const ingredients = db.prepare(`
      SELECT fi.*, rm.name as material_name, rm.stock_ml
      FROM formula_ingredients fi
      JOIN raw_materials rm ON rm.id = fi.raw_material_id
      WHERE fi.formula_id = ?
      ORDER BY fi.display_order
    `).all(formula_id) as any[];

    if (ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Formula tidak memiliki ingredients" },
        { status: 400 }
      );
    }

    // Check stock sufficiency
    const missing: { name: string; needed: number; available: number }[] = [];
    for (const ing of ingredients) {
      // Use quantity_ml, fallback to quantity_grams (approximate 1:1 for perfume oils)
      const perUnit = ing.quantity_ml || ing.quantity_grams || 0;
      const needed = perUnit * units;
      if (ing.stock_ml < needed) {
        missing.push({
          name: ing.material_name,
          needed: Math.round(needed * 100) / 100,
          available: Math.round(ing.stock_ml * 100) / 100,
        });
      }
    }

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: "Stok tidak cukup",
        missing,
      });
    }

    // All stock sufficient — proceed with production
    const batchNumber = generateBatchNumber();
    const batchDisplayName = batch_name || batchNumber;

    // Insert product batch
    const batchInfo = db.prepare(`
      INSERT INTO product_batches (
        batch_number, formula_id, batch_name, status,
        target_units, produced_by, notes, created_at, updated_at
      ) VALUES (?, ?, ?, 'in_progress', ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      batchNumber,
      formula_id,
      batchDisplayName,
      units,
      staff_name || "system",
      notes || null
    );

    const productBatchId = batchInfo.lastInsertRowid as number;

    // Deduct stock and build materials_used list
    const materialsUsed: {
      raw_material_id: number;
      name: string;
      quantity_ml: number;
      quantity_grams: number;
      cost: number;
    }[] = [];

    const deductStmt = db.prepare(
      "UPDATE raw_materials SET stock_ml = stock_ml - ?, updated_at = datetime('now') WHERE id = ?"
    );
    const movementStmt = db.prepare(
      "INSERT INTO stock_movements (item_type, item_id, change_amount, reason) VALUES ('raw_material', ?, ?, ?)"
    );

    for (const ing of ingredients) {
      const perUnitMl = ing.quantity_ml || 0;
      const perUnitGrams = ing.quantity_grams || 0;
      const totalMl = perUnitMl * units;
      const totalGrams = perUnitGrams * units;

      deductStmt.run(totalMl, ing.raw_material_id);
      movementStmt.run(
        ing.raw_material_id,
        -totalMl,
        `production: batch ${batchNumber}, formula ${formula.formula_code}`
      );

      materialsUsed.push({
        raw_material_id: ing.raw_material_id,
        name: ing.material_name,
        quantity_ml: Math.round(totalMl * 100) / 100,
        quantity_grams: Math.round(totalGrams * 100) / 100,
        cost: ing.cost_at_time || 0,
      });
    }

    // Create QC batch for this product batch
    createQCBatch(productBatchId, batchDisplayName);
    const qcItems = getCheckItems();
    const qcBatchCreated = qcItems.length > 0;

    // Update formula status to 'mixed'
    db.prepare("UPDATE formulas SET status = 'mixed', updated_at = datetime('now') WHERE id = ?").run(formula_id);

    return NextResponse.json({
      success: true,
      batch_id: productBatchId,
      batch_number: batchNumber,
      materials_used: materialsUsed,
      qc_batch_created: qcBatchCreated,
      qc_check_items: qcItems.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
