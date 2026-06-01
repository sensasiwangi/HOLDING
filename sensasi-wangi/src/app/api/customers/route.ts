// src/app/api/customers/route.ts
// P1-3: Customer CRM API
import { NextRequest, NextResponse } from "next/server";
import {
  getAllCustomers,
  getCustomerByPhone,
  getCustomerProfile,
  upsertCustomer,
  recordPurchase,
  getCustomerSegments,
  getTopCustomers,
  getRepeatRate,
  getAvgPurchaseValue,
  recommendFormula,
} from "@/lib/crm";

// ── GET ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const phone = searchParams.get("phone");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    switch (action) {
      case "segments": {
        const segments = getCustomerSegments();
        return NextResponse.json({ success: true, segments });
      }

      case "top": {
        const customers = getTopCustomers(limit);
        return NextResponse.json({ success: true, customers });
      }

      case "stats": {
        return NextResponse.json({
          success: true,
          repeat_rate_pct: getRepeatRate(),
          avg_purchase_value: getAvgPurchaseValue(),
          segments: getCustomerSegments(),
        });
      }

      case "recommend": {
        const cid = parseInt(searchParams.get("customerId") || "0");
        if (!cid) return NextResponse.json({ success: false, error: "customerId required" }, { status: 400 });
        const rec = recommendFormula(cid);
        return NextResponse.json({ success: true, ...rec });
      }

      case "profile": {
        if (!phone) return NextResponse.json({ success: false, error: "phone required" }, { status: 400 });
        const profile = getCustomerProfile(phone);
        if (!profile) return NextResponse.json({ success: false, error: "Pelanggan tidak ditemukan" }, { status: 404 });
        return NextResponse.json({ success: true, profile });
      }

      default: {
        const customers = getAllCustomers();
        return NextResponse.json({ success: true, customers, count: customers.length });
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
    const action = body.action;

    switch (action) {
      case "register": {
        const { name, phone, email, source, referred_by } = body;
        if (!phone) return NextResponse.json({ success: false, error: "phone wajib diisi" }, { status: 400 });
        const customer = upsertCustomer(name, phone, email, source, referred_by);
        return NextResponse.json({ success: true, customer });
      }

      case "purchase": {
        const { customer_id, amount, formula_id, formula_name, mood, notes } = body;
        if (!customer_id || !amount) {
          return NextResponse.json({ success: false, error: "customer_id dan amount wajib" }, { status: 400 });
        }
        const purchaseId = recordPurchase(customer_id, amount, formula_id, formula_name, mood, notes);
        const profile = getCustomerProfile(customer_id);
        return NextResponse.json({ success: true, purchase_id: purchaseId, customer: profile });
      }

      default:
        return NextResponse.json({ success: false, error: "Action tidak dikenal" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
