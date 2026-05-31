import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";

const SPREADSHEET_ID = "1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA";

function getAuth() {
  const content = JSON.parse(fs.readFileSync("/home/ubuntu/.hermes/google_token.json", "utf-8"));
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nama, jenis, ktp, npwp, phone, email,
      bank, rekNum, rekName, alamat, unit, nominal, pct, tanggal, status,
    } = body;

    // Validate required fields
    if (!nama || !ktp || !npwp || !phone || !email || !bank || !rekNum || !rekName) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Pastikan semua field wajib diisi." },
        { status: 400 }
      );
    }

    // Validate KTP format (16 digits)
    const ktpClean = ktp.replace(/[\s.\-]/g, "");
    if (!/^\d{16}$/.test(ktpClean)) {
      return NextResponse.json(
        { error: "Format KTP tidak valid. Harus 16 digit angka." },
        { status: 400 }
      );
    }

    // Validate NPWP format (15 digits)
    const npwpClean = npwp.replace(/[\s.\-]/g, "");
    if (!/^\d{15}$/.test(npwpClean)) {
      return NextResponse.json(
        { error: "Format NPWP tidak valid. Harus 15 digit angka." },
        { status: 400 }
      );
    }

    // Validate phone
    const phoneClean = phone.replace(/[\s\-()]/g, "").replace(/^\+62/, "0");
    if (!/^08\d{8,11}$/.test(phoneClean)) {
      return NextResponse.json(
        { error: "Format nomor HP tidak valid." },
        { status: 400 }
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Validate unit
    const unitNum = Number(unit);
    if (isNaN(unitNum) || unitNum < 1 || unitNum > 500) {
      return NextResponse.json(
        { error: "Jumlah unit harus antara 1-500." },
        { status: 400 }
      );
    }

    // Check if KTP already registered
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SukukStore!B13:B26",
    });

    const existingNames = (existing.data.values || []).flat();
    if (existingNames.includes(nama)) {
      return NextResponse.json(
        { error: "Nama investor sudah terdaftar. Hubungi tim jika ingin menambah unit." },
        { status: 409 }
      );
    }

    // Find next empty row
    const investorRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SukukStore!A13:O26",
    });

    const rows = investorRows.data.values || [];
    let nextRow = 13;
    let nextNo = 1;
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i][0] || rows[i][0].toString().trim() === "") {
        nextRow = 13 + i;
        nextNo = i + 1;
        break;
      }
      nextNo = i + 2;
      nextRow = 13 + i + 1;
    }

    if (nextRow > 26) {
      return NextResponse.json(
        { error: "Kapasitas investor penuh. Hubungi tim SWI untuk waiting list." },
        { status: 400 }
      );
    }

    // Append investor data
    const nominalVal = unitNum * 1000000;
    const pctVal = ((nominalVal / 1000000000) * 100).toFixed(1) + "%";

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `SukukStore!A${nextRow}:K${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          nextNo,
          nama,
          jenis || "Perorangan",
          unitNum,
          nominalVal,
          pctVal,
          tanggal || new Date().toISOString().split("T")[0],
          status || "Menunggu",
          phoneClean,
          email,
          `${bank} - ${rekName} - ****${rekNum.slice(-4)}`,
          alamat || "",
        ]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil",
      investor: {
        no: nextNo,
        nama,
        unit: unitNum,
        nominal: nominalVal,
        row: nextRow,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Investor registration error:", msg);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi atau hubungi tim SWI." },
      { status: 500 }
    );
  }
}
