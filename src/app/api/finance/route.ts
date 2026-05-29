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
