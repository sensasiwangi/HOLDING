// src/app/api/finance/route.ts
// P1-4: Finance Reconciliation API
import { NextRequest, NextResponse } from "next/server";
import {
  generateReconciliationReport,
  getRevenueAnalysis,
  fixFormulaCostDiscrepancies,
  getDailySummary,
} from "@/lib/finance-reconciliation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const days = parseInt(searchParams.get("days") || "30");

  try {
    switch (action) {
      case "reconcile": {
        const report = generateReconciliationReport();
        return NextResponse.json({ success: true, report });
      }

      case "revenue": {
        const analysis = getRevenueAnalysis(days);
        return NextResponse.json({ success: true, ...analysis });
      }

      case "daily": {
        const daily = getDailySummary(days);
        return NextResponse.json({ success: true, daily });
      }

      case "fix": {
        const result = fixFormulaCostDiscrepancies();
        return NextResponse.json({ success: true, ...result });
      }

      default: {
        // Summary
        const report = generateReconciliationReport();
        const analysis = getRevenueAnalysis(days);
        return NextResponse.json({
          success: true,
          reconciliation: {
            checked: report.checked,
            matched: report.matched,
            mismatches: report.mismatches,
          },
          revenue: {
            total_revenue: analysis.total_revenue,
            total_cogs: analysis.total_cogs,
            total_profit: analysis.total_profit,
            avg_margin_pct: analysis.avg_margin_pct,
          },
          generated_at: report.generated_at,
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
