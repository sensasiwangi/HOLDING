-- =============================================
-- P0: COMPLIANCE & TRACEABILITY MODULES
-- IFRA Compliance, Batch Tracking, Allergen Labels
-- =============================================

-- ── 1. IFRA Categories ────────────────────────
-- Batas maksimum penggunaan per kategori produk
-- Berdasarkan IFRA Standards 51st Amendment
CREATE TABLE IF NOT EXISTS ifra_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_code TEXT UNIQUE NOT NULL,   -- e.g. "CAT1", "CAT2"
  category_name TEXT NOT NULL,          -- e.g. "Lip Products"
  description TEXT,
  max_concentration_percent REAL NOT NULL,  -- batas maksimum dalam %
  notes TEXT
);

-- Default IFRA categories (berikut batas umum)
INSERT OR IGNORE INTO ifra_categories (category_code, category_name, description, max_concentration_percent) VALUES
  ('CAT1', 'Lip Products', 'Products applied to the lips (lipstick, lip balm, etc.)', 0.0),
  ('CAT1A', 'Lip Products — Oral', 'Products applied to the lips with oral contact', 0.0),
  ('CAT2', 'Deodorant & Antiperspirant', 'Products applied to underarms', 15.0),
  ('CAT3', 'Hydroalcoholic Products — Hands', 'Products applied to hands with rinse-off', 10.0),
  ('CAT4', 'Hydroalcoholic Products — Body', 'Products applied to body (EDT, EDP)', 15.0),
  ('CAT5', 'Rinse-off Products', 'Products rinsed off after use', 25.0),
  ('CAT6', 'Non-skin Contact Products', 'Products not in contact with skin (candles, air freshener)', 100.0),
  ('CAT7A', 'Rinse-off Hair Care', 'Rinse-off hair care products', 25.0),
  ('CAT7B', 'Leave-on Hair Care', 'Leave-on hair care products', 10.0),
  ('CAT8', 'Products with Oral Contact', 'Products with oral contact (mouthwash)', 0.0),
  ('CAT9', 'Hydroalcoholic — On Premises', 'Products on-premises use', 25.0),
  ('CAT10', 'Household Cleaners', 'Household cleaning products', 50.0),
  ('CAT11', 'Products with Mucosal Contact', 'Products with mucosal contact', 0.1),
  ('CAT12', 'Air Care Products', 'Air care / room fragrance', 100.0);

-- ── 2. Raw Material IFRA Limits ──────────────
-- Batas spesifik per raw material (jika lebih ketat dari kategori)
CREATE TABLE IF NOT EXISTS ifra_material_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_material_id INTEGER NOT NULL,
  ifra_category_code TEXT NOT NULL,
  max_concentration_percent REAL NOT NULL,
  restriction_type TEXT CHECK(restriction_type IN ('prohibited', 'restricted', 'specification')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id),
  FOREIGN KEY (ifra_category_code) REFERENCES ifra_categories(category_code),
  UNIQUE(raw_material_id, ifra_category_code)
);

-- ── 3. Compliance Check Log ──────────────────
-- Riwayat compliance check per formula
CREATE TABLE IF NOT EXISTS compliance_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formula_id INTEGER NOT NULL,
  checked_at TEXT DEFAULT (datetime('now')),
  overall_status TEXT CHECK(overall_status IN ('pass', 'warn', 'fail')) NOT NULL,
  product_category TEXT NOT NULL DEFAULT 'CAT4',  -- default: hydroalcoholic body
  total_concentration_percent REAL,
  failing_ingredients TEXT,   -- JSON array of {name, limit, actual}
  warnings TEXT,             -- JSON array of warning messages
  passed_checks TEXT,        -- JSON array of passed check items
  checked_by TEXT DEFAULT 'system',
  notes TEXT,
  FOREIGN KEY (formula_id) REFERENCES formulas(id)
);

-- ── 4. Batch Traceability ────────────────────
CREATE TABLE IF NOT EXISTS raw_material_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lot_number TEXT UNIQUE NOT NULL,       -- e.g. "LOT-20260601-BERG-001"
  raw_material_id INTEGER NOT NULL,
  supplier_name TEXT,
  supplier_batch TEXT,                    -- lot number dari supplier
  received_date TEXT,
  expiry_date TEXT,
  quantity_ml REAL NOT NULL,
  remaining_ml REAL NOT NULL,
  cost_per_ml REAL DEFAULT 0,
  quality_status TEXT DEFAULT 'pending' CHECK(quality_status IN ('pending', 'approved', 'rejected', 'quarantine')),
  test_results TEXT,                      -- JSON: {pH, density, color, notes}
  storage_location TEXT,
  received_by TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

CREATE TABLE IF NOT EXISTS product_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_number TEXT UNIQUE NOT NULL,      -- e.g. "SW-20260601-001"
  formula_id INTEGER NOT NULL,
  produced_date TEXT DEFAULT (datetime('now')),
  produced_by TEXT,
  bottle_size_ml INTEGER DEFAULT 30,
  total_units_produced INTEGER DEFAULT 1,
  status TEXT DEFAULT 'produced' CHECK(status IN ('produced', 'qc_passed', 'qc_failed', 'packaged', 'shipped', 'recalled')),
  qc_results TEXT,                        -- JSON: checklist results
  compliance_check_id INTEGER,
  maturation_start_date TEXT,
  maturation_end_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (formula_id) REFERENCES formulas(id),
  FOREIGN KEY (compliance_check_id) REFERENCES compliance_checks(id)
);

-- Link product batch ke raw material batches (traceability)
CREATE TABLE IF NOT EXISTS product_batch_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_batch_id INTEGER NOT NULL,
  raw_material_batch_id INTEGER NOT NULL,
  quantity_used_ml REAL NOT NULL,
  used_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (product_batch_id) REFERENCES product_batches(id),
  FOREIGN KEY (raw_material_batch_id) REFERENCES raw_material_batches(id)
);

-- ── 5. Allergen Labels ───────────────────────
CREATE TABLE IF NOT EXISTS allergen_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formula_id INTEGER NOT NULL,
  generated_at TEXT DEFAULT (datetime('now')),
  label_text TEXT NOT NULL,              -- teks label lengkap
  allergen_list TEXT NOT NULL,           -- JSON array of allergens
  warning_list TEXT,                     -- JSON array of warnings
  precaution_list TEXT,                  -- JSON array of precautions
  label_image_path TEXT,                 -- path ke gambar label (jika digenerate)
  is_printed BOOLEAN DEFAULT 0,
  printed_at TEXT,
  FOREIGN KEY (formula_id) REFERENCES formulas(id)
);

-- ── 6. BPOM Registration Tracking ────────────
CREATE TABLE IF NOT EXISTS bpom_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  product_type TEXT CHECK(product_type IN ('kosmetik', 'aroma_terapi', 'kesehatan')),
  nomor_registrasi TEXT UNIQUE,          -- NIE number
  formula_id INTEGER,
  product_batch_id INTEGER,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'rejected', 'expired', 'renewal')),
  submitted_date TEXT,
  approved_date TEXT,
  expiry_date TEXT,
  bpom_notes TEXT,
  documents TEXT,                        -- JSON: {certificate, stability_test, safety_data}
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (formula_id) REFERENCES formulas(id),
  FOREIGN KEY (product_batch_id) REFERENCES product_batches(id)
);

-- ── 7. QC Checklist Template ────────────────
CREATE TABLE IF NOT EXISTS qc_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  item_category TEXT CHECK(item_category IN ('visual', 'olfactory', 'physical', 'safety', 'labeling')),
  description TEXT,
  is_required BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

INSERT OR IGNORE INTO qc_checklist_items (item_name, item_category, description, sort_order) VALUES
  ('Warna sesuai formula', 'visual', 'Cek warna parfum sesuai standard formula', 1),
  ('Jernih / tidak keruh', 'visual', 'Partikel suspensi atau kekeruhan', 2),
  ('Tidak ada endapan', 'visual', 'Cek endapan di dasar botol', 3),
  ('Aroma top note benar', 'olfactory', 'Verifikasi top note sesuai formula', 4),
  ('Aroma middle note benar', 'olfactory', 'Verifikasi middle note sesuai formula', 5),
  ('Aroma base note benar', 'olfactory', 'Verifikasi base note sesuai formula', 6),
  ('Longevity sesuai target', 'olfactory', 'Durasi aroma sesuai target', 7),
  ('pH 5.0-7.0', 'physical', 'Cek pH menggunakan pH meter atau kertas pH', 8),
  ('Tidak ada bau abnormal', 'safety', 'Tidak ada bau tengik, asam, atau tidak normal', 9),
  ('Botol tidak bocor', 'labeling', 'Cek seal botol rapat', 10),
  ('Label benar & lengkap', 'labeling', 'Cek nama, batch, expiry, allergen', 11);

-- ── Indexes ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ifra_material_rm ON ifra_material_limits(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_compliance_formula ON compliance_checks(formula_id);
CREATE INDEX IF NOT EXISTS idx_rm_batch_raw ON raw_material_batches(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_prod_batch_formula ON product_batches(formula_id);
CREATE INDEX IF NOT EXISTS idx_prod_batch_status ON product_batches(status);
CREATE INDEX IF NOT EXISTS idx_allergen_formula ON allergen_labels(formula_id);
CREATE INDEX IF NOT EXISTS idx_bpom_formula ON bpom_registrations(formula_id);
