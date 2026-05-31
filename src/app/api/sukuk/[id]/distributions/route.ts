import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const distributions = db.prepare(`
      SELECT pd.*, u.username as created_by_user
      FROM profit_distributions pd
      LEFT JOIN users u ON u.id = pd.created_by
      WHERE pd.sukuk_id = ? ORDER BY pd.periode DESC
    `).all(id);
    return NextResponse.json({ distributions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { periode, total_bagi_hasil, catatan, created_by } = body;
    if (!periode || !total_bagi_hasil) {
      return NextResponse.json({ error: 'Periode dan total_bagi_hasil wajib diisi' }, { status: 400 });
    }

    const sukuk = db.prepare('SELECT * FROM sukuk WHERE id = ?').get(id) as any;
    if (!sukuk) return NextResponse.json({ error: 'Sukuk tidak ditemukan' }, { status: 404 });

    const investments = db.prepare(`
      SELECT si.id, si.investor_id, si.jumlah_investasi
      FROM sukuk_investments si WHERE si.sukuk_id = ? AND si.status = 'active'
    `).all(id) as any[];

    const totalInvestasi = investments.reduce((sum, inv) => sum + inv.jumlah_investasi, 0);
    const distResult = db.prepare(`
      INSERT INTO profit_distributions (sukuk_id, periode, total_bagi_hasil, total_investasi, catatan, status, created_by)
      VALUES (?, ?, ?, ?, ?, 'calculated', ?)
    `).run(id, periode, total_bagi_hasil, totalInvestasi, catatan || null, created_by || null);
    const distributionId = distResult.lastInsertRowid;

    const insertPayout = db.prepare(`
      INSERT INTO investor_payouts (distribution_id, investor_id, sukuk_id, jumlah_investasi, persentase, bagi_hasil, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `);
    for (const inv of investments) {
      const persentase = totalInvestasi > 0 ? (inv.jumlah_investasi / totalInvestasi) * 100 : 0;
      const bagiHasil = totalInvestasi > 0 ? (inv.jumlah_investasi / totalInvestasi) * total_bagi_hasil : 0;
      insertPayout.run(distributionId, inv.investor_id, id, inv.jumlah_investasi, persentase, bagiHasil);
    }

    return NextResponse.json({ id: distributionId, ok: true, investors_count: investments.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
