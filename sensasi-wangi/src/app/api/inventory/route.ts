// src/app/api/inventory/route.ts
// P1-2: Inventory Reorder Alert API
import { NextRequest, NextResponse } from "next/server";
import {
  getStockStatus,
  generateReorderList,
  getReorderCostEstimate,
  updateRawMaterialStock,
  updatePackagingStock,
  checkPackagingAlerts,
  calculateReorderQuantity,
  getMonthlyUsage,
} from "@/lib/inventory-alert";

// ── GET ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "alerts": {
        const { alerts, summary } = getStockStatus();
        return NextResponse.json({ success: true, alerts, summary });
      }

      case "reorder": {
        const list = generateReorderList();
        return NextResponse.json({ success: true, ...list });
      }

      case "cost": {
        const estimate = getReorderCostEstimate();
        return NextResponse.json({ success: true, ...estimate });
      }

      case "packaging": {
        const items = checkPackagingAlerts();
        return NextResponse.json({ success: true, items });
      }

      case "usage": {
        const materialId = parseInt(searchParams.get("materialId") || "0");
        if (!materialId) return NextResponse.json({ success: false, error: "materialId required" }, { status: 400 });
        const usage = getMonthlyUsage(materialId);
        const reorderQty = calculateReorderQuantity(materialId);
        return NextResponse.json({ success: true, materialId, monthly_usage_ml: usage, suggested_reorder_ml: reorderQty });
      }

      default: {
        // Full stock status
        const { all, alerts, summary } = getStockStatus();
        const packaging = checkPackagingAlerts();
        return NextResponse.json({
          success: true,
          raw_materials: all,
          packaging,
          alerts,
          summary,
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, delta, reason } = body;

    if (!type || delta === undefined) {
      return NextResponse.json({ success: false, error: "type dan delta wajib diisi" }, { status: 400 });
    }

    let result = false;
    if (type === "raw_material") {
      if (!id) return NextResponse.json({ success: false, error: "id wajib untuk raw_material" }, { status: 400 });
      result = updateRawMaterialStock(id, delta, reason);
    } else {
      result = updatePackagingStock(type, delta, reason);
    }

    if (!result) {
      return NextResponse.json({ success: false, error: "Item tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Stok berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
