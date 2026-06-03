// src/app/api/sell/route.ts
// Flow 4: Record sale to customer
// POST: Upsert customer, record purchase, update batches, recalculate CLV
// GET: List recent sales

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import {
  upsertCustomer,
  recordPurchase,
  recalculateCLV,
  createCrmTables,
} from "@/lib/crm";
import { syncSaleToSheets } from "@/lib/sheets-sync-operational";

// ── GET: List recent sales ──────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const customerId = searchParams.get("customer_id");

    const db = getDb();
    createCrmTables();

    let purchases: any[];
    if (customerId) {
      purchases = db.prepare(`
        SELECT p.*, c.name as customer_name, c.phone as customer_phone,
               f.formula_code, f.ai_mood
        FROM purchases p
        JOIN customers c ON c.id = p.customer_id
        LEFT JOIN formulas f ON f.id = p.formula_id
        WHERE p.customer_id = ?
        ORDER BY p.created_at DESC
        LIMIT ?
      `).all(parseInt(customerId), limit);
    } else {
      purchases = db.prepare(`
        SELECT p.*, c.name as customer_name, c.phone as customer_phone,
               f.formula_code, f.ai_mood
        FROM purchases p
        JOIN customers c ON c.id = p.customer_id
        LEFT JOIN formulas f ON f.id = p.formula_id
        ORDER BY p.created_at DESC
        LIMIT ?
      `).all(limit);
    }

    return NextResponse.json({
      success: true,
      purchases,
      count: purchases.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ── POST: Record a sale ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_phone,
      formula_id,
      amount,
      payment_method,
      notes,
    } = body;

    if (!customer_phone || !amount) {
      return NextResponse.json(
        { success: false, error: "customer_phone dan amount wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();
    createCrmTables();

    // Get formula info for name and selling price comparison
    let formulaName: string | undefined;
    let sellingPriceDiff: number | null = null;
    if (formula_id) {
      const formula = db.prepare("SELECT formula_code, ai_mood, selling_price FROM formulas WHERE id = ?").get(formula_id) as any;
      if (formula) {
        formulaName = formula.formula_code || formula.ai_mood || undefined;
        if (formula.selling_price && formula.selling_price !== amount) {
          sellingPriceDiff = amount - formula.selling_price;
        }
      }
    }

    // Upsert customer by phone
    const customer = upsertCustomer("", customer_phone);

    // Record purchase
    const purchaseId = recordPurchase(
      customer.id,
      amount,
      formula_id || undefined,
      formulaName,
      undefined,
      notes || undefined
    );

    // Update product_batches if tracking available product
    // Find the most recent completed/matured batch for this formula
    // First ensure the table exists (created by /api/produce)
    const tableCheck = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='product_batches'"
    ).get();
    if (tableCheck && formula_id) {
      const productBatch = db.prepare(`
        SELECT * FROM product_batches
        WHERE formula_id = ? AND status IN ('produced', 'matured', 'completed')
        ORDER BY created_at DESC
        LIMIT 1
      `).get(formula_id) as any;

      if (productBatch) {
        // Decrease available count (track via a 'sold_count' or similar)
        db.prepare(`
          UPDATE product_batches
          SET sold_count = COALESCE(sold_count, 0) + 1,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(productBatch.id);
      }
    }

    // Recalculate CLV
    const newClv = recalculateCLV(customer.id);

    // Sync to Google Sheets (non-blocking)
    try {
      await syncSaleToSheets({
        customerPhone: customer_phone,
        amount,
        paymentMethod: payment_method || "cash",
        formulaName: formulaName || undefined,
      });
    } catch (syncErr) {
      console.warn("Sheets sync failed (sell):", syncErr);
    }

    // Build response notes
    const responseNotes: string[] = [];
    if (sellingPriceDiff !== null) {
      if (sellingPriceDiff > 0) {
        responseNotes.push(`Harga jual lebih tinggi ${sellingPriceDiff} dari harga formula`);
      } else {
        responseNotes.push(`Harga jual diskon ${Math.abs(sellingPriceDiff)} dari harga formula`);
      }
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        segment: customer.segment,
        visit_count: customer.visit_count,
        total_spent: customer.total_spent,
        clv: newClv,
      },
      purchase_id: purchaseId,
      price_difference: sellingPriceDiff,
      notes: responseNotes.length > 0 ? responseNotes : undefined,
      payment_method: payment_method || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
