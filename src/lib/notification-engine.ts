// src/lib/notification-engine.ts
// Notification Engine — Alert stok menipis, jatuh tempo, target tercapai
import { readRange, writeRange, appendRows, SPREADSHEET_ID } from "./sheets";
import { db } from "./db";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export type NotificationType =
  | "stok_menipis"      // Stok di bawah minimum
  | "stok_habis"        // Stok = 0
  | "jatuh_tempo"       // Pembayaran segera jatuh tempo
  | "target_tercapai"   // Target penjualan/tercapai
  | "produksi_selesai"  // Batch produksi selesai
  | "pemasukan_besar"   // Pemasukan di atas threshold
  | "pengeluaran_besar" // Pengeluaran di atas threshold
  | "saldo_rendah"      // Saldo kas rendah
  | "rab_overrun"       // RAB melebihi anggaran
  | "kyc_pending"       // KYC investor butuh verifikasi
  | "bagi_hasil";       // Jadwal bagi hasil

export interface Notification {
  id?: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  entityType?: string;
  entityId?: string | number;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface AlertRule {
  type: NotificationType;
  condition: string;
  threshold: number;
  enabled: boolean;
  channels: ("in_app" | "telegram" | "email")[];
}

// ── Default Alert Rules ────────────────────────────────────────────

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  { type: "stok_menipis", condition: "stok <= minStok", threshold: 0, enabled: true, channels: ["in_app", "telegram"] },
  { type: "stok_habis", condition: "stok == 0", threshold: 0, enabled: true, channels: ["in_app", "telegram", "email"] },
  { type: "jatuh_tempo", condition: "daysUntilDue <= 3", threshold: 3, enabled: true, channels: ["in_app", "telegram"] },
  { type: "target_tercapai", condition: "progress >= 100", threshold: 100, enabled: true, channels: ["in_app"] },
  { type: "pemasukan_besar", condition: "amount >= 10000000", threshold: 10000000, enabled: true, channels: ["in_app"] },
  { type: "pengeluaran_besar", condition: "amount >= 50000000", threshold: 50000000, enabled: true, channels: ["in_app", "telegram"] },
  { type: "saldo_rendah", condition: "saldo <= 5000000", threshold: 5000000, enabled: true, channels: ["in_app", "telegram"] },
  { type: "rab_overrun", condition: "actual >= budget * 0.9", threshold: 90, enabled: true, channels: ["in_app", "telegram"] },
  { type: "kyc_pending", condition: "daysSinceSubmit >= 3", threshold: 3, enabled: true, channels: ["in_app", "telegram"] },
  { type: "bagi_hasil", condition: "daysUntilPayment <= 7", threshold: 7, enabled: true, channels: ["in_app", "telegram"] },
];

// ── Check alerts ──────────────────────────────────────────────────

export async function checkAlerts(): Promise<Notification[]> {
  const notifications: Notification[] = [];

  // 1. Stok menipis/habis
  const stokAlerts = await checkStokAlerts();
  notifications.push(...stokAlerts);

  // 2. Jatuh tempo pembayaran
  const tempoAlerts = await checkJatuhTempo();
  notifications.push(...tempoAlerts);

  // 3. Target tercapai
  const targetAlerts = await checkTargetTercapai();
  notifications.push(...targetAlerts);

  // 4. Saldo rendah
  const saldoAlerts = await checkSaldoRendah();
  notifications.push(...saldoAlerts);

  // 5. RAB overrun
  const rabAlerts = await checkRabOverrun();
  notifications.push(...rabAlerts);

  // Save notifications
  for (const notif of notifications) {
    await saveNotification(notif);
  }

  return notifications;
}

async function checkStokAlerts(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const data = await readRange("Merch_TIM!A1:L20");

  for (const row of data.slice(1)) {
    if (!row[0]) continue;
    const stok = parseNum(row[8]);
    const minStok = parseNum(row[9]);
    const nama = String(row[1]);

    if (stok === 0) {
      notifications.push({
        type: "stok_habis",
        title: `Stok Habis: ${nama}`,
        message: `Stok ${nama} sudah habis. Segera restock!`,
        priority: "urgent",
        entityType: "merch",
        entityId: row[0],
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (stok <= minStok) {
      notifications.push({
        type: "stok_menipis",
        title: `Stok Menipis: ${nama}`,
        message: `Stok ${nama} tersisa ${stok} pcs (min: ${minStok}). Perlu restock.`,
        priority: "high",
        entityType: "merch",
        entityId: row[0],
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return notifications;
}

async function checkJatuhTempo(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const jadwal = await readRange("Sukuk_Payment_Schedule!A1:L30");
  const today = new Date();

  for (const row of jadwal.slice(1)) {
    if (!row[1]) continue;
    const tanggalBayar = new Date(row[1]);
    const daysUntil = Math.ceil((tanggalBayar.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 7 && daysUntil >= 0) {
      notifications.push({
        type: "jatuh_tempo",
        title: `Jatuh Tempo: ${row[0]}`,
        message: `Pembayaran bagi hasil periode ${row[0]} jatuh tempo dalam ${daysUntil} hari (${row[1]})`,
        priority: daysUntil <= 3 ? "urgent" : "high",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return notifications;
}

async function checkTargetTercapai(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const brandData = await readRange("Brand_Tracking!A1:K10");

  for (const row of brandData.slice(1)) {
    if (!row[0]) continue;
    const terjual = parseNum(row[7]);
    const target = 50; // asumsi target 50 unit/bulan
    const pct = target > 0 ? (terjual / target) * 100 : 0;

    if (pct >= 100) {
      notifications.push({
        type: "target_tercapai",
        title: `Target Tercapai: ${row[0]}`,
        message: `${row[0]} mencapai ${terjual}/${target} unit terjual (${pct.toFixed(0)}%)`,
        priority: "medium",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return notifications;
}

async function checkSaldoRendah(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const cashData = await readRange("Cash_Harian!A1:I50");

  // Hitung saldo terakhir
  let saldo = 0;
  for (const row of cashData.slice(1)) {
    if (!row[0]) continue;
    saldo += parseNum(row[4]) - parseNum(row[5]);
  }

  if (saldo < 5000000) {
    notifications.push({
      type: "saldo_rendah",
      title: "Saldo Kas Rendah",
      message: `Saldo kas saat ini Rp ${saldo.toLocaleString("id-ID")}. Di bawah threshold Rp 5.000.000.`,
      priority: saldo < 1000000 ? "urgent" : "high",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  return notifications;
}

async function checkRabOverrun(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const rabData = await readRange("RAB_Store_TIM!A1:J60");

  const perKategori: Record<string, { anggaran: number; realisasi: number }> = {};
  for (const row of rabData.slice(1)) {
    if (!row[1]) continue;
    const kat = String(row[1]);
    if (!perKategori[kat]) perKategori[kat] = { anggaran: 0, realisasi: 0 };
    perKategori[kat].anggaran += parseNum(row[7]);
    if (row[11] === "done") perKategori[kat].realisasi += parseNum(row[7]);
  }

  for (const [kat, data] of Object.entries(perKategori)) {
    if (data.anggaran > 0 && data.realisasi >= data.anggaran * 0.9) {
      notifications.push({
        type: "rab_overrun",
        title: `RAB Hampir Habis: ${kat}`,
        message: `Realisasi ${kat} sudah ${(data.realisasi / data.anggaran * 100).toFixed(0)}% dari anggaran`,
        priority: data.realisasi >= data.anggaran ? "urgent" : "high",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return notifications;
}

// ── Save notification ──────────────────────────────────────────────

export async function saveNotification(notif: Notification): Promise<void> {
  // Save to SQLite
  try {
    db.prepare(`
      INSERT INTO notifications (event, channel, recipient, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      notif.type,
      "in_app",
      "admin",
      `${notif.title}: ${notif.message}`,
      "pending",
      notif.createdAt,
    );
  } catch {
    // Table might not exist yet, ignore
  }

  // Also append to Google Sheets notifications
  try {
    await appendRows("notifications", [[
      notif.type,
      notif.title,
      notif.message,
      notif.priority,
      "unread",
      notif.createdAt,
    ]]);
  } catch {
    // Sheet might not have notifications tab, ignore
  }
}

// ── Read notifications ─────────────────────────────────────────────

export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  try {
    const data = await readRange("notifications!A1:F50");
    const notifications: Notification[] = [];

    for (const row of data.slice(1)) {
      if (!row[0]) continue;
      if (unreadOnly && row[4] === "read") continue;

      notifications.push({
        type: row[0] as NotificationType,
        title: String(row[1] || ""),
        message: String(row[2] || ""),
        priority: (row[3] || "medium") as any,
        isRead: row[4] === "read",
        createdAt: row[5] || new Date().toISOString(),
      });
    }

    return notifications;
  } catch {
    return [];
  }
}

function parseNum(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  try { return parseFloat(cleaned) || 0; } catch { return 0; }
}
