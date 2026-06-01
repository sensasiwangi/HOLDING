// src/app/api/audit/route.ts
// Audit Trail API — Log aktivitas, verify chain, query trail
import { NextRequest, NextResponse } from "next/server";
import {
  logActivity,
  verifyChain,
  queryAuditTrail,
  getActivitySummary,
  type AuditAction,
} from "@/lib/audit-engine";

// GET /api/audit/trail    → query audit trail
// GET /api/audit/verify    → verify chain integrity
// GET /api/audit/summary   → activity summary
// POST /api/audit/log      → log aktivitas baru

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "trail";

    if (type === "verify") {
      const result = await verifyChain();
      return NextResponse.json({ success: true, ...result });
    }

    if (type === "summary") {
      const days = parseInt(searchParams.get("days") || "30", 10);
      const result = await getActivitySummary(days);
      return NextResponse.json({ success: true, ...result });
    }

    // Query trail
    const filters = {
      actor: searchParams.get("actor") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      entityId: searchParams.get("entityId") ? parseInt(searchParams.get("entityId")!) : undefined,
      action: (searchParams.get("action") || undefined) as AuditAction | undefined,
      fromDate: searchParams.get("from") || undefined,
      toDate: searchParams.get("to") || undefined,
    };

    const entries = await queryAuditTrail(filters);
    return NextResponse.json({ success: true, entries, count: entries.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = await logActivity({
      action: body.action || "view",
      actor: body.actor || "system",
      entityType: body.entityType || "system",
      entityId: body.entityId,
      description: body.description || "",
      oldValue: body.oldValue,
      newValue: body.newValue,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
