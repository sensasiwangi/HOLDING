// src/app/api/laporan/route.ts
// Laporan API — Laporan bulanan, cashflow, budget vs actual
import { NextRequest, NextResponse } from "next/server";
import {
  generateLaporanBulanan,
  generateCashflow,
  generateBudgetVsActual,
  generateLaporanSummary,
} from "@/lib/laporan-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode") || new Date().toISOString().slice(0, 7);
    const type = searchParams.get("type") || "summary";

    switch (type) {
      case "bulanan": {
        const data = await generateLaporanBulanan(periode);
        return NextResponse.json({ success: true, periode, data });
      }
      case "cashflow": {
        const data = await generateCashflow(periode);
        return NextResponse.json({ success: true, periode, data });
      }
      case "bva": {
        const data = await generateBudgetVsActual(periode);
        return NextResponse.json({ success: true, periode, data });
      }
      case "summary":
      default: {
        const data = await generateLaporanSummary(periode);
        return NextResponse.json({ success: true, data });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
