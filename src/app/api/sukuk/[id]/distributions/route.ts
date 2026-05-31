// GET /api/sukuk/[id]/distributions — List all distributions for a sukuk
// POST /api/sukuk/[id]/distributions — Create profit distribution for a periode

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../../lib/db";

// ============================================================
// GET — List all distributions for a sukuk
// ============================================================
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

    // Get all distributions ordered by periode
    const distributions = db
      .prepare(
        `
        SELECT * FROM profit_distributions 
        WHERE sukuk_id = ? 
        ORDER BY periode ASC
      `
      )
      .all(id);

    // Get payout summaries per distribution
    const payoutSummary = db
      .prepare(
        `
        SELECT 
          distribution_id,
          COUNT(*) as total_investor,
          SUM(bagi_hasil) as total_bagi_hasil,
          SUM(pph) as total_pph,
          SUM(net_payout) as total_net_payout,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as count_paid,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as count_pending
        FROM investor_payouts
        WHERE sukuk_id = ?
        GROUP BY distribution_id
      `
      )
      .all(id);

    // Build a map for quick lookup
    const payoutMap: Record<number, any> = {};
    for (const ps of payoutSummary) {
      payoutMap[(ps as any).distribution_id] = ps;
    }

    // Combine distributions with payout summaries
    const enriched = distributions.map((dist: any) => ({
      ...dist,
      payout_summary: payoutMap[dist.id] || null,
    }));

    // Cumulative totals
    const totals = {
      total_distributions: enriched.length,
      total_revenue: enriched.reduce(
        (sum: number, d: any) => sum + (d.revenue || 0),
        0
      ),
      total_laba_bersih: enriched.reduce(
        (sum: number, d: any) => sum + (d.laba_bersih || 0),
        0
      ),
      total_bagi_investor: enriched.reduce(
        (sum: number, d: any) => sum + (d.bagi_investor_total || 0),
        0
      ),
      total_bagi_swi: enriched.reduce(
        (sum: number, d: any) => sum + (d.bagi_swi_total || 0),
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
        distributions: enriched,
      },
      meta: totals,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — Create profit distribution for a periode
// Auto-computes bagi hasil based on revenue input
// ============================================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { periode, revenue, cogs, biaya_operasional, biaya_lain } = body;

    const errors: string[] = [];
    if (!periode) errors.push("Periode wajib diisi (format: YYYY-MM)");
    if (revenue === undefined || revenue === null || isNaN(Number(revenue)))
      errors.push("Revenue wajib diisi dan harus angka");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify sukuk exists
    const sukuk = db
      .prepare("SELECT * FROM sukuk WHERE id = ?")
      .get(id) as any;

    if (!sukuk) {
      return NextResponse.json(
        { success: false, error: "Sukuk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if distribution already exists for this periode
    const existing = db
      .prepare(
        "SELECT id FROM profit_distributions WHERE sukuk_id = ? AND periode = ?"
      )
      .get(id, periode);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Distribusi untuk periode '${periode}' sudah ada. Hapus dulu jika ingin menghitung ulang.`,
        },
        { status: 409 }
      );
    }

    // Get sukuk config for percentages
    const timFeePct = sukuk.tim_fee_pct || 10.0;
    const reservePct = sukuk.reserve_pct || 5.0;
    const nisbahInvestorPct = sukuk.nisbah_investor_pct || 42.5;
    const nisbahSwiPct = sukuk.nisbah_swi_pct || 42.5;

    // Convert inputs
    const rev = Number(revenue);
    const cogsVal = Number(cogs) || 0;
    const biayaOp = Number(biaya_operasional) || 0;
    const biayaLain = Number(biaya_lain) || 0;

    // ============================================================
    // BAGI HASIL CALCULATION
    // ============================================================
    const laba_kotor = rev - cogsVal;
    const laba_bersih = laba_kotor - biayaOp - biayaLain;
    const tim_fee = Math.floor(laba_bersih * (timFeePct / 100));
    const reserve_fund = Math.floor(laba_bersih * (reservePct / 100));
    const bagi_hasil_total = laba_bersih - tim_fee - reserve_fund;
    const bagi_investor_total = Math.floor(
      bagi_hasil_total * (nisbahInvestorPct / 100)
    );
    const bagi_swi_total = Math.floor(
      bagi_hasil_total * (nisbahSwiPct / 100)
    );

    // Get total confirmed units for this sukuk
    const unitInfo = db
      .prepare(
        `
        SELECT COALESCE(SUM(unit), 0) as total_unit_terjual
        FROM sukuk_investments
        WHERE sukuk_id = ? AND status = 'confirmed'
      `
      )
      .get(id) as { total_unit_terjual: number };

    const totalUnitTerjual = unitInfo.total_unit_terjual || 0;

    // ============================================================
    // Insert profit distribution
    // ============================================================
    const distResult = db
      .prepare(
        `
        INSERT INTO profit_distributions (
          sukuk_id, periode, revenue, cogs, biaya_operasional, biaya_lain,
          laba_kotor, laba_bersih, tim_fee, reserve_fund,
          bagi_hasil_total, bagi_investor_total, bagi_swi_total,
          kumulatif_investor, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'calculated')
      `
      ).run(
        id,
        periode,
        rev,
        cogsVal,
        biayaOp,
        biayaLain,
        laba_kotor,
        laba_bersih,
        tim_fee,
        reserve_fund,
        bagi_hasil_total,
        bagi_investor_total,
        bagi_swi_total,
        bagi_investor_total // kumulatif = this period's amount (first period)
      );

    const distributionId = distResult.lastInsertRowid as number;

    // ============================================================
    // Calculate & insert investor payouts
    // ============================================================
    let payoutCount = 0;
    if (totalUnitTerjual > 0 && bagi_investor_total > 0) {
      const confirmedInvestors = db
        .prepare(
          `
          SELECT si.investor_id, si.unit
          FROM sukuk_investments si
          WHERE si.sukuk_id = ? AND si.status = 'confirmed'
        `
        )
        .all(id) as { investor_id: number; unit: number }[];

      // Get previous cumulative
      const prevCum = db
        .prepare(
          `
          SELECT kumulatif_investor FROM profit_distributions
          WHERE sukuk_id = ? AND id < ?
          ORDER BY periode DESC LIMIT 1
        `
        )
        .get(id, distributionId) as { kumulatif_investor: number } | undefined;

      const prevCumulative = prevCum?.kumulatif_investor || 0;

      const insertPayout = db.prepare(`
        INSERT INTO investor_payouts (
          distribution_id, investor_id, sukuk_id, periode,
          unit, bagi_hasil, pph, net_payout, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `);

      let totalCalculatedPayout = 0;

      const insertMany = db.transaction(() => {
        for (const inv of confirmedInvestors) {
          // Each investor's proportional share
          const shareRatio = inv.unit / totalUnitTerjual;
          const bagi_hasil = Math.floor(bagi_investor_total * shareRatio);
          // PPh Final UMKM 0.5%
          const pph = Math.floor(bagi_hasil * 0.005);
          const net_payout = bagi_hasil - pph;

          insertPayout.run(
            distributionId,
            inv.investor_id,
            id,
            periode,
            inv.unit,
            bagi_hasil,
            pph,
            net_payout
          );
          totalCalculatedPayout += bagi_hasil;
          payoutCount++;
        }
      });

      insertMany();

      // Update kumulatif_investor
      db.prepare(
        "UPDATE profit_distributions SET kumulatif_investor = ? WHERE id = ?"
      ).run(prevCumulative + totalCalculatedPayout, distributionId);
    }

    // Fetch the created distribution
    const created = db
      .prepare("SELECT * FROM profit_distributions WHERE id = ?")
      .get(distributionId);

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: `Distribusi periode ${periode} berhasil dibuat. Laba bersih: Rp ${laba_bersih.toLocaleString("id-ID")}, Bagihasil investor: Rp ${bagi_investor_total.toLocaleString("id-ID")}, ${payoutCount} investor(s) tercatat.`,
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
