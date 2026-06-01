// src/app/api/brands/route.ts
// Brand Calculator API
// GET /api/brands                    → semua brand summary
// GET /api/brands?brand=Store        → detail satu brand
// POST /api/brands/calculate         → hitung ulang & tulis summary ke sheet
import { NextRequest, NextResponse } from "next/server";
import {
  generateBrandReport,
  generateAllBrandReports,
  writeBrandSummary,
  calculateHoldingTotal,
  BRANDS,
} from "@/lib/brand-calculator";

// ── GET: Baca data brand ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    if (brand) {
      // Single brand detail
      if (!BRANDS.includes(brand)) {
        return NextResponse.json(
          { error: `Unknown brand: ${brand}`, available: BRANDS },
          { status: 400 }
        );
      }
      const report = await generateBrandReport(brand);
      return NextResponse.json(report);
    }

    // Semua brand
    const reports = await generateAllBrandReports();
    const holdingTotal = calculateHoldingTotal(reports);

    return NextResponse.json({
      brands: reports.map((r) => ({
        name: r.brand,
        summary: r.summary,
      })),
      holding: holdingTotal,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[brands GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch brand data", detail: err.message },
      { status: 500 }
    );
  }
}

// ── POST: Hitung ulang & tulis ke sheet ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");

    if (brand) {
      // Single brand — hitung & tulis summary
      const report = await writeBrandSummary(brand);
      return NextResponse.json({
        success: true,
        brand,
        summary: report.summary,
        message: `Summary ${brand} ditulis ke sheet`,
      });
    }

    // Semua brand
    const results = [];
    for (const b of BRANDS) {
      try {
        const report = await writeBrandSummary(b);
        results.push({ brand: b, summary: report.summary });
      } catch (e: any) {
        results.push({ brand: b, error: e.message });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: "Semua brand dihitung & ditulis ke sheet",
    });
  } catch (err: any) {
    console.error("[brands POST]", err);
    return NextResponse.json(
      { error: "Failed to calculate", detail: err.message },
      { status: 500 }
    );
  }
}
