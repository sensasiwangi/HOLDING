import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sukuk = db.prepare(`
      SELECT s.*,
        (SELECT COALESCE(SUM(si.jumlah_investasi), 0) FROM sukuk_investments si WHERE si.sukuk_id = s.id AND si.status = 'active') as total_terkumpul,
        (SELECT COUNT(DISTINCT si.investor_id) FROM sukuk_investments si WHERE si.sukuk_id = s.id AND si.status = 'active') as jumlah_investor
      FROM sukuk s ORDER BY s.created_at DESC
    `).all();
    return NextResponse.json({ sukuk });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, kode, total_dana, imbal_hasil, tenor_bulan, tanggal_terbit, tanggal_jatuh_tempo, deskripsi } = body;
    if (!nama || !total_dana || !imbal_hasil) {
      return NextResponse.json({ error: 'Nama, total_dana, imbal_hasil wajib diisi' }, { status: 400 });
    }
    const result = db.prepare(`
      INSERT INTO sukuk (nama, kode, total_dana, imbal_hasil, tenor_bulan, tanggal_terbit, tanggal_jatuh_tempo, status, deskripsi)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(nama, kode || null, total_dana, imbal_hasil, tenor_bulan || null, tanggal_terbit || null, tanggal_jatuh_tempo || null, deskripsi || null);
    return NextResponse.json({ id: result.lastInsertRowid, ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
