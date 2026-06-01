// src/lib/qc-flow.ts
// P2-1: QC (Quality Control) Check Flow
// Alur kontrol kualitas: bahan baku → mixing → bottling → produk jadi

import { getDb } from "./swi-db";

// ── Types ──────────────────────────────────────────────────────

export type QCStage = "incoming" | "mixing" | "bottling" | "packaging" | "finished";
export type QCStatus = "pending" | "passed" | "failed" | "conditional";

export interface QCCheckItem {
  id: number;
  stage: QCStage;
  item_name: string;
  check_type: string;
  standard: string;
  is_required: boolean;
  sort_order: number;
}

export interface QCResult {
  id: number;
  batch_id: number;
  stage: QCStage;
  check_item_id: number;
  check_item_name: string;
  status: QCStatus;
  measured_value: string | string | null;
  notes: string | null;
  checked_by: string | null;
  created_at: string;
}

export interface QCStageResult {
  stage: QCStage;
  stage_label: string;
  status: QCStatus;
  checks_total: number;
  checks_passed: number;
  checks_failed: number;
  checks_pending: number;
  results: QCResult[];
}

export interface QCBatchReport {
  batch_id: number;
  formula_code: string | null;
  product_name: string | null;
  overall_status: QCStatus;
  stages: QCStageResult[];
  started_at: string | null;
  completed_at: string | null;
}

// ── Stage Labels ───────────────────────────────────────────────

const STAGE_LABELS: Record<QCStage, string> = {
  incoming: "Penerimaan Bahan Baku",
  mixing: "Proses Mixing",
  bottling: "Proses Bottling",
  packaging: "Proses Packaging",
  finished: "Produk Jadi (Final QC)",
};

// ── Schema ─────────────────────────────────────────────────────

export function createQCTables(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS qc_check_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stage TEXT NOT NULL CHECK(stage IN ('incoming', 'mixing', 'bottling', 'packaging', 'finished')),
      item_name TEXT NOT NULL,
      check_type TEXT NOT NULL,
      standard TEXT NOT NULL,
      is_required INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS qc_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      stage TEXT NOT NULL,
      check_item_id INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'passed', 'failed', 'conditional')),
      measured_value TEXT,
      notes TEXT,
      checked_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_qc_batch ON qc_results(batch_id);
    CREATE INDEX IF NOT EXISTS idx_qc_stage ON qc_results(stage);
  `);

  // Seed QC check items if empty
  const count = db.prepare("SELECT COUNT(*) as c FROM qc_check_items").get() as { c: number };
  if (count.c > 0) return;

  const items: [QCStage, string, string, string, boolean, number][] = [
    // INCOMING — Penerimaan Bahan Baku
    ["incoming", "Dokumen MSDS", "document", "MSDS tersedia & valid", true, 1],
    ["incoming", "Label & Batch Number", "visual", "Label jelas, batch number tertera", true, 2],
    ["incoming", "Segel / Packaging Utuh", "visual", "Tidak bocor, tidak rusak", true, 3],
    ["incoming", "Aroma / Warna", "organoleptik", "Sesuai deskripsi material, tidak tengik", true, 4],
    ["incoming", "Expired Date", "document", "Belum expired, masih >6 bulan", true, 5],
    ["incoming", "Neto / Volume", "ukur", "Sesuai kemasan ±5%", false, 6],

    // MIXING — Proses Mixing
    ["mixing", "Kebersihan Alat", "visual", "Beaker, pipet, corong bersih & kering", true, 10],
    ["mixing", "Urutan Penambahan", "procedural", "Top → Middle → Base, sesuai formula", true, 11],
    ["mixing", "Dosis / Takaran", "ukur", "Drops & gram sesuai formula ±2%", true, 12],
    ["mixing", "Homogenitas Campuran", "visual", "Campuran merata, tidak ada layer terpisah", true, 13],
    ["mixing", "Warna Campuran", "visual", "Sesuai ekspektasi formula", false, 14],
    ["mixing", "Aroma Initial", "organoleptik", "Tidak ada bau abnormal/seperti terbakar", true, 15],

    // BOTTLING — Proses Bottling
    ["bottling", "Kebersihan Botol", "visual", "Botol 30ml bersih, kering, tidak ada debu", true, 20],
    ["bottling", "Transfer Tanpa Tumpahan", "procedural", "Corong digunakan, tidak ada tumpahan", true, 21],
    ["bottling", "Volume Akhir", "ukur", "30ml ±0.5ml", true, 22],
    ["bottling", "Penutupan Botol", "visual", "Spray cap / tutup rapat, tidak bocor", true, 23],
    ["bottling", "No Batch & Kode Formula", "document", "Label batch & kode formula tertera", true, 24],

    // PACKAGING — Proses Packaging
    ["packaging", "Stiker Label", "visual", "Stiker lurus, tidak ada bubble, info lengkap", true, 30],
    ["packaging", "Kotak Packaging", "visual", "Kotak tidak rusak, bersih", true, 31],
    ["packaging", "Pouch / Tisu", "visual", "Pouch kain / tisu pembungkus rapi", false, 32],
    ["packaging", "Kelengkapan Paket", "checklist", "Botol + stiker + kotak + tisu + leaflet", true, 33],

    // FINISHED — Final QC Produk Jadi
    ["finished", "Penampakan Visual", "visual", "Botol bersih, label rapi, kotak tidak penyok", true, 40],
    ["finished", "Atomizer / Spray Test", "functional", "Spray halus, tidak bocor, tidak macet", true, 41],
    ["finished", "Aroma Setelah Maturation", "organoleptik", "Sesuai profil formula, tidak tengik", true, 42],
    ["finished", "Tidak Ada Partikel", "visual", "Tidak ada partikel/kristal di cairan", true, 43],
    ["finished", "Berat Total Paket", "ukur", "Sesuai spesifikasi ±10g", false, 44],
    ["finished", "Dokumen Lengkap", "document", "COA (Certificate of Analysis) tersedia", true, 45],
  ];

  const stmt = db.prepare(`
    INSERT INTO qc_check_items (stage, item_name, check_type, standard, is_required, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    stmt.run(item[0], item[1], item[2], item[3], item[4] ? 1 : 0, item[5]);
  }
}

// ── Get Check Items ─────────────────────────────────────────────

export function getCheckItems(stage?: QCStage): QCCheckItem[] {
  const db = getDb();
  createQCTables();

  if (stage) {
    return db.prepare("SELECT * FROM qc_check_items WHERE stage = ? ORDER BY sort_order").all(stage) as QCCheckItem[];
  }
  return db.prepare("SELECT * FROM qc_check_items ORDER BY stage, sort_order").all() as QCCheckItem[];
}

// ── Create QC Batch ─────────────────────────────────────────────

export function createQCBatch(batchId: number, productName?: string): void {
  const db = getDb();
  createQCTables();

  const checkItems = getCheckItems();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO qc_results (batch_id, stage, check_item_id, status)
    VALUES (?, ?, ?, 'pending')
  `);

  for (const item of checkItems) {
    stmt.run(batchId, item.stage, item.id);
  }
}

// ── Submit QC Check ─────────────────────────────────────────────

export function submitQCCheck(
  batchId: number,
  checkItemId: number,
  status: QCStatus,
  measuredValue?: string,
  notes?: string,
  checkedBy?: string
): number {
  const db = getDb();
  createQCTables();

  // Find existing result
  const existing = db.prepare(
    "SELECT id FROM qc_results WHERE batch_id = ? AND check_item_id = ?"
  ).get(batchId, checkItemId) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE qc_results SET status = ?, measured_value = ?, notes = ?, checked_by = ?, created_at = datetime('now')
      WHERE id = ?
    `).run(status, measuredValue || null, notes || null, checkedBy || null, existing.id);
    return existing.id;
  }

  const item = db.prepare("SELECT stage FROM qc_check_items WHERE id = ?").get(checkItemId) as { stage: string } | undefined;
  const info = db.prepare(`
    INSERT INTO qc_results (batch_id, stage, check_item_id, status, measured_value, notes, checked_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(batchId, item?.stage || "incoming", checkItemId, status, measuredValue || null, notes || null, checkedBy || null);

  return info.lastInsertRowid as number;
}

// ── Get Batch QC Report ────────────────────────────────────────

export function getQCBatchReport(batchId: number): QCBatchReport {
  const db = getDb();
  createQCTables();

  // Get batch info
  const batch = db.prepare(`
    SELECT pb.*, f.formula_code, f.ai_mood
    FROM product_batches pb
    LEFT JOIN formulas f ON f.id = pb.formula_id
    WHERE pb.id = ?
  `).get(batchId) as any;

  const stages: QCStage[] = ["incoming", "mixing", "bottling", "packaging", "finished"];
  const stageResults: QCStageResult[] = [];

  for (const stage of stages) {
    const results = db.prepare(`
      SELECT qr.*, qci.item_name, qci.is_required
      FROM qc_results qr
      LEFT JOIN qc_check_items qci ON qci.id = qr.check_item_id
      WHERE qr.batch_id = ? AND qr.stage = ?
      ORDER BY qci.sort_order
    `).all(batchId, stage) as (QCResult & { item_name: string; is_required: boolean })[];

    if (results.length === 0) continue;

    const passed = results.filter(r => r.status === "passed").length;
    const failed = results.filter(r => r.status === "failed").length;
    const pending = results.filter(r => r.status === "pending").length;

    let status: QCStatus = "passed";
    if (failed > 0) {
      // Check if any failed item is required
      const hasRequiredFail = results.some(r => r.status === "failed" && r.is_required);
      status = hasRequiredFail ? "failed" : "conditional";
    } else if (pending > 0) {
      status = "pending";
    }

    stageResults.push({
      stage,
      stage_label: STAGE_LABELS[stage],
      status,
      checks_total: results.length,
      checks_passed: passed,
      checks_failed: failed,
      checks_pending: pending,
      results,
    });
  }

  // Determine overall status
  let overall: QCStatus = "passed";
  for (const sr of stageResults) {
    if (sr.status === "failed") {
      overall = "failed";
      break;
    }
  }
  if (overall !== "failed") {
    for (const sr of stageResults) {
      if (sr.status === "pending") {
        overall = "pending";
        break;
      }
      if (sr.status === "conditional" && overall === "passed") {
        overall = "conditional";
      }
    }
  }

  return {
    batch_id: batchId,
    formula_code: batch?.formula_code || null,
    product_name: batch?.batch_name || null,
    overall_status: overall,
    stages: stageResults,
    started_at: batch?.created_at || null,
    completed_at: null, // set when all stages passed
  };
}

// ── Get QC Statistics ──────────────────────────────────────────

export function getQCStats(days: number = 30): {
  total_batches: number;
  passed: number;
  failed: number;
  pending: number;
  conditional: number;
  pass_rate_pct: number;
} {
  const db = getDb();
  createQCTables();

  const batches = db.prepare(`
    SELECT DISTINCT batch_id FROM qc_results
    WHERE created_at >= date('now', ?)
  `).all(`-${days} days`) as { batch_id: number }[];

  let passed = 0, failed = 0, pending = 0, conditional = 0;

  for (const { batch_id } of batches) {
    const report = getQCBatchReport(batch_id);
    if (report.overall_status === "passed") passed++;
    else if (report.overall_status === "failed") failed++;
    else if (report.overall_status === "pending") pending++;
    else conditional++;
  }

  const total = passed + failed + pending + conditional;
  return {
    total_batches: total,
    passed,
    failed,
    pending,
    conditional,
    pass_rate_pct: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}

// ── Complete QC (final approval) ───────────────────────────────

export function completeQC(batchId: number, approvedBy?: string): boolean {
  const db = getDb();
  const report = getQCBatchReport(batchId);

  if (report.overall_status === "failed") return false;

  // Update batch status
  db.prepare("UPDATE product_batches SET qc_status = ?, updated_at = datetime('now') WHERE id = ?").run("passed", batchId);

  // Log approval
  db.prepare(`
    INSERT INTO qc_results (batch_id, stage, status, notes, checked_by)
    VALUES (?, 'finished', 'passed', 'QC Final Approved', ?)
  `).run(batchId, approvedBy || "system");

  return true;
}
