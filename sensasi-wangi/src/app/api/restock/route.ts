// src/app/api/restock/route.ts
// Flow 5: Restock from PO
// POST: Receive PO shipment, update stock, update supplier metrics
// GET: Return auto-generated restock suggestions based on low stock

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/swi-db";
import {
  createSupplierTables,
} from "@/lib/supplier-management";
import { createPackagingInventoryTable } from "@/lib/inventory-alert";

// ── GET: Restock suggestions ────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const db = getDb();
    createSupplierTables();
    createPackagingInventoryTable();

    if (action === "suggestions") {
      // auto-generate restock suggestions based on low stock
      const lowStock = db.prepare(`
        SELECT rm.id, rm.name, rm.stock_ml, rm.min_stock_ml,
               rm.price_per_50ml, rm.price_per_100ml, rm.price_per_500ml,
               rm.family
        FROM raw_materials rm
        WHERE rm.stock_ml <= rm.min_stock_ml
          AND rm.kategori_rm NOT IN ('solvent', 'eco_base')
        ORDER BY (rm.stock_ml / NULLIF(rm.min_stock_ml, 0)) ASC
      `).all() as any[];

      const suggestions = lowStock.map((m) => {
        const deficit = Math.max(0, m.min_stock_ml - m.stock_ml);
        const suggestedOrder = Math.max(m.min_stock_ml * 2, deficit);
        const pricePerMl =
          m.price_per_500ml / 500 ||
          m.price_per_100ml / 100 ||
          m.price_per_50ml / 50 ||
          0;
        const estimatedCost = Math.round(suggestedOrder * pricePerMl);
        const urgency =
          m.stock_ml <= 0
            ? "critical"
            : m.stock_ml < m.min_stock_ml * 0.5
            ? "high"
            : "medium";

        // Find preferred supplier for this material
        const supplier = db.prepare(`
          SELECT s.id, s.name, s.rating
          FROM suppliers s
          JOIN purchase_orders po ON po.supplier_id = s.id
          JOIN po_line_items pli ON pli.po_id = po.id
          WHERE pli.material_id = ? AND po.status = 'received'
          ORDER BY po.actual_delivery DESC
          LIMIT 1
        `).get(m.id) as { id: number; name: string; rating: number } | undefined;

        return {
          material_id: m.id,
          material_name: m.name,
          current_stock_ml: m.stock_ml,
          min_stock_ml: m.min_stock_ml,
          deficit_ml: Math.round(deficit * 100) / 100,
          suggested_order_ml: Math.round(suggestedOrder),
          estimated_cost: estimatedCost,
          urgency,
          preferred_supplier: supplier
            ? { id: supplier.id, name: supplier.name, rating: supplier.rating }
            : null,
        };
      });

      const totalCost = suggestions.reduce((s, i) => s + i.estimated_cost, 0);

      return NextResponse.json({
        success: true,
        suggestions,
        total_items: suggestions.length,
        total_estimated_cost: totalCost,
        generated_at: new Date().toISOString(),
      });
    }

    // Default: list recent POs
    const pos = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN suppliers s ON s.id = po.supplier_id
      ORDER BY po.created_at DESC
      LIMIT 50
    `).all();

    return NextResponse.json({
      success: true,
      purchase_orders: pos,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ── POST: Receive PO shipment ───────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { po_id } = body;

    if (!po_id) {
      return NextResponse.json(
        { success: false, error: "po_id wajib diisi" },
        { status: 400 }
      );
    }

    const db = getDb();
    createSupplierTables();

    // Get PO
    const po = db.prepare("SELECT * FROM purchase_orders WHERE id = ?").get(po_id) as any;
    if (!po) {
      return NextResponse.json(
        { success: false, error: "Purchase order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get line items
    const lineItems = db.prepare(
      "SELECT * FROM po_line_items WHERE po_id = ?"
    ).all(po_id) as any[];

    if (lineItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "PO tidak memiliki line items" },
        { status: 400 }
      );
    }

    const itemsRestocked: {
      material_id: number | null;
      material_name: string;
      quantity_received: number;
      previous_stock: number;
      new_stock: number;
    }[] = [];

    let totalCost = 0;

    for (const item of lineItems) {
      totalCost += item.total_price || 0;

      // Update raw material stock if material_id exists
      if (item.material_id) {
        const before = db.prepare("SELECT stock_ml FROM raw_materials WHERE id = ?").get(item.material_id) as { stock_ml: number } | undefined;
        const previousStock = before?.stock_ml || 0;

        db.prepare(`
          UPDATE raw_materials
          SET stock_ml = stock_ml + ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(item.quantity, item.material_id);

        const after = db.prepare("SELECT stock_ml FROM raw_materials WHERE id = ?").get(item.material_id) as { stock_ml: number };

        itemsRestocked.push({
          material_id: item.material_id,
          material_name: item.material_name,
          quantity_received: item.quantity,
          previous_stock: previousStock,
          new_stock: after.stock_ml,
        });

        // Insert stock movement
        db.prepare(`
          INSERT INTO stock_movements (item_type, item_id, change_amount, reason)
          VALUES ('raw_material', ?, ?, ?)
        `).run(
          item.material_id,
          item.quantity,
          `po_received: ${po.po_number} | ${item.material_name}`
        );
      } else {
        itemsRestocked.push({
          material_id: null,
          material_name: item.material_name,
          quantity_received: item.quantity,
          previous_stock: 0,
          new_stock: 0,
        });
      }

      // Update received_qty on line item
      db.prepare(
        "UPDATE po_line_items SET received_qty = ? WHERE id = ?"
      ).run(item.quantity, item.id);
    }

    // Update PO status to received
    const actualDelivery = new Date().toISOString().slice(0, 10);
    const created = new Date(po.created_at);
    const delivered = new Date(actualDelivery);
    const leadTimeDays = Math.round(
      (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );

    db.prepare(`
      UPDATE purchase_orders
      SET status = 'received',
          actual_delivery = ?,
          lead_time_days = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(actualDelivery, leadTimeDays, po_id);

    // Update supplier performance metrics
    // Recalculate rating based on on-time delivery
    if (po.supplier_id) {
      const supplierPOS = db.prepare(
        "SELECT * FROM purchase_orders WHERE supplier_id = ? AND status IN ('received', 'partial')"
      ).all(po.supplier_id) as any[];

      const onTimeCount = supplierPOS.filter((sPo: any) => {
        if (!sPo.expected_delivery || !sPo.actual_delivery) return true;
        return new Date(sPo.actual_delivery) <= new Date(sPo.expected_delivery);
      }).length;

      const onTimeRate = supplierPOS.length > 0 ? onTimeCount / supplierPOS.length : 1;
      // Adjust rating: base 3, +1 if on-time rate > 80%, -1 if < 50%
      let newRating = 3;
      if (onTimeRate >= 0.8) newRating = Math.min(5, Math.max(4, Math.round(3 + onTimeRate * 2)));
      else if (onTimeRate < 0.5) newRating = Math.max(2, Math.round(3 - (0.5 - onTimeRate) * 4));
      else newRating = 3;

      // Only update if performance-based rating differs significantly
      db.prepare(`
        UPDATE suppliers
        SET rating = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(newRating, po.supplier_id);
    }

    return NextResponse.json({
      success: true,
      po_number: po.po_number,
      status: "received",
      actual_delivery: actualDelivery,
      lead_time_days: leadTimeDays,
      items_restocked: itemsRestocked,
      total_cost: totalCost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
