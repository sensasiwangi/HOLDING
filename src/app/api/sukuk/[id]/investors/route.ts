// GET /api/sukuk/[id]/investors — List investors for a specific sukuk with units + payouts

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../../lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Verify sukuk exists
    const sukuk = db
      .prepare("SELECT id, kode, nama FROM sukuk WHERE id = ?")
      .get(id);

    if (!sukuk) {
      return NextResponse.json(
        { success: false, error: "Sukuk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get investors with their investment units and payouts
    const investors = db
      .prepare(
        `
        SELECT 
          i.id as investor_id,
          i.no as investor_no,
          i.nama,
          i.jenis,
          i.email,
          i.phone,
          i.bank,
          i.rekening_number,
          i.rekening_name,
          i.status as investor_status,
          si.id as investment_id,
          si.unit,
          si.nominal,
          si.harga_per_unit,
          si.pct_portfolio,
          si.tanggal_setor,
          si.status as investment_status,
          si.created_at as investment_date,
          COALESCE(SUM(CASE WHEN ip.status = 'paid' THEN ip.bagi_hasil ELSE 0 END), 0) as total_bagi_hasil,
          COALESCE(SUM(CASE WHEN ip.status = 'paid' THEN ip.pph ELSE 0 END), 0) as total_pph,
          COALESCE(SUM(CASE WHEN ip.status = 'paid' THEN ip.net_payout ELSE 0 END), 0) as total_payout,
          COALESCE(SUM(CASE WHEN ip.status = 'pending' THEN ip.net_payout ELSE 0 END), 0) as pending_payout,
          COUNT(ip.id) as jumlah_distribusi
        FROM sukuk_investments si
        JOIN investors i ON si.investor_id = i.id
        LEFT JOIN investor_payouts ip ON ip.investor_id = i.id 
          AND ip.sukuk_id = si.sukuk_id
        WHERE si.sukuk_id = ?
        GROUP BY si.id
        ORDER BY i.no ASC
      `
      )
      .all(id);

    // Summary stats
    const summary = {
      total_investors: investors.length,
      total_unit: investors.reduce(
        (sum: number, inv: any) => sum + (inv.unit || 0),
        0
      ),
      total_nominal: investors.reduce(
        (sum: number, inv: any) => sum + (inv.nominal || 0),
        0
      ),
      total_payout: investors.reduce(
        (sum: number, inv: any) => sum + (inv.total_payout || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        sukuk: {
          id: (sukuk as any).id,
          kode: (sukuk as any).kode,
          nama: (sukuk as any).nama,
        },
        investors,
      },
      meta: summary,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
