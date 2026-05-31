import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const investors = db.prepare(`
      SELECT si.id as investment_id, si.jumlah_investasi, si.tanggal_investasi, si.status as investment_status,
             i.id as investor_id, i.nama, i.email, i.phone, i.ktp, i.bank, i.rekening,
             COALESCE(SUM(ip.bagi_hasil), 0) as total_bagi_hasil_diterima
      FROM sukuk_investments si
      JOIN investors i ON i.id = si.investor_id
      LEFT JOIN investor_payouts ip ON ip.investor_id = i.id AND ip.sukuk_id = ?
      WHERE si.sukuk_id = ? AND si.status = 'active'
      GROUP BY i.id ORDER BY si.tanggal_investasi DESC
    `).all(id, id);
    return NextResponse.json({ investors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
