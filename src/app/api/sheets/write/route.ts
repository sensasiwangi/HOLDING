// src/app/api/sheets/write/route.ts
// Generic write endpoint — tulis ke sheet apapun
// POST /api/sheets/write?sheet=SheetName&tab=append|update|replace
import { NextRequest, NextResponse } from "next/server";
import { appendRows, writeRange, updateRow, SHEETS, SPREADSHEET_ID } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheet = searchParams.get("sheet");
    const tab = searchParams.get("tab") || "append"; // append | update | replace

    if (!sheet) return NextResponse.json({ error: "?sheet= required" }, { status: 400 });

    // Resolve sheet name (handle underscore variants)
    const sheetKey = Object.keys(SHEETS).find(
      k => k.toLowerCase() === sheet.toLowerCase().replace(/_/g, "")
    );
    const sheetName = sheetKey || sheet;
    const cfg = SHEETS[sheetName];

    const body = await req.json();
    const { row, rows, range, values, rowNumber } = body;

    // ── APPEND ────────────────────────────────────────────────────
    if (tab === "append") {
      const data = rows || (row ? [row] : null);
      if (!data) return NextResponse.json({ error: "Provide 'row' or 'rows'" }, { status: 400 });
      await appendRows(sheetName, data);
      return NextResponse.json({ success: true, sheet: sheetName, rowsAdded: data.length });
    }

    // ── UPDATE (row tertentu) ────────────────────────────────────
    if (tab === "update" && rowNumber && row) {
      await updateRow(sheetName, rowNumber, row);
      return NextResponse.json({ success: true, sheet: sheetName, updatedRow: rowNumber });
    }

    // ── REPLACE (range tertentu) ─────────────────────────────────
    if (tab === "replace" && range && values) {
      await writeRange(range, values);
      return NextResponse.json({ success: true, sheet: sheetName, range });
    }

    return NextResponse.json(
      { error: "Invalid combo. Use: append+row/rows, update+rowNumber+row, or replace+range+values" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
