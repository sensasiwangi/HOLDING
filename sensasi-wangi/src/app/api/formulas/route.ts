import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const code = url.searchParams.get("code");

  if (code) {
    const formula = db.prepare("SELECT * FROM formulas WHERE formula_code = ?").get(code);
    if (!formula) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ingredients = db.prepare(`
      fi.*, rm.name, rm.family, rm.odor_profile, rm.is_diluted, rm.dilution_percent
      FROM formula_ingredients fi
      JOIN raw_materials rm ON rm.id = fi.raw_material_id
      WHERE fi.formula_id = ?
      ORDER BY fi.display_order
    `).all((formula as any).id);

    const steps = db.prepare("SELECT * FROM mixing_steps WHERE formula_id = ? ORDER BY step_number").all((formula as any).id);

    return NextResponse.json({ ...formula, ingredients, mixing_steps: steps });
  }

  let sql = "SELECT * FROM formulas";
  const params: any[] = [];
  if (status) { sql += " WHERE status = ?"; params.push(status); }
  sql += " ORDER BY created_at DESC LIMIT 50";

  const formulas = db.prepare(sql).all(...params);
  return NextResponse.json(formulas);
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const code = `SW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

    const result = db.prepare(`
      INSERT INTO formulas (
        formula_code, input_type, input_text, ai_mood, ai_scent_profile,
        ai_top_notes, ai_middle_notes, ai_base_notes, ai_intensity,
        ai_longevity_target, bottle_size_ml, concentration_type,
        concentration_percent, total_concentrate_ml, total_alcohol_ml,
        maturation_days, maturation_notes, total_cost, selling_price, status
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      code, body.input_type, body.input_text || null, body.ai_mood,
      JSON.stringify(body.scent_profile), JSON.stringify(body.scent_profile?.top_notes),
      JSON.stringify(body.scent_profile?.middle_notes), JSON.stringify(body.scent_profile?.base_notes),
      body.scent_profile?.intensity || 5, body.scent_profile?.longevity_target || "4-6 jam",
      30, "EDP", 15, body.total_concentrate_ml || 4.5, body.total_alcohol_ml || 25.5,
      body.maturation_days || 14, body.maturation_notes || "", body.total_cost || 0,
      body.selling_price || 0, "draft"
    );

    const formulaId = result.lastInsertRowid as number;

    // Insert ingredients
    if (body.ingredients?.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO formula_ingredients (formula_id, raw_material_id, quantity_drops,
          quantity_grams, quantity_ml, display_order, addition_step, step_label, cost_at_time)
        VALUES (?,?,?,?,?,?,?,?,?)
      `);
      for (const ing of body.ingredients) {
        stmt.run(formulaId, ing.raw_material_id, ing.quantity_drops, ing.quantity_grams,
          ing.quantity_ml, ing.display_order, ing.addition_step, ing.step_label, ing.cost || 0);
      }
    }

    // Insert mixing steps
    if (body.mixing_steps?.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO mixing_steps (formula_id, step_number, step_title, step_description,
          duration_seconds, animation_type, visual_color, ingredient_ids)
        VALUES (?,?,?,?,?,?,?,?)
      `);
      for (const step of body.mixing_steps) {
        stmt.run(formulaId, step.step_number, step.step_title, step.step_description,
          step.duration_seconds, step.animation_type, step.visual_color,
          JSON.stringify(step.ingredients?.map((i: any) => i.raw_material_id) || []));
      }
    }

    return NextResponse.json({ id: formulaId, formula_code: code, message: "Formula created" });
  } catch (error: any) {
    console.error("Formula save error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
