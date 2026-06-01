// src/app/api/finance/route.ts
// Read & write financial data from Google Sheets
import { NextRequest, NextResponse } from "next/server";
import { readRanges, appendRows, writeRange, SPREADSHEET_ID } from "@/lib/sheets";

// ── GET: Baca semua data keuangan (batch) ────────────────────────
export async function GET() {
  try {
    const ranges = [
      "Dashboard!A4:F9",
      "Dashboard!A31:G36",
      "RekapSetoran!A1:F14",
      "Holding!A1:G5",
      "PemegangSaham!A1:G16",
      "DivisiShareholders!A4:F9",
      "SukukStore!A4:O9",
      "SukukStore!A12:O26",
      "SukukStore!A29:O44",
      "SukukProduk!A6:L13",
      "SukukProduk!A22:M34",
      "Rekening_Koran!A5:D7",
      "Rekening_Koran!A10:L12",
      "COA!A5:E60",
      "Cash_Harian!A5:I100",
      "Buku_Kas!A5:H100",
      "Laporan_Bulanan!A1:P16",
      "Budget_vs_Actual!A1:R50",
      "Pajak_Tracking!A1:H12",
      "Legal_Compliance!A1:H16",
      "Cashflow_Forecast!A1:J30",
      "SOP_Store!A1:F30",
      "Artisan_Program!A1:H22",
      "Merch_TIM!A1:L13",
      "Store_Daily_Log!A1:L100",
      "Cashflow_Aktual!A1:I80",
      "Break_Even_Analysis!A1:J16",
      "Proyeksi_12Bulan!A1:O25",
      "Sukuk_Payment_Schedule!A1:L25",
      "RAB_Store_TIM!A1:J57",
      "RAB_Perbandingan_Skema!A1:H25",
      "Proyeksi_Cashflow_Store!A1:M33",
    ];

    const data = await readRanges(ranges);
    const r = (idx: number) => data[ranges[idx]] || [];

    return NextResponse.json({
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      dashboard: r(0),
      shareholder: r(1),
      rekapSetoran: r(2),
      holding: r(3),
      pemegangSaham: r(4),
      divisiSaham: r(5),
      sukukInfo: r(6),
      sukukInvestor: r(7),
      sukukProyeksi: r(8),
      sukukProduk: r(9),
      sukukProdukProj: r(10),
      rekeningKoran: r(11),
      rekeningMutasi: r(12),
      coa: r(13),
      cashHarian: r(14),
      bukuKas: r(15),
      laporanBulanan: r(16),
      budgetVsActual: r(17),
      pajakTracking: r(18),
      legalCompliance: r(19),
      cashflowForecast: r(20),
      sopStore: r(21),
      artisanProgram: r(22),
      merchTim: r(23),
      storeDailyLog: r(24),
      cashflowAktual: r(25),
      breakEven: r(26),
      proyeksi12Bulan: r(27),
      sukukPaymentSchedule: r(28),
      rabStoreTim: r(29),
      rabPerbandinganSkema: r(30),
      proyeksiCashflowStore: r(31),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch financial data", detail: msg },
      { status: 500 }
    );
  }
}

// ── POST: Tulis transaksi ke sheet ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sheet,
      date,
      description,
      inflow,
      outflow,
      accountId,
      category,
      subcategory,
      division,
      balance,
    } = body;

    if (!sheet) {
      return NextResponse.json(
        { error: "Missing required field: sheet" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const d = date || new Date().toISOString().split("T")[0];

    // ── Cash Harian ─────────────────────────────────────────────
    if (sheet === "Cash_Harian") {
      const row = [
        d,
        accountId || "",
        category || "",
        description || "",
        inflow || 0,
        outflow || 0,
        now,
        division || "",
      ];
      await appendRows("CashHarian", [row]);
      return NextResponse.json({
        success: true,
        message: "Transaksi harian berhasil dicatat",
        sheet: "Cash_Harian",
        row,
      });
    }

    // ── Buku Kas ───────────────────────────────────────────────
    if (sheet === "Buku_Kas") {
      const saldo = balance !== undefined ? balance : 0;
      const row = [
        d,
        description || "",
        inflow || 0,
        outflow || 0,
        saldo,
        accountId || "",
        now,
        division || "Holding",
      ];
      await appendRows("BukuKas", [row]);
      return NextResponse.json({
        success: true,
        message: "Mutasi buku kas berhasil dicatat",
        sheet: "Buku_Kas",
        row,
      });
    }

    // ── Store Daily Log ─────────────────────────────────────────
    if (sheet === "Store_Daily_Log") {
      const row = [
        d,
        division || "Store",
        category || "",
        description || "",
        inflow || 0,
        outflow || 0,
        balance || 0,
        accountId || "",
        now,
        body.pic || "",
        body.notes || "",
      ];
      await appendRows("StoreDailyLog", [row]);
      return NextResponse.json({
        success: true,
        message: "Daily log store berhasil dicatat",
        sheet: "Store_Daily_Log",
        row,
      });
    }

    // ── Generic: append ke sheet apapun ─────────────────────────
    if (body.row && Array.isArray(body.row)) {
      const sheetName = sheet.replace(/_/g, "");
      await appendRows(sheetName, [body.row]);
      return NextResponse.json({
        success: true,
        message: `Row ditambahkan ke ${sheet}`,
        sheet,
      });
    }

    return NextResponse.json(
      { error: `Unknown sheet target: ${sheet}. Supported: Cash_Harian, Buku_Kas, Store_Daily_Log. Or provide "row" array for generic append.` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to write transaction", detail: msg },
      { status: 500 }
    );
  }
}
