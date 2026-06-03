// src/app/api/formula-save/route.ts
// Flow 2: Save AI-generated formula
// POST: Save formula, run compliance, generate allergen label
// GET: List all formulas with status
// PUT: Update formula status (draft → confirmed → mixed → completed)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import { saveFormula } from "@/lib/formula-engine";
import { checkCompliance, generateAllergenLabel } from "@/lib/compliance-engine";
import { createCrmTables, getCustomerByPhone } from "@/lib/crm";

// ── Type helpers ────────────────────────────────────────────────

interface ScentProfileInput {
  mood: string;
  intensity: number;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
}

interface FormulaResultInput {
  ingredients: any[];
  mixing_steps: any[];
  total_cost: number;
  total_concentrate_ml: number;
  total_alcohol_ml: number;
  maturation_days: number;
  formula_name?: string;
}

interface FormulaSaveBody {
  profile: ScentProfileInput;
  result: FormulaResultInput;
  input_type?: string;
  input_text?: string;
  visitor_phone?: string;
  auto_create_batch?: boolean;
}

interface FormulaStatusUpdate {
  formula_id: number;
  status: "draft" | "confirmed" | "mixed" | "matured" | "completed" | "cancelled";
}

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["confirmed", "cancelled"],
  confirmed: ["mixed", "cancelled"],
  mixed: ["matured", "cancelled"],
  matured: ["completed", "cancelled"],
  completed: [],
  cancelled: ["draft"],
};

// ── GET: List all formulas with status ──────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const db = getDb();

    let formulas: any[];
    if (status) {
      formulas = db.prepare(`
        SELECT f.*,
               COUNT(fi.id) as ingredient_count
        FROM formulas f
        LEFT JOIN formula_ingredients fi ON fi.formula_id = f.id
        WHERE f.status = ?
        GROUP BY f.id
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `).all(status, limit, offset);
    } else {
      formulas = db.prepare(`
        SELECT f.*,
               COUNT(fi.id) as ingredient_count
        FROM formulas f
        LEFT JOIN formula_ingredients fi ON fi.formula_id = f.id
        GROUP BY f.id
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `).all(limit, offset);
    }

    // Get total count
    const countResult = db.prepare("SELECT COUNT(*) as total FROM formulas").get() as { total: number };

    // Get status distribution
    const statusDist = db.prepare(
      "SELECT status, COUNT(*) as count FROM formulas GROUP BY status"
    ).all() as { status: string; count: number }[];

    const statusSummary: Record<string, number> = {
      draft: 0, confirmed: 0, mixed: 0, matured: 0, completed: 0, cancelled: 0,
    };
    for (const row of statusDist) {
      statusSummary[row.status] = row.count;
    }

    return NextResponse.json({
      success: true,
      formulas,
      total: countResult.total,
      status_summary: statusSummary,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ── POST: Save AI-generated formula ─────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: FormulaSaveBody & { auto_create_batch?: boolean } = await request.json();
    const {
      profile,
      result,
      input_type,
      input_text,
      visitor_phone,
      auto_create_batch,
    } = body;

    // Validate
    if (!profile || !result) {
      return NextResponse.json(
        { success: false, error: "profile dan result wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();
    createCrmTables();

    // Resolve visitor_id from phone if provided
    let visitorId: number | undefined;
    if (visitor_phone) {
      const visitor = getCustomerByPhone(visitor_phone);
      if (visitor) {
        visitorId = visitor.id;
      }
    }

    // Save formula using formula-engine
    const formulaId = saveFormula(
      profile as any,
      result as any,
      visitorId,
      input_type || "text_prompt",
      input_text
    );

    // Run compliance check
    const compliance = checkCompliance(
      result.ingredients,
      "CAT4",
      30 // default bottle size
    );

    // Save compliance result
    const complianceId = db.prepare(`
      INSERT INTO compliance_checks (
        formula_id, overall_status, product_category,
        total_concentration_percent, failing_ingredients,
        warnings, passed_checks, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      formulaId,
      compliance.overallStatus,
      compliance.productCategory,
      compliance.totalConcentration,
      JSON.stringify(compliance.failingIngredients),
      JSON.stringify(compliance.warnings),
      JSON.stringify(compliance.passedChecks),
      compliance.overallStatus === "fail" ? "Formula requires revision" : null
    );

    // Generate allergen label
    const allergenLabel = generateAllergenLabel(
      formulaId,
      result.ingredients,
      result.formula_name || `Formula #${formulaId}`,
      30,
      result.maturation_days || 14
    );

    // Optionally create product batch
    let productBatchCreated = false;
    let productBatchId: number | null = null;
    if (auto_create_batch && compliance.overallStatus !== "fail") {
      try {
        // Check stock first
        let allInStock = true;
        for (const ing of result.ingredients) {
          const mat = db.prepare("SELECT stock_ml FROM raw_materials WHERE id = ?").get(ing.raw_material_id) as { stock_ml: number } | undefined;
          if (!mat || mat.stock_ml < ing.quantity_ml) {
            allInStock = false;
            break;
          }
        }

        if (allInStock) {
          // Deduct stock and create batch
          const batchNumber = `SW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

          for (const ing of result.ingredients) {
            db.prepare("UPDATE raw_materials SET stock_ml = stock_ml - ?, updated_at = datetime('now') WHERE id = ?")
              .run(ing.quantity_ml, ing.raw_material_id);
            db.prepare("INSERT INTO stock_movements (item_type, item_id, change_amount, reason) VALUES ('raw_material', ?, ?, ?)")
              .run(ing.raw_material_id, -ing.quantity_ml, `auto_batch: formula ${formulaId}`);
          }

          const batchInfo = db.prepare(`
            INSERT INTO product_batches (batch_number, formula_id, batch_name, status, target_units, produced_by, created_at, updated_at)
            VALUES (?, ?, ?, 'planned', 1, 'auto', datetime('now'), datetime('now'))
          `).run(batchNumber, formulaId, result.formula_name || batchNumber);

          productBatchCreated = true;
          productBatchId = batchInfo.lastInsertRowid as number;
        }
      } catch (batchError: any) {
        // Batch creation failed but formula was saved — include warning
        console.warn("Auto batch creation failed:", batchError.message);
      }
    }

    return NextResponse.json({
      success: true,
      formula_id: formulaId,
      compliance: {
        id: complianceId.lastInsertRowid,
        status: compliance.overallStatus,
        total_concentration: compliance.totalConcentration,
        failing_count: compliance.failingIngredients.length,
        warning_count: compliance.warnings.length,
      },
      allergen_label: {
        id: formulaId,
        allergens: allergenLabel.allergens,
        warnings: allergenLabel.warnings,
        expiry: allergenLabel.expiryDate,
      },
      product_batch_created: productBatchCreated,
      product_batch_id: productBatchId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ── PUT: Update formula status ──────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body: FormulaStatusUpdate = await request.json();
    const { formula_id, status } = body;

    if (!formula_id || !status) {
      return NextResponse.json(
        { success: false, error: "formula_id dan status wajib diisi" },
        { status: 400 }
      );
    }

    const validStatuses = ["draft", "confirmed", "mixed", "matured", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get current formula
    const formula = db.prepare("SELECT * FROM formulas WHERE id = ?").get(formula_id) as any;
    if (!formula) {
      return NextResponse.json(
        { success: false, error: "Formula tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[formula.status] || [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Transisi status tidak valid: '${formula.status}' → '${status}'. Transisi yang diizinkan: ${allowedTransitions.join(", ") || "tidak ada"}`,
        current_status: formula.status,
      });
    }

    // Update status
    db.prepare(`
      UPDATE formulas
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, formula_id);

    // Log the transition
    db.prepare(`
      INSERT INTO stock_movements (item_type, item_id, change_amount, reason)
      VALUES ('formula', ?, 0, ?)
    `).run(
      formula_id,
      `status_transition: ${formula.status} → ${status}`
    );

    return NextResponse.json({
      success: true,
      formula_id,
      previous_status: formula.status,
      new_status: status,
      formula_code: formula.formula_code,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
