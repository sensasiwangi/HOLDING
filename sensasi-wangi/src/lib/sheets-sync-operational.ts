// sheets-sync-operational.ts
// Sync operational data (production, sales, inventory) → Google Sheets
// This bridges the SQLite workflow data to the Google Sheets backend

import { getAuth, SPREADSHEET_ID } from "./sheets";
import { google } from "googleapis";

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
  const materialsSummary = data.materialsUsed
    .map((m) => `${m.name} (${m.quantity_ml}ml)`)
    .join(", ");

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Produksi!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        date,
        data.batchNumber,
        data.formulaName,
        data.targetUnits,
        data.staffName,
        materialsSummary,
        data.totalCost,
        data.qcStatus,
        "auto-synced",
      ]],
    },
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
  const description = data.formulaName
    ? `Penjualan ${data.formulaName} - ${data.customerPhone}`
    : `Penjualan - ${data.customerPhone}`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Cash_Harian!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        date,
        description,
        data.amount,
        0, // pengeluaran = 0 (ini pemasukan)
        data.paymentMethod || "cash",
        "Penjualan Produk",
        "auto-synced",
      ]],
    },
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
    requestBody: {
      values: [[
        date,
        description,
        0, // pemasukan = 0 (ini pengeluaran)
        data.totalCost,
        "transfer",
        "Bahan Baku",
        "auto-synced",
      ]],
    },
  });
}

// ── Inventory Snapshot → "Rekap_Inventory" sheet ────────────────
export async function syncInventorySnapshot(
  items: { name: string; stock_ml: number; unit: string; status: string }[]
): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const date = new Date().toISOString().slice(0, 10);
  const rows = items.map((item) => [
    date,
    item.name,
    item.stock_ml,
    item.unit,
    item.status,
    "auto-synced",
  ]);

  if (rows.length === 0) return;

  // Write to a dedicated inventory sheet (create if not exists)
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Rekap_Inventory!A:Z",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  } catch {
    // Sheet might not exist — log but don't fail
    console.warn("Rekap_Inventory sheet not found, skipping inventory sync");
  }
}
