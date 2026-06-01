// src/app/api/compliance/route.ts
// P0-1: IFRA Compliance Check API
// P0-3: Allergen Label API

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import { checkCompliance, saveComplianceCheck, generateAllergenLabel } from "@/lib/compliance-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "check") {
      // Check compliance for a formula
      const { ingredients, productCategory, bottleSize } = body;
      const result = checkCompliance(ingredients, productCategory || "CAT4", bottleSize || 30);

      // Save check result if formula_id provided
      if (body.formula_id) {
        saveComplianceCheck(body.formula_id, result);
      }

      return NextResponse.json(result);
    }

    if (action === "label") {
      // Generate allergen label
      const { formula_id, ingredients, productName } = body;
      const label = generateAllergenLabel(
        formula_id || 0,
        ingredients,
        productName || "Sensasi Wangi"
      );
      return NextResponse.json(label);
    }

    if (action === "categories") {
      // Get all IFRA categories
      const db = getDb();
      const categories = db.prepare("SELECT * FROM ifra_categories ORDER BY category_code").all();
      return NextResponse.json(categories);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Compliance API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const formulaId = url.searchParams.get("formula_id");
    const db = getDb();

    if (formulaId) {
      // Get compliance history for a formula
      const checks = db.prepare(`
        SELECT * FROM compliance_checks
        WHERE formula_id = ?
        ORDER BY checked_at DESC
      `).all(Number(formulaId));

      const labels = db.prepare(`
        SELECT * FROM allergen_labels
        WHERE formula_id = ?
        ORDER BY generated_at DESC LIMIT 1
      `).all(Number(formulaId));

      return NextResponse.json({ checks, labels });
    }

    // Get summary stats
    const stats = db.prepare(`
      SELECT
        overall_status,
        COUNT(*) as count
      FROM compliance_checks
      GROUP BY overall_status
    `).all();

    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
