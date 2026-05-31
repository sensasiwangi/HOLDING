import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const investors = db.prepare(`
      SELECT i.*,
        (SELECT COALESCE(SUM(si.jumlah_investasi), 0) FROM sukuk_investments si WHERE si.investor_id = i.id AND si.status = 'active') as total_investasi,
        (SELECT COUNT(DISTINCT si.sukuk_id) FROM sukuk_investments si WHERE si.investor_id = i.id AND si.status = 'active') as jumlah_sukuk
      FROM investors i ORDER BY i.created_at DESC
    `).all();
    return NextResponse.json({ investors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, phone, ktp, npwp, alamat, bank, rekening } = body;
    if (!nama || !email) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
    }
    const existing = db.prepare('SELECT id FROM investors WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }
    const result = db.prepare(`
      INSERT INTO investors (nama, email, phone, ktp, npwp, alamat, bank, rekening, status, kyc_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unverified')
    `).run(nama, email, phone || null, ktp || null, npwp || null, alamat || null, bank || null, rekening || null);
    return NextResponse.json({ id: result.lastInsertRowid, ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
