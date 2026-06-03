// sheets-sync-operational.ts
// Sync operational data (production, sales, inventory) → Google Sheets
// Self-contained: does not depend on holding-swi sheets.ts

import { google } from "googleapis";

const SPREADSHEET_ID = "1lQ_FX6v-aX0XNwkRO6TyYLU1NGq6lAMFvK88S09KZsA";

function getAuth() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  if (!client_id || !client_secret || !refresh_token) {
    throw new Error("Google credentials not configured");
  }
  const oauth2 = new google.auth.OAuth2(client_id, client_secret);
  oauth2.setCredentials({
    refresh_token,
    access_token: process.env.GOOGLE_ACCESS_TOKEN || "",
    token_type: "Bearer",
    expiry_date: parseInt(process.env.GOOGLE_EXPIRY_DATE || "0", 10) || Date.now() + 3600000,
  });
  return oauth2;
}

// ── Production Log → "Produksi" sheet ────────────────────────────
export async function syncProductionToSheets(data: {
  batchNumber: string;
  formulaName: string;
  targetUnits: number;
  staffName: string;
  materialsUsed: { name: string; quantity_ml: number; cost: number }[];
  totalCost: number;
  qcStatus: string;
  date?: string;
}): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const date = data.date || new Date().toISOString().slice(0, 10);
  const materialsSummary = data.materialsUsed.map((m) => `${m.name} (${m.quantity_ml}ml)`).join(", ");
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Produksi!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[date, data.batchNumber, data.formulaName, data.targetUnits, data.staffName, materialsSummary, data.totalCost, data.qcStatus, "auto-synced"]] },
  });
}

// ── Sales Record → "Cash_Harian" sheet ───────────────────────────
export async function syncSaleToSheets(data: {
  customerPhone: string;
  amount: number;
  paymentMethod: string;
  formulaName?: string;
  date?: string;
}): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const date = data.date || new Date().toISOString().slice(0, 10);
  const description = data.formulaName ? `Penjualan ${data.formulaName} - ${data.customerPhone}` : `Penjualan - ${data.customerPhone}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Cash_Harian!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[date, description, data.amount, 0, data.paymentMethod || "cash", "Penjualan Produk", "auto-synced"]] },
  });
}

// ── Raw Material Purchase → "Cash_Harian" sheet ──────────────────
export async function syncPurchaseToSheets(data: {
  materialName: string;
  quantity: number;
  totalCost: number;
  supplierName?: string;
  date?: string;
}): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const date = data.date || new Date().toISOString().slice(0, 10);
  const description = data.supplierName
    ? `Pembelian ${data.materialName} (${data.quantity}ml) - ${data.supplierName}`
    : `Pembelian ${data.materialName} (${data.quantity}ml)`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Cash_Harian!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[date, description, 0, data.totalCost, "transfer", "Bahan Baku", "auto-synced"]] },
  });
}
