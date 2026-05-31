// POST /api/calculate/bagi-hasil — Preview bagi hasil calculation without saving
// POST /api/calculate/execute — Execute distribution + create payouts in one transaction

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";

/*
  Bagi Hasil Calculation Engine
  ==============================
  Formula:
    laba_kotor = revenue - cogs
    laba_bersih = laba_kotor - biaya_operasional - biaya_lain
    tim_fee = laba_bersih * tim_fee_pct / 100
    reserve_fund = laba_bersih * reserve_pct / 100
    bagi_hasil_total = laba_bersih - tim_fee - reserve_fund
    bagi_investor_total = bagi_hasil_total * nisbah_investor_pct / 100
    bagi_swi_total = bagi_hasil_total * nisbah_swi_pct / 100

  Per investor:
    investor_share = (investor_unit / total_unit_terjual) * bagi_investor_total
    pph = investor_share * 0.005 (PPh Final UMKM 0.5%)
    net_payout = investor_share - pph
*/

function computeDistribution(
  revenue: number, cogs: number, biayaOp: number, biayaLain: number,
  nisbahInv: number, nisbahSwi: number, timFeePct: number, reservePct: number,
  totalUnitTerjual: number, investorUnits: { investor_id: number; unit: number }[]
) {
  const labaKotor = revenue - cogs;
  const labaBersih = labaKotor - biayaOp - biayaLain;
  const timFee = labaBersih * (timFeePct / 100);
  const reserveFund = Math.max(0, labaBersih * (reservePct / 100));
  const bagiHasilTotal = Math.max(0, labaBersih - timFee - reserveFund);
  const bagiInvestorTotal = bagiHasilTotal * (nisbahInv / 100);
  const bagiSwiTotal = bagiHasilTotal * (nisbahSwi / 100);

  const investorPayouts = investorUnits.map(inv => {
    const share = totalUnitTerjual > 0 ? (inv.unit / totalUnitTerjual) * bagiInvestorTotal : 0;
    const pph = share * 0.005; // 0.5% PPh Final UMKM
    return {
      investor_id: inv.investor_id,
      unit: inv.unit,
      bagi_hasil: Math.round(share),
      pph: Math.round(pph),
      net_payout: Math.round(share - pph),
    };
  });

  return {
    laba_kotor: labaKotor,
    laba_bersih: labaBersih,
    tim_fee: Math.round(timFee),
    reserve_fund: Math.round(reserveFund),
    bagi_hasil_total: Math.round(bagiHasilTotal),
    bagi_investor_total: Math.round(bagiInvestorTotal),
    bagi_swi_total: Math.round(bagiSwiTotal),
    investor_payouts: investorPayouts,
    is_loss: labaBersih <= 0,
  };
}

// POST — Preview calculation (no save)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sukuk_id, periode, revenue, cogs, biaya_operasional, biaya_lain } = body;

    if (!sukuk_id || !periode || revenue === undefined || cogs === undefined) {
      return NextResponse.json(
        { success: false, error: "sukuk_id, periode, revenue, dan cots wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get sukuk config
    const sukuk = db.prepare("SELECT * FROM sukuk WHERE id = ?").get(sukuk_id) as any;
    if (!sukuk) return NextResponse.json({ success: false, error: "Sukuk tidak ditemukan" }, { status: 404 });

    // Get confirmed investors
    const investorUnits = db.prepare(`
      SELECT investor_id, unit FROM sukuk_investments 
      WHERE sukuk_id = ? AND status = 'confirmed'
    `).all(sukuk_id) as { investor_id: number; unit: number }[];

    const totalUnitTerjual = investorUnits.reduce((s, i) => s + i.unit, 0);

    if (totalUnitTerjual === 0) {
      return NextResponse.json({
        success: true,
        data: {
          preview: true,
          warning: "Belum ada investor confirmed. Distribution akan 0.",
          result: computeDistribution(
            revenue, cogs, biaya_operasional || 0, biaya_lain || 0,
            sukuk.nisbah_investor_pct, sukuk.nisbah_swi_pct,
            sukuk.tim_fee_pct, sukuk.reserve_pct,
            0, []
          ),
        },
      });
    }

    const result = computeDistribution(
      revenue, cogs, biaya_operasional || 0, biaya_lain || 0,
      sukuk.nisbah_investor_pct, sukuk.nisbah_swi_pct,
      sukuk.tim_fee_pct, sukuk.reserve_pct,
      totalUnitTerjual, investorUnits
    );

    // Get kumulatif sebelumnya
    const prevDist = db.prepare(`
      SELECT kumulatif_investor FROM profit_distributions 
      WHERE sukuk_id = ? ORDER BY periode DESC LIMIT 1
    `).get(sukuk_id) as { kumulatif_investor: number } | undefined;

    const prevKumulatif = prevDist?.kumulatif_investor || 0;
    const newKumulatif = prevKumulatif + result.bagi_investor_total;
    const returnOfCapitalPct = (newKumulatif / sukuk.nilai_sukuk) * 100;

    return NextResponse.json({
      success: true,
      data: {
        preview: true,
        sukuk: { kode: sukuk.kode, nama: sukuk.nama },
        periode,
        total_investor: investorUnits.length,
        total_unit: totalUnitTerjual,
        result: {
          ...result,
          kumulatif_investor: newKumulatif,
          return_of_capital_pct: returnOfCapitalPct.toFixed(2),
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
