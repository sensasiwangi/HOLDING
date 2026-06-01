// src/app/api/batches/route.ts
// P0-2: Batch Traceability API

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import { generateBatchNumber, generateLotNumber, createProductBatch, getTraceabilityReport } from "@/lib/compliance-engine";

// ── Product Batches ──────────────────────────
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const batchNumber = url.searchParams.get("batch_number");
    const formulaId = url.searchParams.get("formula_id");
    const status = url.searchParams.get("status");
    const db = getDb();

    if (batchNumber) {
      const report = getTraceabilityReport(batchNumber);
      if (!report) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
      return NextResponse.json(report);
    }

    let sql = "SELECT pb.*, f.formula_code, f.ai_mood, f.concentration_type FROM product_batches pb JOIN formulas f ON f.id = pb.formula_id WHERE 1=1";
    const params: any[] = [];

    if (formulaId) { sql += " AND pb.formula_id = ?"; params.push(Number(formulaId)); }
    if (status) { sql += " AND pb.status = ?"; params.push(status); }
    sql += " ORDER BY pb.created_at DESC LIMIT 100";

    const batches = db.prepare(sql).all(...params);
    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = getDb();

    if (action === "create") {
      const { formula_id, ingredients, produced_by } = body;
      const result = createProductBatch(formula_id, ingredients, produced_by || "system");
      return NextResponse.json(result);
    }

    if (action === "qc_update") {
      const { batch_id, qc_results, status } = body;
      db.prepare(`
        UPDATE product_batches SET qc_results = ?, status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(qc_results), status, batch_id);
      return NextResponse.json({ updated: true });
    }

    if (action === "mark_shipped") {
      const { batch_id } = body;
      db.prepare(`
        UPDATE product_batches SET status = 'shipped' WHERE id = ?
      `).run(batch_id);
      return NextResponse.json({ shipped: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Raw Material Batches ─────────────────────

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    if (body.action === "create_rm_batch") {
      const lotNumber = generateLotNumber(body.raw_material_id);
      const info = db.prepare(`
        INSERT INTO raw_material_batches (
          lot_number, raw_material_id, supplier_name, supplier_batch,
          received_date, expiry_date, quantity_ml, remaining_ml,
          cost_per_ml, quality_status, storage_location, received_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        lotNumber, body.raw_material_id, body.supplier_name,
        body.supplier_batch, body.received_date, body.expiry_date,
        body.quantity_ml, body.quantity_ml, body.cost_per_ml || 0,
        body.quality_status || "pending", body.storage_location,
        body.received_by, body.notes
      );

      return NextResponse.json({ lot_number: lotNumber, id: info.lastInsertRowid });
    }

    if (body.action === "qc_approve") {
      const { batch_id, test_results } = body;
      db.prepare(`
        UPDATE raw_material_batches SET quality_status = 'approved', test_results = ? WHERE id = ?
      `).run(JSON.stringify(test_results), batch_id);
      return NextResponse.json({ approved: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
