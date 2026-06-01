// src/lib/audit-engine.ts
// Audit Trail Engine — Log semua aktivitas, immutable record
import { readRange, writeRange, appendRows, SPREADSHEET_ID } from "./sheets";
import { db } from "./db";
import crypto from "crypto";

export const SPREADSHEET = SPREADSHEET_ID;

// ── Types ──────────────────────────────────────────────────────────

export type AuditAction =
  | "create" | "update" | "delete" | "view"
  | "login" | "logout" | "failed_login"
  | "approve" | "reject" | "submit"
  | "pay" | "receive" | "transfer"
  | "export" | "import" | "calculate";

export interface AuditEntry {
  id?: number;
  action: AuditAction;
  actor: string;           // user yang melakukan
  entityType: string;      // "investor", "sukuk", "transaksi", "rab", dll
  entityId?: number;
  description: string;
  oldValue?: string;       // JSON string
  newValue?: string;       // JSON string
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  hash: string;            // SHA-256 hash untuk integrity
  prevHash?: string;       // hash sebelumnya (chain)
}

// ── Log activity ───────────────────────────────────────────────────

export async function logActivity(entry: Omit<AuditEntry, "hash" | "prevHash">): Promise<AuditEntry> {
  // Get previous hash untuk chain
  const prevHash = await getLastHash();

  // Calculate hash
  const data = `${entry.action}|${entry.actor}|${entry.entityType}|${entry.entityId || ""}|${entry.description}|${entry.createdAt}|${prevHash || "genesis"}`;
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  const fullEntry: AuditEntry = { ...entry, hash, prevHash };

  // Save to SQLite
  try {
    db.prepare(`
      INSERT INTO audit_log (action, actor, entity_type, entity_id, details, data_hash, prev_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.action,
      entry.actor,
      entry.entityType,
      entry.entityId || null,
      entry.description,
      hash,
      prevHash || null,
      entry.createdAt,
    );
  } catch {
    // Table might not exist
  }

  // Append to Google Sheets
  try {
    await appendRows("audit_log", [[
      entry.action,
      entry.actor,
      entry.entityType,
      entry.entityId || "",
      entry.description,
      hash,
      prevHash || "genesis",
      entry.createdAt,
    ]]);
  } catch {
    // Sheet might not exist
  }

  return fullEntry;
}

// ── Verify chain integrity ─────────────────────────────────────────

export async function verifyChain(): Promise<{
  isValid: boolean;
  totalEntries: number;
  brokenAt?: number;
}> {
  try {
    const data = await readRange("audit_log!A1:H100");
    let prevHash = "genesis";
    let totalEntries = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      totalEntries++;

      const action = row[0];
      const actor = row[1];
      const entityType = row[2];
      const entityId = row[3];
      const description = row[4];
      const storedHash = row[5];
      const storedPrevHash = row[6];
      const createdAt = row[7];

      // Verify chain link
      if (storedPrevHash !== prevHash) {
        return { isValid: false, totalEntries, brokenAt: i };
      }

      // Verify hash
      const expectedData = `${action}|${actor}|${entityType}|${entityId}|${description}|${createdAt}|${storedPrevHash}`;
      const expectedHash = crypto.createHash("sha256").update(expectedData).digest("hex");

      if (expectedHash !== storedHash) {
        return { isValid: false, totalEntries, brokenAt: i };
      }

      prevHash = storedHash;
    }

    return { isValid: true, totalEntries };
  } catch {
    return { isValid: true, totalEntries: 0 };
  }
}

// ── Query audit trail ──────────────────────────────────────────────

export async function queryAuditTrail(filters?: {
  actor?: string;
  entityType?: string;
  entityId?: number;
  action?: AuditAction;
  fromDate?: string;
  toDate?: string;
}): Promise<AuditEntry[]> {
  const data = await readRange("audit_log!A1:H500");
  const entries: AuditEntry[] = [];

  for (const row of data.slice(1)) {
    if (!row[0]) continue;

    const entry: AuditEntry = {
      action: row[0] as AuditAction,
      actor: row[1],
      entityType: row[2],
      entityId: row[3] ? parseInt(row[3]) : undefined,
      description: row[4],
      hash: row[5],
      prevHash: row[6] || undefined,
      createdAt: row[7],
    };

    // Apply filters
    if (filters?.actor && !entry.actor.toLowerCase().includes(filters.actor.toLowerCase())) continue;
    if (filters?.entityType && entry.entityType !== filters.entityType) continue;
    if (filters?.entityId && entry.entityId !== filters.entityId) continue;
    if (filters?.action && entry.action !== filters.action) continue;
    if (filters?.fromDate && entry.createdAt < filters.fromDate) continue;
    if (filters?.toDate && entry.createdAt > filters.toDate) continue;

    entries.push(entry);
  }

  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Get last hash ──────────────────────────────────────────────────

async function getLastHash(): Promise<string | undefined> {
  try {
    const data = await readRange("audit_log!A1:H500");
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][5]) return data[i][5];
    }
  } catch {
    // ignore
  }
  return undefined;
}

// ── Get activity summary ───────────────────────────────────────────

export async function getActivitySummary(days: number = 30): Promise<{
  totalActions: number;
  byAction: Record<string, number>;
  byActor: Record<string, number>;
  byEntityType: Record<string, number>;
  recentActivity: AuditEntry[];
}> {
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const entries = await queryAuditTrail({ fromDate });

  const byAction: Record<string, number> = {};
  const byActor: Record<string, number> = {};
  const byEntityType: Record<string, number> = {};

  for (const entry of entries) {
    byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    byActor[entry.actor] = (byActor[entry.actor] || 0) + 1;
    byEntityType[entry.entityType] = (byEntityType[entry.entityType] || 0) + 1;
  }

  return {
    totalActions: entries.length,
    byAction,
    byActor,
    byEntityType,
    recentActivity: entries.slice(0, 20),
  };
}
