import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sukuk = db.prepare('SELECT * FROM sukuk WHERE id = ?').get(id);
    if (!sukuk) return NextResponse.json({ error: 'Sukuk tidak ditemukan' }, { status: 404 });
    const investors = db.prepare(`
      SELECT si.*, i.nama, i.email, i.phone, i.status as investor_status
      FROM sukuk_investments si
      JOIN investors i ON i.id = si.investor_id
      WHERE si.sukuk_id = ? AND si.status = 'active'
      ORDER BY si.tanggal_investasi DESC
    `).all(id);
    return NextResponse.json({ sukuk, investors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    if (!status) return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    db.prepare("UPDATE sukuk SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
