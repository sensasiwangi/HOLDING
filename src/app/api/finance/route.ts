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
      ],
    });

    const ranges = data.valueRanges || [];

    return NextResponse.json({
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      dashboard: ranges[0]?.values || null,
      shareholder: ranges[1]?.values || null,
      rekapSetoran: ranges[2]?.values || null,
      holding: ranges[3]?.values || null,
      pemegangSaham: ranges[4]?.values || null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Finance API error:", msg);
    return NextResponse.json(
      { error: "Failed to fetch financial data", detail: msg },
      { status: 500 }
    );
  }
}
