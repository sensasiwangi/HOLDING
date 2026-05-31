// GET /api/investors — List all investors
// POST /api/investors — Create new investor

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { validateKTP, validateNPWP, validatePhone, validateEmail } from "../../../../lib/validation";

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").repeat(8).substring(0, 64);
}

export async function GET() {
  try {
    const db = getDb();
    const investors = db.prepare(`
      SELECT i.*, 
        COALESCE(SUM(si.unit), 0) as total_unit,
        COALESCE(SUM(si.nominal), 0) as total_investasi
      FROM investors i
      LEFT JOIN sukuk_investments si ON i.id = si.investor_id AND si.status != 'cancelled'
      GROUP BY i.id
      ORDER BY i.no ASC
    `).all();

    return NextResponse.json({ success: true, data: investors });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, jenis, ktp, npwp, phone, email, bank, rekening_number, rekening_name, alamat, sukuk_id, unit } = body;

    const errors: string[] = [];
    if (!nama) errors.push("Nama wajib diisi");

    const ktpV = validateKTP(ktp);
    if (!ktpV.valid) errors.push(ktpV.message);

    const npwpV = validateNPWP(npwp);
    if (!npwpV.valid) errors.push(npwpV.message);

    const phoneV = validatePhone(phone);
    if (!phoneV.valid) errors.push(phoneV.message);

    const emailV = validateEmail(email);
    if (!emailV.valid) errors.push(emailV.message);

    if (!bank || !rekening_number || !rekening_name) errors.push("Data rekening bank wajib diisi");

    const unitNum = Number(unit);
    if (isNaN(unitNum) || unitNum < 1 || unitNum > 500) errors.push("Unit harus 1-500");

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const db = getDb();

    // Check duplicate
    const ktpClean = ktp.replace(/[\s.\-]/g, "");
    const npwpClean = npwp.replace(/[\s.\-]/g, "");
    const phoneClean = phone.replace(/[\s\-()]/g, "").replace(/^\+62/, "0");

    const existing = db.prepare("SELECT id FROM investors WHERE ktp = ? OR npwp = ? OR email = ?").get(ktpClean, npwpClean, email);
    if (existing) {
      return NextResponse.json({ success: false, error: "Investor dengan KTP/NPWP/email sudah terdaftar" }, { status: 409 });
    }

    // Get next number
    const maxNo = db.prepare("SELECT MAX(no) as maxNo FROM investors").get() as { maxNo: number | null };
    const nextNo = (maxNo?.maxNo || 0) + 1;

    // Get active sukuk
    const sId = sukuk_id || (db.prepare("SELECT id FROM sukuk WHERE status = 'open' LIMIT 1").get() as { id: number } | undefined)?.id;
    if (!sId) return NextResponse.json({ success: false, error: "Tidak ada sukuk aktif" }, { status: 400 });

    const hargaRow = db.prepare("SELECT harga_unit, nilai_sukuk FROM sukuk WHERE id = ?").get(sId) as { harga_unit: number, nilai_sukuk: number };
    const hargaUnit = hargaRow?.harga_unit || 1000000;
    const nominal = unitNum * hargaUnit;
    const pctPortfolio = (nominal / (hargaRow?.nilai_sukuk || 1000000000) * 100);

    // Insert investor
    const result = db.prepare(`
      INSERT INTO investors (no, nama, jenis, ktp, npwp, phone, email, bank, rekening_number, rekening_name, alamat, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(nextNo, nama, jenis || "Perorangan", ktpClean, npwpClean, phoneClean, email, bank, rekening_number.replace(/\D/g, ""), rekening_name, alamat || null);

    const investorId = result.lastInsertRowid as number;

    // Insert investment
    db.prepare(`
      INSERT INTO sukuk_investments (sukuk_id, investor_id, unit, nominal, harga_per_unit, pct_portfolio, tanggal_setor, status)
      VALUES (?, ?, ?, ?, ?, ?, date('now'), 'pending')
    `).run(sId, investorId, unitNum, nominal, hargaUnit, pctPortfolio.toFixed(3));

    // Audit log
    const dataHash = simpleHash(`investor_${investorId}_${Date.now()}`);
    const prevEntry = db.prepare("SELECT data_hash FROM audit_log ORDER BY id DESC LIMIT 1").get() as { data_hash: string } | undefined;
    db.prepare(`
      INSERT INTO audit_log (action, actor, entity_type, entity_id, details, data_hash, prev_hash, verified)
      VALUES ('investor_registered', 'system', 'investor', ?, ?, ?, ?, 1)
    `).run(investorId, `Investor baru: ${nama} — ${unitNum} unit — Rp ${nominal.toLocaleString("id-ID")}`, dataHash, prevEntry?.data_hash || "0");

    return NextResponse.json({
      success: true,
      data: { id: investorId, no: nextNo, nama, unit: unitNum, nominal },
      message: "Investor berhasil terdaftar. Menunggu verifikasi KYC.",
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
