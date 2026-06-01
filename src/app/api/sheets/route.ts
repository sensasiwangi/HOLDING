// src/app/api/sheets/route.ts
// Generic Google Sheets CRUD API
// GET  /api/sheets?sheet=Cash_Harian          → baca semua data
// GET  /api/sheets?sheet=Cash_Harian&range=A1:C10  → baca range tertentu
// POST /api/sheets?sheet=Cash_Harian          → append row baru
//      body: { row: ["2025-01-01", "Deskripsi", 1000000, ...] }
// PUT  /api/sheets?sheet=Cash_Harian          → update range
//      body: { range: "A5:H5", values: [...] }
// DELETE /api/sheets?sheet=Cash_Harian&row=5   → hapus baris
import { NextRequest, NextResponse } from "next/server";
import {
  readSheet, readRange, writeRange, appendRows, updateRow, deleteRow, SHEETS,
} from "@/lib/sheets";

// ── GET: Baca data ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheet = searchParams.get("sheet");
    const range = searchParams.get("range");

    if (!sheet) {
      // List semua sheet yang tersedia
      return NextResponse.json({
        sheets: Object.entries(SHEETS).map(([name, cfg]) => ({
          name,
          range: cfg.range,
          description: cfg.description,
        })),
      });
    }

    if (!SHEETS[sheet] && !range) {
      return NextResponse.json(
        { error: `Unknown sheet: ${sheet}. Use ?range=SheetName!A:Z untuk sheet custom.` },
        { status: 400 }
      );
    }

    let data: string[][];
    if (range) {
      data = await readRange(range);
    } else {
      data = await readSheet(sheet);
    }

    return NextResponse.json({
      sheet,
      range: range || SHEETS[sheet]?.range,
      rows: data,
      count: data.length,
    });
  } catch (err: any) {
    console.error("[sheets GET]", err.message);
    return NextResponse.json(
      { error: "Failed to read sheet", detail: err.message },
      { status: 500 }
    );
  }
}

// ── POST: Append row baru ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheet = searchParams.get("sheet");

    if (!sheet) {
      return NextResponse.json({ error: "Missing ?sheet= parameter" }, { status: 400 });
    }

    const body = await req.json();
    const { rows, row } = body;

    // Support single row atau multiple rows
    const dataToAppend = rows || (row ? [row] : null);
    if (!dataToAppend || !Array.isArray(dataToAppend)) {
      return NextResponse.json(
        { error: "Body must contain 'row' (array) or 'rows' (array of arrays)" },
        { status: 400 }
      );
    }

    await appendRows(sheet, dataToAppend);

    return NextResponse.json({
      success: true,
      sheet,
      rowsAdded: dataToAppend.length,
      message: `${dataToAppend.length} row(s) ditambahkan ke ${sheet}`,
    });
  } catch (err: any) {
    console.error("[sheets POST]", err.message);
    return NextResponse.json(
      { error: "Failed to append rows", detail: err.message },
      { status: 500 }
    );
  }
}

// ── PUT: Update range ─────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheet = searchParams.get("sheet");

    if (!sheet) {
      return NextResponse.json({ error: "Missing ?sheet= parameter" }, { status: 400 });
    }

    const body = await req.json();
    const { range, values, row } = body;

    if (row && Array.isArray(row)) {
      // Update by row number — put row data
      const rowNumber = body.rowNumber;
      if (!rowNumber) {
        return NextResponse.json({ error: "rowNumber required for row update" }, { status: 400 });
      }
      await updateRow(sheet, rowNumber, row);
      return NextResponse.json({
        success: true,
        sheet,
        updatedRow: rowNumber,
      });
    }

    if (!range || !values) {
      return NextResponse.json(
        { error: "Body must contain 'range' + 'values' or 'row' + 'rowNumber'" },
        { status: 400 }
      );
    }

    await writeRange(range, values);

    return NextResponse.json({
      success: true,
      sheet,
      range,
      rowsUpdated: values.length,
    });
  } catch (err: any) {
    console.error("[sheets PUT]", err.message);
    return NextResponse.json(
      { error: "Failed to update sheet", detail: err.message },
      { status: 500 }
    );
  }
}

// ── DELETE: Hapus baris ───────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheet = searchParams.get("sheet");
    const row = searchParams.get("row");

    if (!sheet || !row) {
      return NextResponse.json(
        { error: "Missing ?sheet= or ?row= parameter" },
        { status: 400 }
      );
    }

    const rowNumber = parseInt(row, 10);
    if (isNaN(rowNumber) || rowNumber < 1) {
      return NextResponse.json({ error: "Invalid row number" }, { status: 400 });
    }

    await deleteRow(sheet, rowNumber);

    return NextResponse.json({
      success: true,
      sheet,
      deletedRow: rowNumber,
    });
  } catch (err: any) {
    console.error("[sheets DELETE]", err.message);
    return NextResponse.json(
      { error: "Failed to delete row", detail: err.message },
      { status: 500 }
    );
  }
}

// ── PATCH: Update/spesifik partial ───────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sheet = searchParams.get("sheet");

    if (!sheet) {
      return NextResponse.json({ error: "Missing ?sheet= parameter" }, { status: 400 });
    }

    const body = await req.json();
    const { rowNumber, row, range, values } = body;

    if (rowNumber && row) {
      await updateRow(sheet, rowNumber, row);
      return NextResponse.json({ success: true, sheet, updatedRow: rowNumber });
    }

    if (range && values) {
      await writeRange(range, values);
      return NextResponse.json({ success: true, sheet, range });
    }

    return NextResponse.json(
      { error: "Provide rowNumber+row or range+values" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[sheets PATCH]", err.message);
    return NextResponse.json(
      { error: "Failed to patch sheet", detail: err.message },
      { status: 500 }
    );
  }
}
