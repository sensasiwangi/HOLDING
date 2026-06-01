// src/app/api/bpom/route.ts
// P0-4: BPOM Registration Tracking

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import { createBPOMRegistration, getBPOMSummary } from "@/lib/compliance-engine";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const db = getDb();

    if (url.searchParams.get("summary") === "1") {
      return NextResponse.json(getBPOMSummary());
    }

    let sql = "SELECT * FROM bpom_registrations WHERE 1=1";
    const params: any[] = [];
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY created_at DESC LIMIT 100";

    const regs = db.prepare(sql).all(...params);
    return NextResponse.json(regs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const id = createBPOMRegistration(
      body.product_name,
      body.formula_id,
      body.product_batch_id,
      body.product_type || "kosmetik"
    );

    return NextResponse.json({ id, status: "draft" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const info = db.prepare(`
      UPDATE bpom_registrations SET
        status = ?, submitted_date = ?, approved_date = ?,
        expiry_date = ?, bpom_notes = ?, documents = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      body.status, body.submitted_date, body.approved_date,
      body.expiry_date, body.bpom_notes,
      JSON.stringify(body.documents || {}),
      body.id
    );

    return NextResponse.json({ updated: info.changes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
