// src/app/api/suppliers/route.ts
// P2-2: Supplier Management API
import { NextRequest, NextResponse } from "next/server";
import {
  addSupplier,
  getSuppliers,
  updateSupplier,
  createPO,
  getPOs,
  updatePOStatus,
  getSupplierPerformance,
  getOverduePOs,
} from "@/lib/supplier-management";

import { getSupplier } from "@/lib/supplier-management";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const id = parseInt(searchParams.get("id") || "0");

  try {
    switch (action) {
      case "list":
        return NextResponse.json({ success: true, suppliers: getSuppliers(category) });

      case "detail":
        if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
        const s = getSupplier(id);
        return NextResponse.json({ success: true, supplier: s });

      case "pos":
        return NextResponse.json({ success: true, purchase_orders: getPOs(status) });

      case "performance":
        return NextResponse.json({ success: true, suppliers: getSupplierPerformance() });

      case "overdue":
        return NextResponse.json({ success: true, overdue: getOverduePOs() });

      default:
        return NextResponse.json({
          success: true,
          suppliers: getSuppliers(),
          performance: getSupplierPerformance(),
          overdue: getOverduePOs(),
        });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case "add_supplier": {
        const { name } = body;
        if (!name) return NextResponse.json({ success: false, error: "name required" }, { status: 400 });
        const id = addSupplier(body);
        return NextResponse.json({ success: true, id });
      }

      case "update_supplier": {
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
        updateSupplier(id, body);
        return NextResponse.json({ success: true });
      }

      case "create_po": {
        const { supplier_id, items, expected_delivery, notes } = body;
        if (!supplier_id || !items?.length) {
          return NextResponse.json({ success: false, error: "supplier_id & items required" }, { status: 400 });
        }
        const poNumber = createPO(supplier_id, items, expected_delivery, notes);
        return NextResponse.json({ success: true, po_number: poNumber });
      }

      case "update_po_status": {
        const { po_id, status, actual_delivery } = body;
        if (!po_id || !status) {
          return NextResponse.json({ success: false, error: "po_id & status required" }, { status: 400 });
        }
        updatePOStatus(po_id, status, actual_delivery);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: "Action tidak dikenal" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
