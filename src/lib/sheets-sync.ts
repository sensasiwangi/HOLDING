// src/lib/sheets-sync.ts
// Google Sheets Sync Engine
// Setiap transaksi/input di dashboard → tulis ke sheet utama →
// otomatis sync ke sheet terkait

import { appendRows, readRange, writeRange, SPREADSHEET_ID } from "./sheets";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Sync Rules ────────────────────────────────────────────────────
// Definisikan: ketika data ditulis ke sheet X, apa yang harus di-update di sheet Y?

export interface SyncRule {
  source: string;       // nama sheet input
  targets: SyncTarget[];
}

export interface SyncTarget {
  sheet: string;        // nama sheet target
  action: "append" | "update" | "calculate";
  // Untuk "append": tambah row baru
  // Untuk "update": update summary/range tertentu
  // Untuk "calculate": hitung ulang formula
  mapRow?: (sourceRow: any[], sheetsData: Record<string, any[][]>) => any[];
}

// ── Financial Transaction → Cash_Harian + Buku_Kas + Dashboard ──

/** Catat transaksi ke Cash_Harian + sync ke Buku_Kas + Dashboard */
export async function recordTransaction(tx: {
  date: string;
  accountId: string;
  category: string;
  description: string;
  inflow: number;
  outflow: number;
  division: string;
  balance?: number;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  // 1. Tulis ke Cash_Harian
  const cashRow = [
    tx.date,
    tx.accountId,
    tx.category,
    tx.description,
    tx.inflow,
    tx.outflow,
    now,
    tx.division,
  ];
  await appendRows("Cash_Harian", [cashRow]);

  // 2. Hitung saldo untuk Buku_Kas (ambil saldo terakhir)
  const saldo = await getLastBalance(tx.accountId);

  // 3. Tulis ke Buku_Kas
  const bukuRow = [
    tx.date,
    tx.description,
    tx.inflow,
    tx.outflow,
    saldo + tx.inflow - tx.outflow,
    tx.accountId,
    now,
    tx.division,
  ];
  await appendRows("Buku_Kas", [bukuRow]);

  // 4. Update Dashboard divisi (hitung ulang total per divisi)
  await syncDashboard();

  return { success: true, cashRow, bukuRow };
}

/** Ambil saldo terakhir dari akun tertentu di Buku_Kas */
async function getLastBalance(accountId: string): Promise<number> {
  try {
    const data = await readRange("Buku_Kas!A2:H100");
    const akunRows = data.filter((r) => r[5] === accountId);
    if (akunRows.length === 0) return 0;
    const lastRow = akunRows[akunRows.length - 1];
    return parseFloat(String(lastRow[4]).replace(/[^\d.-]/g, "")) || 0;
  } catch {
    return 0;
  }
}

/** Sync Dashboard — hitung ulang total per divisi */
export async function syncDashboard() {
  try {
    const txData = await readRange("Cash_Harian!A2:I500");
    const divisions = ["Produksi", "Event", "Store", "Ecommerse"];
    const totals: Record<string, { income: number; expense: number }> = {};
    divisions.forEach((d) => (totals[d] = { income: 0, expense: 0 }));

    txData.forEach((row) => {
      const div = row[7] || row[7]; // Divisi column
      const income = parseFloat(String(row[4] || "0").replace(/[^\d.-]/g, "")) || 0;
      const expense = parseFloat(String(row[5] || "0").replace(/[^\d.-]/g, "")) || 0;
      if (totals[div]) {
        totals[div].income += income;
        totals[div].expense += expense;
      }
    });

    // Update Dashboard rows (row 5=Produksi, 6=Event, 7=Store, 8=Ecommerse di 1-indexed)
    const dashboardRows = [
      // A5:F5 = Produksi
      ["Produksi", totals.Produksi.income, totals.Produksi.expense, totals.Produksi.income - totals.Produksi.expense, Math.round(totals.Produksi.income * 0.3), totals.Produksi.income - totals.Produksi.expense - Math.round(totals.Produksi.income * 0.3)],
      // A6:F6 = Event
      ["Event", totals.Event.income, totals.Event.expense, totals.Event.income - totals.Event.expense, Math.round(totals.Event.income * 0.3), totals.Event.income - totals.Event.expense - Math.round(totals.Event.income * 0.3)],
      // A7:F7 = Store
      ["Store", totals.Store.income, totals.Store.expense, totals.Store.income - totals.Store.expense, Math.round(totals.Store.income * 0.3), totals.Store.income - totals.Store.expense - Math.round(totals.Store.income * 0.3)],
      // A8:F8 = Ecommerse
      ["Ecommerse", totals.Ecommerse.income, totals.Ecommerse.expense, totals.Ecommerse.income - totals.Ecommerse.expense, Math.round(totals.Ecommerse.income * 0.3), totals.Ecommerse.income - totals.Ecommerse.expense - Math.round(totals.Ecommerse.income * 0.3)],
    ];

    await writeRange("Dashboard!A5:F8", dashboardRows);

    // Update TOTAL row
    const totalIncome = divisions.reduce((s, d) => s + totals[d].income, 0);
    const totalExpense = divisions.reduce((s, d) => s + totals[d].expense, 0);
    const totalProfit = totalIncome - totalExpense;
    const totalSetoran = Math.round(totalIncome * 0.3);
    const totalSisa = totalProfit - totalSetoran;

    await writeRange("Dashboard!A9:F9", [
      ["TOTAL", totalIncome, totalExpense, totalProfit, totalSetoran, totalSisa],
    ]);
  } catch (e) {
    console.error("syncDashboard error:", e);
  }
}

// ── Investor Transaction → SukukStore + SukukInvestor + DB ──────

/** Catat investasi baru → update sheet sukuk */
export async function recordInvestment(data: {
  investorName: string;
  investorEmail: string;
  investorPhone: string;
  sukukId: string;
  unit: number;
  nominal: number;
  date: string;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  // 1. Append ke SukukStore investor list
  await appendRows("SukukInvestor", [
    [
      data.investorName,
      data.investorEmail,
      data.investorPhone,
      data.sukukId,
      data.unit,
      data.nominal,
      data.date,
      "pending",
      now,
    ],
  ]);

  return { success: true };
}

// ── RAB Item → RAB_Store_TIM + Dashboard ──────────────────────────

/** Catat item RAB baru */
export async function recordRABItem(item: {
  kode: string;
  kategori: string;
  item: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  sumberDana: string;
  pic: string;
  fase: string;
}) {
  const total = item.qty * item.hargaSatuan;
  await appendRows("RABStoreTIM", [
    [
      item.kode,
      item.kategori,
      "",
      item.item,
      item.qty,
      item.satuan,
      item.hargaSatuan,
      total,
      item.sumberDana,
      item.pic,
      "",
      item.fase,
    ],
  ]);

  return { success: true, total };
}

// ── Profit Distribution → Sukuk_Payment_Schedule ─────────────────

/** Catat pembagian hasil */
export async function recordDistribution(data: {
  sukukId: string;
  periode: string;
  revenue: number;
  investorShare: number;
  swiShare: number;
}) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  await appendRows("SukukPaymentSchedule", [
    [
      data.sukukId,
      data.periode,
      data.revenue,
      data.investorShare,
      data.swiShare,
      "pending",
      now,
    ],
  ]);

  return { success: true };
}
