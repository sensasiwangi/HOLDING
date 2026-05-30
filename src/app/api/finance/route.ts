import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";

const SPREADSHEET_ID = "1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA";
const TOKEN_PATH = "/home/ubuntu/.hermes/google_token.json";

function getAuth() {
  const content = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  const oauth2 = new google.auth.OAuth2(
    content.client_id,
    content.client_secret,
    "http://localhost:1"
  );
  oauth2.setCredentials({
    refresh_token: content.refresh_token,
    access_token: content.token || content.access_token || "",
    token_type: "Bearer",
    expiry_date: content.expiry_date || Date.now() + 3600000,
  });
  return oauth2;
}

export async function GET() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const { data } = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
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
      ],
    });

    const r = data.valueRanges || [];

    return NextResponse.json({
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      dashboard: r[0]?.values || null,
      shareholder: r[1]?.values || null,
      rekapSetoran: r[2]?.values || null,
      holding: r[3]?.values || null,
      pemegangSaham: r[4]?.values || null,
      divisiSaham: r[5]?.values || null,
      sukukInfo: r[6]?.values || null,
      sukukInvestor: r[7]?.values || null,
      sukukProyeksi: r[8]?.values || null,
      sukukProduk: r[9]?.values || null,
      sukukProdukProj: r[10]?.values || null,
      rekeningKoran: r[11]?.values || null,
      rekeningMutasi: r[12]?.values || null,
      coa: r[13]?.values || null,
      cashHarian: r[14]?.values || null,
      bukuKas: r[15]?.values || null,
      laporanBulanan: r[16]?.values || null,
      budgetVsActual: r[17]?.values || null,
      pajakTracking: r[18]?.values || null,
      legalCompliance: r[19]?.values || null,
      cashflowForecast: r[20]?.values || null,
      sopStore: r[21]?.values || null,
      artisanProgram: r[22]?.values || null,
      merchTim: r[23]?.values || null,
      storeDailyLog: r[24]?.values || null,
      cashflowAktual: r[25]?.values || null,
      breakEven: r[26]?.values || null,
      proyeksi12Bulan: r[27]?.values || null,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sheet,
      division,
      accountId,
      category,
      subcategory,
      description,
      inflow,
      outflow,
      balance,
      date,
    } = body;

    if (!sheet || !accountId) {
      return NextResponse.json(
        { error: "Missing required fields: sheet, accountId" },
        { status: 400 }
      );
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    if (sheet === "Cash_Harian") {
      const d = date || new Date().toISOString().split("T")[0];
      const row = [d, accountId, category || "", description || "", inflow || 0, outflow || 0, now, division || ""];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Cash_Harian!A:H",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });

      return NextResponse.json({ success: true, message: "Transaksi harian berhasil dicatat", sheet: "Cash_Harian", row });
    }

    if (sheet === "Buku_Kas") {
      const d = date || new Date().toISOString().split("T")[0];
      const saldo = balance !== undefined ? balance : 0;
      const row = [d, description || "", inflow || 0, outflow || 0, saldo, accountId, now, division || "Holding"];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Buku_Kas!A:H",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });

      return NextResponse.json({ success: true, message: "Mutasi buku kas berhasil dicatat", sheet: "Buku_Kas", row });
    }

    return NextResponse.json({ error: "Unknown sheet target" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to write transaction", detail: msg },
      { status: 500 }
    );
  }
}
