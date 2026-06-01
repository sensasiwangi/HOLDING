// src/app/api/qc/route.ts
// P2-1: QC Check Flow API
import { NextRequest, NextResponse } from "next/server";
import {
  getCheckItems,
  createQCBatch,
  submitQCCheck,
  getQCBatchReport,
  getQCStats,
  completeQC,
} from "@/lib/qc-flow";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const batchId = parseInt(searchParams.get("batchId") || "0");
  const stage = searchParams.get("stage") as any;

  try {
    switch (action) {
      case "items":
        return NextResponse.json({ success: true, items: getCheckItems(stage) });

      case "report":
        if (!batchId) return NextResponse.json({ success: false, error: "batchId required" }, { status: 400 });
        return NextResponse.json({ success: true, report: getQCBatchReport(batchId) });

      case "stats":
        return NextResponse.json({ success: true, stats: getQCStats() });

      default:
        return NextResponse.json({ success: true, items: getCheckItems(), stats: getQCStats() });
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
      case "create_batch": {
        const { batch_id } = body;
        if (!batch_id) return NextResponse.json({ success: false, error: "batch_id required" }, { status: 400 });
        createQCBatch(batch_id, body.product_name);
        return NextResponse.json({ success: true, message: "QC batch created", items_count: getCheckItems().length });
      }

      case "submit_check": {
        const { batch_id, check_item_id, status, measured_value, notes, checked_by } = body;
        if (!batch_id || !check_item_id || !status) {
          return NextResponse.json({ success: false, error: "batch_id, check_item_id, status required" }, { status: 400 });
        }
        const id = submitQCCheck(batch_id, check_item_id, status, measured_value, notes, checked_by);
        return NextResponse.json({ success: true, id });
      }

      case "complete": {
        const { batch_id, approved_by } = body;
        if (!batch_id) return NextResponse.json({ success: false, error: "batch_id required" }, { status: 400 });
        const ok = completeQC(batch_id, approved_by);
        if (!ok) return NextResponse.json({ success: false, error: "QC tidak bisa di-complete, masih ada yang failed" }, { status: 400 });
        return NextResponse.json({ success: true, message: "QC approved" });
      }

      default:
        return NextResponse.json({ success: false, error: "Action tidak dikenal" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
