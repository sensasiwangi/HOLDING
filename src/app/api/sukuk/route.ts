// GET /api/sukuk — List all sukuk with progress summary
// POST /api/sukuk — Create new sukuk

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

// ============================================================
// GET — List all sukuk with progress from v_sukuk_progress
// ============================================================
export async function GET() {
  try {
    const db = getDb();
    const sukukList = db.prepare(`
      SELECT * FROM v_sukuk_progress ORDER BY id ASC
    `).all();

    return NextResponse.json({
      success: true,
      data: sukukList,
      meta: { total: sukukList.length },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — Create new sukuk
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      kode,
      nama,
      jenis_akad,
      nilai_sukuk,
      harga_unit,
      total_unit,
      target_unit,
      nisbah_investor_pct,
      nisbah_swi_pct,
      tim_fee_pct,
      reserve_pct,
      tenor_bulan,
      start_date,
      end_date,
      status,
    } = body;

    // Validation
    const errors: string[] = [];
    if (!kode) errors.push("Kode sukuk wajib diisi");
    if (!nama) errors.push("Nama sukuk wajib diisi");
    if (!nilai_sukuk || nilai_sukuk <= 0)
      errors.push("Nilai sukuk harus > 0");
    if (!harga_unit || harga_unit <= 0)
      errors.push("Harga unit harus > 0");
    if (!total_unit || total_unit <= 0)
      errors.push("Total unit harus > 0");
    if (!target_unit || target_unit <= 0)
      errors.push("Target unit harus > 0");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check duplicate kode
    const existing = db
      .prepare("SELECT id FROM sukuk WHERE kode = ?")
      .get(kode);
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Sukuk dengan kode '${kode}' sudah ada` },
        { status: 409 }
      );
    }

    const result = db
      .prepare(
        `
        INSERT INTO sukuk (kode, nama, jenis_akad, nilai_sukuk, harga_unit, total_unit, target_unit, nisbah_investor_pct, nisbah_swi_pct, tim_fee_pct, reserve_pct, tenor_bulan, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        kode,
        nama,
        jenis_akad || "musyarakah",
        Number(nilai_sukuk),
        Number(harga_unit),
        Number(total_unit),
        Number(target_unit),
        Number(nisbah_investor_pct) || 42.5,
        Number(nisbah_swi_pct) || 42.5,
        Number(tim_fee_pct) || 10.0,
        Number(reserve_pct) || 5.0,
        Number(tenor_bulan) || 36,
        start_date || null,
        end_date || null,
        status || "draft"
      );

    const newSukuk = db
      .prepare("SELECT * FROM sukuk WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(
      {
        success: true,
        data: newSukuk,
        message: `Sukuk '${nama}' (${kode}) berhasil dibuat.`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
