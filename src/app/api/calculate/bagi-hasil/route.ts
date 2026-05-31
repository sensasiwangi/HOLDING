import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sukuk_id, periode, total_bagi_hasil } = body;
    if (!sukuk_id || !periode || !total_bagi_hasil) {
      return NextResponse.json({ error: 'sukuk_id, periode, total_bagi_hasil wajib diisi' }, { status: 400 });
    }

    const investments = db.prepare(`
      SELECT si.investor_id, si.jumlah_investasi, i.nama
      FROM sukuk_investments si
      JOIN investors i ON i.id = si.investor_id
      WHERE si.sukuk_id = ? AND si.status = 'active'
    `).all(sukuk_id) as any[];

    const totalInvestasi = investments.reduce((sum, inv) => sum + inv.jumlah_investasi, 0);

    const payouts = investments.map(inv => {
      const pct = totalInvestasi > 0 ? (inv.jumlah_investasi / totalInvestasi) * 100 : 0;
      const amount = totalInvestasi > 0 ? (inv.jumlah_investasi / totalInvestasi) * total_bagi_hasil : 0;
      return { investor_id: inv.investor_id, nama: inv.nama, jumlah_investasi: inv.jumlah_investasi, persentase: Math.round(pct * 100) / 100, bagi_hasil: Math.round(amount) };
    });

    return NextResponse.json({
      sukuk_id, periode, total_bagi_hasil, total_investasi: totalInvestasi,
      jumlah_investor: investments.length, payouts
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
