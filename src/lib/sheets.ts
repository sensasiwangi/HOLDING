// src/lib/sheets.ts
// Google Sheets helper — baca & tulis ke semua sheet
import { google } from "googleapis";
import fs from "fs";

export const SPREADSHEET_ID = "1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA";
const TOKEN_PATH = "/home/ubuntu/.hermes/google_token.json";

// ── Sheet ranges map ──────────────────────────────────────────────
// Setiap nama sheet + range default untuk baca
export const SHEETS: Record<string, { range: string; description: string }> = {
  Dashboard:         { range: "Dashboard!A1:F9",              description: "Ringkasan keuangan per divisi" },
  DashboardSetoran:  { range: "Dashboard!A31:G36",            description: "Rekap setoran 30%" },
  RekapSetoran:      { range: "RekapSetoran!A1:F14",          description: "Rekap setoran per bulan" },
  Holding:           { range: "Holding!A1:G5",                description: "Data holding company" },
  PemegangSaham:     { range: "PemegangSaham!A1:G16",         description: "Data pemegang saham" },
  DivisiShareholders:{ range: "DivisiShareholders!A4:F9",     description: "Shareholder per divisi" },
  SukukStore:        { range: "SukukStore!A4:O9",             description: "Info sukuk store" },
  SukukInvestor:     { range: "SukukStore!A12:O26",           description: "Investor sukuk" },
  SukukProyeksi:     { range: "SukukStore!A29:O44",           description: "Proyeksi sukuk" },
  SukukProduk:       { range: "SukukProduk!A6:L13",           description: "Produk sukuk" },
  SukukProdukProj:   { range: "SukukProduk!A22:M34",          description: "Proyeksi produk sukuk" },
  SukukPanduan:      { range: "SukukPanduan!A1:Z50",          description: "Panduan sukuk" },
  SukukTermSheet:    { range: "Sukuk_Term_Sheet!A1:Z30",     description: "Term sheet sukuk" },
  SukukCreditor:     { range: "Sukuk_Creditor!A1:Z20",        description: "Data creditor" },
  SukukRAB:          { range: "Sukuk_RAB!A1:Z30",            description: "RAB sukuk" },
  SukukSchedule:     { range: "Sukuk_Payment_Schedule!A1:L25", description: "Jadwal pembayaran sukuk" },
  SukukNotification: { range: "Sukuk_Notification!A1:H50",    description: "Notifikasi sukuk" },
  SukukAudit:        { range: "Sukuk_Audit!A1:H50",          description: "Audit trail sukuk" },
  RekeningKoran:     { range: "Rekening_Koran!A5:D7",         description: "Rekening koran header" },
  RekeningMutasi:    { range: "Rekening_Koran!A10:L12",      description: "Mutasi rekening" },
  COA:               { range: "COA!A5:E60",                   description: "Chart of accounts" },
  CashHarian:        { range: "Cash_Harian!A5:I100",          description: "Cash harian (bank)" },
  BukuKas:           { range: "Buku_Kas!A5:H100",             description: "Buku kas (manual)" },
  LaporanBulanan:    { range: "Laporan_Bulanan!A1:P16",       description: "Laporan bulanan" },
  BudgetVsActual:    { range: "Budget_vs_Actual!A1:R50",      description: "Budget vs actual" },
  PajakTracking:     { range: "Pajak_Tracking!A1:H12",        description: "Tracking pajak" },
  LegalCompliance:   { range: "Legal_Compliance!A1:H16",       description: "Legal compliance" },
  CashflowForecast:  { range: "Cashflow_Forecast!A1:J30",     description: "Cashflow forecast" },
  CashflowAktual:    { range: "Cashflow_Aktual!A1:I80",       description: "Cashflow aktual" },
  BreakEven:         { range: "Break_Even_Analysis!A1:J16",   description: "Break even analysis" },
  Proyeksi12Bulan:   { range: "Proyeksi_12Bulan!A1:O25",      description: "Proyeksi 12 bulan" },
  RABStoreTIM:       { range: "RAB_Store_TIM!A1:J57",         description: "RAB Store TIM" },
  RABPerbandingan:   { range: "RAB_Perbandingan_Skema!A1:H25", description: "Perbandingan skema RAB" },
  ProyeksiCashflow:  { range: "Proyeksi_Cashflow_Store!A1:M33", description: "Proyeksi cashflow store" },
  SOPStore:          { range: "SOP_Store!A1:F30",             description: "SOP store" },
  ArtisanProgram:    { range: "Artisan_Program!A1:H22",       description: "Program artisan" },
  MerchTIM:          { range: "Merch_TIM!A1:L13",             description: "Merchandise TIM" },
  StoreDailyLog:     { range: "Store_Daily_Log!A1:L100",      description: "Daily log store" },
};

// ── Auth ──────────────────────────────────────────────────────────
let cachedAuth: any = null;

export function getAuth() {
  if (cachedAuth) return cachedAuth;

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
  cachedAuth = oauth2;
  return oauth2;
}

export function invalidateAuth() {
  cachedAuth = null;
}

// ── Read ──────────────────────────────────────────────────────────
/** Baca satu range dari Sheets */
export async function readRange(range: string): Promise<string[][]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return data.values || [];
}

/** Baca satu sheet by name (pakai range default dari SHEETS map) */
export async function readSheet(sheetName: string): Promise<string[][]> {
  const cfg = SHEETS[sheetName];
  if (!cfg) throw new Error(`Unknown sheet: ${sheetName}`);
  return readRange(cfg.range);
}

/** Baca banyak range sekaligus (batch) */
export async function readRanges(ranges: string[]): Promise<Record<string, string[][]>> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const { data } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges,
  });
  const result: Record<string, string[][]> = {};
  (data.valueRanges || []).forEach((vr, i) => {
    result[ranges[i]] = vr.values || [];
  });
  return result;
}

/** Baca semua SHEETS sekaligus (batch) — untuk dashboard */
export async function readAllSheets(): Promise<Record<string, string[][]>> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const ranges = Object.values(SHEETS).map((s) => s.range);
  const { data } = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges,
  });
  const result: Record<string, string[][]> = {};
  const names = Object.keys(SHEETS);
  (data.valueRanges || []).forEach((vr, i) => {
    result[names[i]] = vr.values || [];
  });
  return result;
}

// ── Write ─────────────────────────────────────────────���──────────
/** Overwrite data di range tertentu */
export async function writeRange(range: string, values: (string | number)[][]): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

/** Append row baru di akhir sheet */
export async function appendRows(sheetName: string, rows: (string | number)[][]): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  // Cari range append berdasarkan SHEETS map
  const cfg = SHEETS[sheetName];
  // Extract kolom awal dan akhir dari range, contoh "A5:I100" → "A:I"
  const match = cfg?.range?.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  let appendRange = `${sheetName}!A:Z`; // fallback
  if (match) {
    appendRange = `${sheetName}!${match[1]}:${match[3]}`;
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: appendRange,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });
}

/** Update baris tertentu berdasarkan row number */
export async function updateRow(sheetName: string, rowNumber: number, values: (string | number)[]): Promise<void> {
  const cfg = SHEETS[sheetName];
  if (!cfg) throw new Error(`Unknown sheet: ${sheetName}`);
  // Parse range untuk dapat kolom
  const match = cfg.range.match(/^([A-Z]+)\d+:([A-Z]+)\d+$/);
  const colStart = match ? match[1] : "A";
  const colEnd = match ? match[2] : "Z";
  const range = `${sheetName}!${colStart}${rowNumber}:${colEnd}${rowNumber}`;
  await writeRange(range, [values]);
}

/** Hapus baris (pakai batchUpdate) */
export async function deleteRow(sheetName: string, rowNumber: number): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  // Dapatkan sheetId dari nama
  const ss = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties",
  });
  const sheetId = ss.data.sheets?.find(
    (s: any) => s.properties?.title === sheetName
  )?.properties?.sheetId;

  if (sheetId === undefined) throw new Error(`Sheet "${sheetName}" not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowNumber - 1, // 0-indexed
            endIndex: rowNumber,
          },
        },
      }],
    },
  });
}
