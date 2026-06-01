// src/app/api/hpp/route.ts
// HPP (Harga Pokok Produksi) API Routes
// Sensasi Wangi Indonesia
//
// Endpoints:
//   GET  /api/hpp?formulaId=X          — HPP breakdown untuk formula tertentu
//   POST /api/hpp/calculate            — Hitung HPP dengan custom input
//   GET  /api/hpp/projection           — Proyeksi profit
//   GET  /api/hpp/compare              — Bandingkan HPP antar formula

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import {
  calculateHpp,
  calculateHppCustom,
  calculateMargin,
  calculateBreakEven,
  calculateProfitProjection,
  getCostBreakdown,
  getHppHistory,
  compareHpp,
  DEFAULT_PACKAGING_COSTS,
  DEFAULT_PACKAGING_TOTAL,
  type PackagingCosts,
  type CostBreakdown,
} from "@/lib/hpp-calculator";
import type { FormulaIngredient } from "@/lib/formula-engine";

// ════════════════════════════════════════════
// GET — HPP Breakdown & Queries
// ════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const formulaId = url.searchParams.get("formulaId");
    const action = url.searchParams.get("action");

    // ── GET /api/hpp?formulaId=X ──
    // Ambil HPP breakdown untuk formula tertentu
    if (formulaId) {
      const id = Number(formulaId);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "formulaId harus berupa angka" },
          { status: 400 }
        );
      }

      const batchSize = Number(url.searchParams.get("batchSize")) || 1;
      const breakdown = calculateHpp(id, DEFAULT_PACKAGING_COSTS, batchSize);

      return NextResponse.json({
        success: true,
        data: breakdown,
      });
    }

    // ── GET /api/hpp?action=breakdown&formulaId=X ──
    // Rincian biaya per komponen (sama seperti di atas, lebih eksplisit)
    if (action === "breakdown") {
      const fid = url.searchParams.get("formulaId");
      if (!fid) {
        return NextResponse.json(
          { error: "Parameter formulaId diperlukan" },
          { status: 400 }
        );
      }

      const id = Number(fid);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "formulaId harus berupa angka" },
          { status: 400 }
        );
      }

      const breakdown = getCostBreakdown(id);
      return NextResponse.json({
        success: true,
        data: breakdown,
      });
    }

    // ── GET /api/hpp/projection ──
    // Proyeksi profit
    // Params: monthlyUnits, hpp, sellingPrice, months
    if (action === "projection") {
      const monthlyUnits = Number(url.searchParams.get("monthlyUnits"));
      const hpp = Number(url.searchParams.get("hpp"));
      const sellingPrice = Number(url.searchParams.get("sellingPrice"));
      const months = Number(url.searchParams.get("months")) || 12;

      if (isNaN(monthlyUnits) || isNaN(hpp) || isNaN(sellingPrice)) {
        return NextResponse.json(
          {
            error: "Parameter monthlyUnits, hpp, dan sellingPrice diperlukan",
            example: "/api/hpp?action=projection&monthlyUnits=50&hpp=18800&sellingPrice=45000&months=12",
          },
          { status: 400 }
        );
      }

      const projection = calculateProfitProjection(
        monthlyUnits,
        hpp,
        sellingPrice,
        months
      );

      return NextResponse.json({
        success: true,
        data: projection,
      });
    }

    // ── GET /api/hpp/compare ──
    // Bandingkan HPP antar formula
    // Params: ids (comma-separated formula IDs)
    if (action === "compare") {
      const idsParam = url.searchParams.get("ids");
      if (!idsParam) {
        return NextResponse.json(
          {
            error: "Parameter ids diperlukan (comma-separated formula IDs)",
            example: "/api/hpp?action=compare&ids=1,2,3",
          },
          { status: 400 }
        );
      }

      const ids = idsParam
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));

      if (ids.length === 0) {
        return NextResponse.json(
          { error: "Tidak ada formula ID yang valid" },
          { status: 400 }
        );
      }

      const comparison = compareHpp(ids);

      return NextResponse.json({
        success: true,
        count: comparison.length,
        data: comparison,
      });
    }

    // ── GET /api/hpp?action=history ──
    // Histori HPP per formula/batch
    if (action === "history") {
      const history = getHppHistory();
      return NextResponse.json({
        success: true,
        count: history.length,
        data: history,
      });
    }

    // ── GET /api/hpp?action=breakEven ──
    // Break-even analysis
    // Params: fixedCosts, contributionMargin, monthlyUnits
    if (action === "breakEven") {
      const fixedCosts = Number(url.searchParams.get("fixedCosts"));
      const contributionMargin = Number(url.searchParams.get("contributionMargin"));
      const monthlyUnits = url.searchParams.get("monthlyUnits")
        ? Number(url.searchParams.get("monthlyUnits"))
        : undefined;

      if (isNaN(fixedCosts) || isNaN(contributionMargin)) {
        return NextResponse.json(
          {
            error: "Parameter fixedCosts dan contributionMargin diperlukan",
            example: "/api/hpp?action=breakEven&fixedCosts=5000000&contributionMargin=30000&monthlyUnits=200",
          },
          { status: 400 }
        );
      }

      const breakEven = calculateBreakEven(fixedCosts, contributionMargin, monthlyUnits);

      return NextResponse.json({
        success: true,
        data: breakEven,
      });
    }

    // ── GET /api/hpp?action=margin ──
    // Quick margin calculation
    // Params: hpp, sellingPrice
    if (action === "margin") {
      const hpp = Number(url.searchParams.get("hpp"));
      const sellingPrice = Number(url.searchParams.get("sellingPrice"));

      if (isNaN(hpp) || isNaN(sellingPrice)) {
        return NextResponse.json(
          {
            error: "Parameter hpp dan sellingPrice diperlukan",
            example: "/api/hpp?action=margin&hpp=18800&sellingPrice=45000",
          },
          { status: 400 }
        );
      }

      const margin = calculateMargin(hpp, sellingPrice);

      return NextResponse.json({
        success: true,
        data: margin,
      });
    }

    // ── GET /api/hpp (default) ──
    // Return default packaging costs + info
    return NextResponse.json({
      success: true,
      message: "HPP Calculator API — Sensasi Wangi Indonesia",
      default_packaging_costs: DEFAULT_PACKAGING_COSTS,
      default_packaging_total: DEFAULT_PACKAGING_TOTAL,
      endpoints: {
        "GET /api/hpp?formulaId=X": "HPP breakdown untuk formula",
        "GET /api/hpp?action=breakdown&formulaId=X": "Rincian biaya per komponen",
        "GET /api/hpp?action=history": "Histori HPP semua formula",
        "GET /api/hpp?action=compare&ids=1,2,3": "Bandingkan HPP antar formula",
        "GET /api/hpp?action=margin&hpp=X&sellingPrice=Y": "Hitung margin",
        "GET /api/hpp?action=breakEven&fixedCosts=X&contributionMargin=Y": "Break-even analysis",
        "GET /api/hpp?action=projection&monthlyUnits=X&hpp=Y&sellingPrice=Z&months=N": "Profit projection",
        "POST /api/hpp/calculate": "Hitung HPP dengan custom input (JSON body)",
      },
    });
  } catch (error: any) {
    console.error("HPP API GET error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════
// POST — Calculate HPP with Custom Inputs
// ════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── POST /api/hpp/calculate ──
    // Hitung HPP dengan custom input (tanpa formula ID)
    if (action === "calculate" || !action) {
      const {
        ingredients,
        packaging_costs,
        selling_price = 0,
        batch_size = 1,
      } = body;

      // Validasi input
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return NextResponse.json(
          {
            error: "Field 'ingredients' diperlukan (array of FormulaIngredient)",
            example: {
              ingredients: [
                {
                  raw_material_id: 1,
                  name: "Bergamot",
                  quantity_ml: 1.5,
                  cost: 5000,
                },
              ],
              selling_price: 45000,
              batch_size: 10,
            },
          },
          { status: 400 }
        );
      }

      // Custom packaging costs (opsional)
      const pkgCosts: PackagingCosts = packaging_costs
        ? { ...DEFAULT_PACKAGING_COSTS, ...packaging_costs }
        : DEFAULT_PACKAGING_COSTS;

      // Hitung HPP custom
      const result = calculateHppCustom(
        ingredients as FormulaIngredient[],
        pkgCosts,
        selling_price,
        batch_size
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // ── POST /api/hpp/calculate?action=margin ──
    // Hitung margin dari body
    if (action === "margin") {
      const { hpp, selling_price } = body;

      if (typeof hpp !== "number" || typeof selling_price !== "number") {
        return NextResponse.json(
          { error: "Field 'hpp' dan 'selling_price' diperlukan (number)" },
          { status: 400 }
        );
      }

      const margin = calculateMargin(hpp, selling_price);

      return NextResponse.json({
        success: true,
        data: margin,
      });
    }

    // ── POST /api/hpp/calculate?action=breakEven ──
    // Break-even analysis dari body
    if (action === "breakEven") {
      const { fixed_costs, contribution_margin, monthly_units } = body;

      if (typeof fixed_costs !== "number" || typeof contribution_margin !== "number") {
        return NextResponse.json(
          {
            error: "Field 'fixed_costs' dan 'contribution_margin' diperlukan (number)",
          },
          { status: 400 }
        );
      }

      const breakEven = calculateBreakEven(
        fixed_costs,
        contribution_margin,
        monthly_units
      );

      return NextResponse.json({
        success: true,
        data: breakEven,
      });
    }

    // ── POST /api/hpp/calculate?action=projection ──
    // Profit projection dari body
    if (action === "projection") {
      const {
        monthly_units,
        hpp,
        selling_price,
        months = 12,
      } = body;

      if (
        typeof monthly_units !== "number" ||
        typeof hpp !== "number" ||
        typeof selling_price !== "number"
      ) {
        return NextResponse.json(
          {
            error: "Field 'monthly_units', 'hpp', dan 'selling_price' diperlukan (number)",
          },
          { status: 400 }
        );
      }

      const projection = calculateProfitProjection(
        monthly_units,
        hpp,
        selling_price,
        months
      );

      return NextResponse.json({
        success: true,
        data: projection,
      });
    }

    // ── POST /api/hpp/calculate?action=formula ──
    // Hitung HPP dari formula ID (POST version, mendukung custom packaging)
    if (action === "formula") {
      const { formula_id, packaging_costs, batch_size = 1 } = body;

      if (typeof formula_id !== "number") {
        return NextResponse.json(
          { error: "Field 'formula_id' diperlukan (number)" },
          { status: 400 }
        );
      }

      const pkgCosts: PackagingCosts = packaging_costs
        ? { ...DEFAULT_PACKAGING_COSTS, ...packaging_costs }
        : DEFAULT_PACKAGING_COSTS;

      const result = calculateHpp(formula_id, pkgCosts, batch_size);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { error: `Action '${action}' tidak dikenal` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("HPP API POST error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
