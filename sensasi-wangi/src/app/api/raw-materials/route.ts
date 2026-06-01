import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const url = new URL(req.url);
  const family = url.searchParams.get("family");
  const note = url.searchParams.get("note");
  const search = url.searchParams.get("search");
  const shelf = url.searchParams.get("shelf");
  const id = url.searchParams.get("id");

  // Single material detail
  if (id) {
    const mat = db.prepare(`
      SELECT rm.*, cf.drops_per_ml, cf.specific_gravity,
             dv.variant_name, dv.dilution_percent as dv_dilution, dv.shelf_label
      FROM raw_materials rm
      LEFT JOIN conversion_factors cf ON cf.raw_material_id = rm.id
      LEFT JOIN dilution_variants dv ON dv.raw_material_id = rm.id AND dv.is_active = 1
      WHERE rm.id = ?
    `).all(Number(id));
    return NextResponse.json(mat);
  }

  // Shelf display (etalase)
  if (shelf === "1") {
    const materials = db.prepare(`
      SELECT rm.id, rm.name, rm.display_name_on_shelf, rm.family, rm.note_position,
             rm.stock_ml, rm.dilution_percent, rm.dilution_solvent, rm.is_diluted,
             rm.odor_profile, rm.price_per_5ml,
             rm.stock_ml > 0 as has_stock,
             dv.shelf_label
      FROM raw_materials rm
      LEFT JOIN dilution_variants dv ON dv.raw_material_id = rm.id AND dv.is_active = 1
      WHERE rm.kategori_rm NOT IN ('solvent', 'eco_base')
        AND rm.is_diluted = 0
      ORDER BY rm.family, rm.note_position, rm.name
    `).all();
    return NextResponse.json(materials);
  }

  // Search
  if (search) {
    const mats = db.prepare(`
      SELECT * FROM raw_materials
      WHERE (name LIKE ? OR odor_profile LIKE ? OR synonym LIKE ?)
        AND kategori_rm NOT IN ('solvent', 'eco_base')
      ORDER BY name
      LIMIT 20
    `).all(`%${search}%`, `%${search}%`, `%${search}%`);
    return NextResponse.json(mats);
  }

  // Filtered list
  let sql = "SELECT * FROM raw_materials WHERE 1=1";
  const params: any[] = [];
  if (family) { sql += " AND family = ?"; params.push(family); }
  if (note) { sql += " AND note_position = ?"; params.push(note); }
  sql += " ORDER BY family, name LIMIT 200";

  const materials = db.prepare(sql).all(...params);
  return NextResponse.json(materials);
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const result = db.prepare(`
      UPDATE raw_materials SET
        stock_ml = ?, price_per_5ml = ?, price_per_10ml = ?,
        price_per_50ml = ?, price_per_100ml = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(body.stock_ml, body.price_per_5ml, body.price_per_10ml,
      body.price_per_50ml, body.price_per_100ml, body.id);

    return NextResponse.json({ updated: result.changes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
