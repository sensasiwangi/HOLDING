// GET /api/sukuk/[id] — Detail sukuk + investors + investment summary
// PUT /api/sukuk/[id] — Update sukuk status (draft → open → closed → matured)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["open", "cancelled"],
  open: ["closed", "cancelled"],
  closed: ["matured", "cancelled"],
  matured: [],
  cancelled: [],
};

// ============================================================
// GET — Detail sukuk + investors + investment summary
// ============================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Get sukuk detail
    const sukuk = db
      .prepare(
        `
        SELECT s.*, 
          COALESCE(SUM(si.nominal), 0) as total_terkumpul,
          COUNT(DISTINCT si.investor_id) as jumlah_investor,
          s.unit_terjual,
          ROUND(CAST(s.unit_terjual AS REAL) / s.target_unit * 100, 2) as pct_terjual
        FROM sukuk s
        LEFT JOIN sukuk_investments si ON s.id = si.sukuk_id AND si.status = 'confirmed'
        WHERE s.id = ?
        GROUP BY s.id
      `
      )
      .get(id);

    if (!sukuk) {
      return NextResponse.json(
        { success: false, error: "Sukuk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get investors list with units and payouts
    const investors = db
      .prepare(
        `
        SELECT 
          i.id, i.no, i.nama, i.jenis, i.email, i.phone, i.status as investor_status,
          si.id as investment_id,
          si.unit, si.nominal, si.harga_per_unit, si.pct_portfolio,
          si.tanggal_setor, si.status as investment_status,
          COALESCE(SUM(ip.net_payout), 0) as total_payout
        FROM sukuk_investments si
        JOIN investors i ON si.investor_id = i.id
        LEFT JOIN investor_payouts ip ON ip.investor_id = i.id 
          AND ip.sukuk_id = si.sukuk_id AND ip.status = 'paid'
        WHERE si.sukuk_id = ?
        GROUP BY si.id
        ORDER BY si.created_at ASC
      `
      )
      .all(id);

    // Get latest distribution info
    const latestDistribution = db
      .prepare(
        `
        SELECT * FROM profit_distributions 
        WHERE sukuk_id = ? 
        ORDER BY periode DESC 
        LIMIT 1
      `
      )
      .get(id);

    return NextResponse.json({
      success: true,
      data: {
        ...sukuk,
        investors,
        latest_distribution: latestDistribution || null,
      },
      meta: {
        total_investors: investors.length,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT — Update sukuk status
// ============================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status wajib diisi" },
        { status: 400 }
      );
    }

    const validStatuses = ["draft", "open", "closed", "matured", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Status tidak valid. Harus salah satu: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const db = getDb();

    // Find existing sukuk
    const sukuk = db
      .prepare("SELECT * FROM sukuk WHERE id = ?")
      .get(id);

    if (!sukuk) {
      return NextResponse.json(
        { success: false, error: "Sukuk tidak ditemukan" },
        { status: 404 }
      );
    }

    const currentStatus = (sukuk as any).status;

    // Validate status transition
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Transisi status tidak valid: '${currentStatus}' → '${status}'. Dari '${currentStatus}' hanya bisa ke: [${allowedNext.join(", ") || "tidak ada transisi"}]`,
        },
        { status: 400 }
      );
    }

    // Update status
    db.prepare("UPDATE sukuk SET status = ? WHERE id = ?").run(status, id);

    const updated = db
      .prepare("SELECT * FROM sukuk WHERE id = ?")
      .get(id);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status sukuk diperbarui: '${currentStatus}' → '${status}'`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
