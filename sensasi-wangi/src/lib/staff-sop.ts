// src/lib/staff-sop.ts
// P2-3: Staff SOP (Standard Operating Procedure) App
// Panduan langkah kerja staf produksi parfum, digital checklist, training tracker

import { getDb } from "./swi-db";

// ── Types ──────────────────────────────────────────────────────

export interface SOPDocument {
  id: number;
  code: string;
  title: string;
  category: string;
  version: string;
  steps: SOPStep[];
  estimated_minutes: number;
  difficulty: "pemula" | "menengah" | "lanjut";
  safety_warnings: string[];
  required_tools: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOPStep {
  step_number: number;
  title: string;
  description: string;
  duration_seconds: number;
  warning?: string;
  image_hint?: string; // deskripsi gambar untuk UI
}

export interface SOPAssignment {
  id: number;
  sop_id: number;
  staff_name: string;
  status: "pending" | "in_progress" | "completed" | "needs_review";
  checklist: SOPChecklistItem[];
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  score: number | null; // 0-100
}

export interface SOPChecklistItem {
  step_number: number;
  title: string;
  checked: boolean;
  checked_at: string | null;
  notes: string | null;
}

export interface StaffTraining {
  id: number;
  staff_name: string;
  sop_code: string;
  sop_title: string;
  status: "not_started" | "in_training" | "completed" | "certified";
  completed_at: string | null;
  score: number | null;
}

// ── Schema ─────────────────────────────────────────────────────

export function createSOPTables(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS sop_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      version TEXT DEFAULT '1.0',
      content TEXT NOT NULL,  -- JSON: { steps, estimated_minutes, difficulty, safety, tools }
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sop_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sop_id INTEGER NOT NULL,
      staff_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'needs_review')),
      checklist TEXT,  -- JSON: [{ step_number, title, checked, checked_at, notes }]
      started_at TEXT,
      completed_at TEXT,
      notes TEXT,
      score INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS staff_training (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_name TEXT NOT NULL,
      sop_code TEXT NOT NULL,
      sop_title TEXT NOT NULL,
      status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_training', 'completed', 'certified')),
      completed_at TEXT,
      score INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sop_category ON sop_documents(category);
    CREATE INDEX IF NOT EXISTS idx_assignments_staff ON sop_assignments(staff_name);
    CREATE INDEX IF NOT EXISTS idx_assignments_status ON sop_assignments(status);
    CREATE INDEX IF NOT EXISTS idx_training_staff ON staff_training(staff_name);
  `);

  // Seed SOP documents if empty
  const count = db.prepare("SELECT COUNT(*) as c FROM sop_documents").get() as { c: number };
  if (count.c > 0) return;

  const docs: { code: string; title: string; category: string; difficulty: string; minutes: number; safety: string[]; tools: string[]; steps: SOPStep[] }[] = [
    {
      code: "SOP-RM-001",
      title: "Penerimaan & Pemeriksaan Bahan Baku",
      category: "bahan_baku",
      difficulty: "pemula",
      minutes: 15,
      safety: ["Gunakan saat menerima bahan baku baru", "Periksa MSDS sebelum buka kemasan", "Pakai sarung tangan jika diperlukan"],
      tools: ["Sarung tangga", "Kaca mata pelindung", "Kertas saring", "Termometer"],
      steps: [
        { step_number: 1, title: "Terima dan Periksa Kemasan", description: "Cek apakah kemasan utuh, tidak bocor, label jelas. Catat nomor batch dan expired date.", duration_seconds: 120 },
        { step_number: 2, title: "Verifikasi Dokumen", description: "Pastikan Certificate of Analysis (COA) atau MSDS tersedia. Cocokkan dengan PO.", duration_seconds: 120 },
        { step_number: 3, title: "Visual & Organoleptik", description: "Periksa warna, kejernihan, aroma. Bandingkan dengan sampel referensi.", duration_seconds: 180, warning: "Jika ada bau tengik/rusak → REJECT" },
        { step_number: 4, title: "Catat di Sistem", description: "Input data ke sistem: batch number, jumlah, expired date, supplier. Update stok.", duration_seconds: 60 },
        { step_number: 5, title: "Simpan di Rak", description: "Tempatkan di rak sesuai kategori (floral, woody, dll). Simpan di tempat sejuk & gelap.", duration_seconds: 60 },
      ],
    },
    {
      code: "SOP-MIX-001",
      title: "Proses Mixing Formula Parfum",
      category: "produksi",
      difficulty: "menengah",
      minutes: 45,
      safety: ["Kerja di area ventilasi baik", "Jangan hisap uap langsung", "Pakai sarung tangan karet"],
      tools: ["Beaker 50-100ml", "Pipet tetes", "Corong kecil", "Pengaduk kaca", "Timbangan digital", "Timer"],
      steps: [
        { step_number: 1, title: "Siapkan Alat & Bahan", description: "Letakkan semua bahan yang ada di formula. Pastikan semua tersedia & stok cukup.", duration_seconds: 120 },
        { step_number: 2, title: "Bersihkan Area Kerja", description: "Area kerja harus bersih, kering, bebas debu.", duration_seconds: 60 },
        { step_number: 3, title: "Takar Top Notes", description: "Teteskan bahan top notes sesuai dosis formula (tetes & gram). Catat urutan.", duration_seconds: 300 },
        { step_number: 4, title: "Aduk Top Notes", description: "Goyangkan beaker perlahan 10x. Aroma top mulai terbentuk.", duration_seconds: 60 },
        { step_number: 5, title: "Takar Middle Notes", description: "Tambahkan bahan middle notes. Urutan: floral → fruity → spicy.", duration_seconds: 300, warning: "Perhatikan dosis — jangan sampai over" },
        { step_number: 6, title: "Aduk Middle + Top", description: "Goyang perlahan, cek homogenitas visual & aroma.", duration_seconds: 60 },
        { step_number: 7, title: "Takar Base Notes", description: "Tambahkan bahan base notes (woody, musk, ambery). Ini akan mengikat aroma.", duration_seconds: 300 },
        { step_number: 8, title: "Aduk Semua Layer", description: "Goyang beaker 30 detik sampai homogen. Cek warna & aroma.", duration_seconds: 120 },
        { step_number: 9, title: "Tambahkan Ethanol 96%", description: "Tuang etanol sampai volume total 30ml. Aduk 1 menit.", duration_seconds: 90 },
        { step_number: 10, title: "Catat & Label", description: "Isi label: kode formula, tanggal, nama staf. Tempel di beaker.", duration_seconds: 60 },
      ],
    },
    {
      code: "SOP-BTL-001",
      title: "Proses Bottling & Penutupan",
      category: "produksi",
      difficulty: "pemula",
      minutes: 20,
      safety: ["Hati-hati dengan etanol — mudah terbakar", "Jangan merokok di area kerja"],
      tools: ["Corong stainless", "Botol 30ml (bersih)", "Spray cap / tutup botol", "Tisu"],
      steps: [
        { step_number: 1, title: "Siapkan Botol Bersih", description: "Cek botol 30ml — harus bersih, kering, tidak ada debu.", duration_seconds: 60 },
        { step_number: 2, title: "Transfer dengan Corong", description: "Letakkan corong di lubang botol. Tuang campuran perlahan.", duration_seconds: 90, warning: "Hindari tumpahan — etanol mudah menguap" },
        { step_number: 3, title: "Cek Volume", description: "Pastikan volume ~30ml (garis ukur). Tambah/kurangi jika perlu.", duration_seconds: 30 },
        { step_number: 4, title: "Pasang Spray Cap", description: "Tutup botol dengan spray cap. Pastikan kencang & tidak bocor.", duration_seconds: 60 },
        { step_number: 5, title: "Test Spray", description: "Coba semprot 1-2x ke tisu. Pastikan semprotan halus.", duration_seconds: 30 },
        { step_number: 6, title: "Bersihkan Botol", description: "Lap botol dengan tisu jika ada tetesan.", duration_seconds: 30 },
      ],
    },
    {
      code: "SOP-PKG-001",
      title: "Produk Jadi & Packaging",
      category: "packaging",
      difficulty: "pemula",
      minutes: 15,
      safety: [],
      tools: ["Kotak parfum", "Stiker label", "Tisu pembungkus", "Pouch kain", "Leaflet"],
      steps: [
        { step_number: 1, title: "Pastikan Botol Label Ada", description: "Cek label kode formula & batch number sudah terpasang.", duration_seconds: 30 },
        { step_number: 2, title: "Keluarkan dari Rak Maturation", description: "Ambil botol sesuai formula order. Cek status maturation.", duration_seconds: 30 },
        { step_number: 3, title: "Final Visual QC", description: "Cek botol bersih, spray berfungsi, tidak bocor, warna normal.", duration_seconds: 60, warning: "Jika gagal QC → kembalikan ke staf produksi" },
        { step_number: 4, title: "Bungkus dengan Tisu", description: "Lilit botol dengan tisu pembungkus.", duration_seconds: 30 },
        { step_number: 5, title: "Masukkan ke Pouch", description: "Masukkan botol ke pouch kain.", duration_seconds: 30 },
        { step_number: 6, title: "Masukkan ke Kotak", description: "Susun di kotak: botol + pouch + leaflet.", duration_seconds: 30 },
        { step_number: 7, title: "Tempel Stiker & Seal", description: "Tutup kotak, tempel stiker brand.", duration_seconds: 30 },
      ],
    },
    {
      code: "SOP-CLN-001",
      title: "Pembersihan & Sanitasi Area Kerja",
      category: "sanitasi",
      difficulty: "pemula",
      minutes: 10,
      safety: ["Pastikan etanol sudah disimpan aman sebelum bersih area", "Ventilasi harus baik"],
      tools: ["Tisu basah", "Alkohol 70%", "Sapu kecil", "Kantong sampah"],
      steps: [
        { step_number: 1, title: "Kumpulkan Sisa Bahan", description: "Kumpulkan beaker, pipet, corong yang sudah dipakai.", duration_seconds: 60 },
        { step_number: 2, title: "Cuci Alat dengan Air", description: "Bersihkan sisa bahan dengan air bersih.", duration_seconds: 120 },
        { step_number: 3, title: "Desinfeksi", description: "Semprot alkohol 70% ke semua alat & permukaan kerja.", duration_seconds: 60 },
        { step_number: 4, title: "Keringkan", description: "Biarkan alat kering bermata udara atau lap dengan tisu bersih.", duration_seconds: 120 },
        { step_number: 5, title: "Simpan Alat", description: "Simpan di tempat yang bersih & tertutup.", duration_seconds: 60 },
        { step_number: 6, title: "Buang Sampah", description: "Buang tisu & sisa bahan ke tempat sampah.", duration_seconds: 30 },
      ],
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO sop_documents (code, title, category, version, content, is_active)
    VALUES (?, ?, ?, '1.0', ?, 1)
  `);

  const categoryLabels: Record<string, string> = {
    bahan_baku: "Bahan Baku",
    produksi: "Produksi",
    packaging: "Packaging",
    sanitasi: "Sanitasi",
  };

  for (const doc of docs) {
    const content = JSON.stringify({
      steps: doc.steps,
      estimated_minutes: doc.minutes,
      difficulty: doc.difficulty,
      safety_warnings: doc.safety,
      required_tools: doc.tools,
    });
    stmt.run(doc.code, doc.title, doc.category, content);
  }
}

// ── SOP CRUD ────────────────────────────────────────────────────

export function getSOPs(category?: string): SOPDocument[] {
  const db = getDb();
  createSOPTables();

  let rows: any[];
  if (category) {
    rows = db.prepare("SELECT * FROM sop_documents WHERE category = ? AND is_active = 1 ORDER BY code").all(category);
  } else {
    rows = db.prepare("SELECT * FROM sop_documents WHERE is_active = 1 ORDER BY code").all();
  }

  return rows.map((r: any) => {
    const content = JSON.parse(r.content || "{}");
    return {
      id: r.id,
      code: r.code,
      title: r.title,
      category: r.category,
      version: r.version,
      steps: content.steps || [],
      estimated_minutes: content.estimated_minutes || 0,
      difficulty: content.difficulty || "pemula",
      safety_warnings: content.safety_warnings || [],
      required_tools: content.required_tools || [],
      is_active: Boolean(r.is_active),
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  });
}

export function getSOP(code: string): SOPDocument | null {
  const db = getDb();
  createSOPTables();

  const row = db.prepare("SELECT * FROM sop_documents WHERE code = ?").get(code) as any;
  if (!row) return null;

  const content = JSON.parse(row.content || "{}");
  return {
    id: row.id, code: row.code, title: row.title, category: row.category,
    version: row.version, steps: content.steps || [], estimated_minutes: content.estimated_minutes || 0,
    difficulty: content.difficulty || "pemula", safety_warnings: content.safety_warnings || [],
    required_tools: content.required_tools || [], is_active: Boolean(row.is_active),
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

// ── Assignments ─────────────────────────────────────────────────

export function createAssignment(sopId: number, staffName: string): number {
  const db = getDb();
  createSOPTables();

  const sop = db.prepare("SELECT * FROM sop_documents WHERE id = ?").get(sopId) as any;
  if (!sop) throw new Error("SOP tidak ditemukan");

  const content = JSON.parse(sop.content || "{}");
  const checklist: SOPChecklistItem[] = (content.steps || []).map((s: any) => ({
    step_number: s.step_number,
    title: s.title,
    checked: false,
    checked_at: null,
    notes: null,
  }));

  const info = db.prepare(`
    INSERT INTO sop_assignments (sop_id, staff_name, status, checklist, started_at)
    VALUES (?, ?, 'in_progress', ?, datetime('now'))
  `).run(sopId, staffName, JSON.stringify(checklist));

  return info.lastInsertRowid as number;
}

export function updateChecklistItem(
  assignmentId: number,
  stepNumber: number,
  checked: boolean,
  notes?: string
): boolean {
  const db = getDb();
  createSOPTables();

  const assignment = db.prepare("SELECT * FROM sop_assignments WHERE id = ?").get(assignmentId) as any;
  if (!assignment) return false;

  const checklist: SOPChecklistItem[] = JSON.parse(assignment.checklist || "[]");
  const item = checklist.find(c => c.step_number === stepNumber);
  if (!item) return false;

  item.checked = checked;
  item.checked_at = checked ? new Date().toISOString() : null;
  if (notes) item.notes = notes;

  // Check if all items checked
  const allChecked = checklist.every(c => c.checked);
  const status = allChecked ? "completed" : "in_progress";

  db.prepare(`
    UPDATE sop_assignments SET checklist = ?, status = ?, updated_at = datetime('now')
    ${allChecked ? ", completed_at = datetime('now')" : ""}
    WHERE id = ?
  `).run(JSON.stringify(checklist), status, assignmentId);

  return true;
}

export function getAssignments(staffName?: string, status?: string): SOPAssignment[] {
  const db = getDb();
  createSOPTables();

  let rows: any[];
  if (staffName && status) {
    rows = db.prepare("SELECT * FROM sop_assignments WHERE staff_name = ? AND status = ? ORDER BY created_at DESC").all(staffName, status);
  } else if (staffName) {
    rows = db.prepare("SELECT * FROM sop_assignments WHERE staff_name = ? ORDER BY created_at DESC").all(staffName);
  } else if (status) {
    rows = db.prepare("SELECT * FROM sop_assignments WHERE status = ? ORDER BY created_at DESC").all(status);
  } else {
    rows = db.prepare("SELECT * FROM sop_assignments ORDER BY created_at DESC").all();
  }

  return rows.map((r: any) => ({
    id: r.id, sop_id: r.sop_id, staff_name: r.staff_name, status: r.status,
    checklist: JSON.parse(r.checklist || "[]"),
    started_at: r.started_at, completed_at: r.completed_at,
    notes: r.notes, score: r.score,
  }));
}

// ── Training Tracker ────────────────────────────────────────────

export function getStaffTraining(staffName?: string): StaffTraining[] {
  const db = getDb();
  createSOPTables();

  if (staffName) {
    return db.prepare("SELECT * FROM staff_training WHERE staff_name = ? ORDER BY created_at DESC").all(staffName) as StaffTraining[];
  }
  return db.prepare("SELECT * FROM staff_training ORDER BY created_at DESC").all() as StaffTraining[];
}

export function updateTrainingStatus(staffName: string, sopCode: string, status: StaffTraining["status"], score?: number): boolean {
  const db = getDb();
  createSOPTables();

  const existing = db.prepare("SELECT * FROM staff_training WHERE staff_name = ? AND sop_code = ?").get(staffName, sopCode) as any;

  if (existing) {
    db.prepare(`
      UPDATE staff_training SET status = ?, score = ?, completed_at = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, score || null, (status === "completed" || status === "certified") ? new Date().toISOString() : null, existing.id);
  } else {
    const sop = getSOP(sopCode);
    db.prepare(`
      INSERT INTO staff_training (staff_name, sop_code, sop_title, status, score, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(staffName, sopCode, sop?.title || sopCode, status, score || null,
      (status === "completed" || status === "certified") ? new Date().toISOString() : null);
  }

  return true;
}

// ── Dashboard Stats ─────────────────────────────────────────────

export function getSOPStats(): {
  total_sops: number;
  total_assignments: number;
  completed_today: number;
  pending_review: number;
  staff_count: number;
  avg_score: number;
} {
  const db = getDb();
  createSOPTables();

  const totalSops = (db.prepare("SELECT COUNT(*) as c FROM sop_documents WHERE is_active = 1").get() as any).c;
  const totalAssignments = (db.prepare("SELECT COUNT(*) as c FROM sop_assignments").get() as any).c;
  const completedToday = (db.prepare("SELECT COUNT(*) as c FROM sop_assignments WHERE status = 'completed' AND date(completed_at) = date('now')").get() as any).c;
  const pendingReview = (db.prepare("SELECT COUNT(*) as c FROM sop_assignments WHERE status = 'needs_review'").get() as any).c;
  const staffCount = (db.prepare("SELECT COUNT(DISTINCT staff_name) as c FROM sop_assignments").get() as any).c;
  const avgScore = (db.prepare("SELECT COALESCE(AVG(score), 0) as avg FROM sop_assignments WHERE score IS NOT NULL").get() as any).avg;

  return {
    total_sops: totalSops,
    total_assignments: totalAssignments,
    completed_today: completedToday,
    pending_review: pendingReview,
    staff_count: staffCount,
    avg_score: Math.round(avgScore),
  };
}
