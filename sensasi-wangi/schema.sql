-- =============================================
-- SENSASI WANGI INDONESIA
-- AI Perfume Composer — Database Schema
-- =============================================
-- Rebranding dari EcoFragrantica
-- Botol: 30ml
-- User: mix di beaker → masukkan botol → masterasi di tempat gelap
-- =============================================

-- ── Core: Raw Materials ──────────────────────
-- Data lengkap per material: history, sifat, CAS, odor profile, dll
CREATE TABLE IF NOT EXISTS raw_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  no INTEGER UNIQUE,                          -- nomor urut dari sheets
  name TEXT NOT NULL,                         -- nama raw material (e.g. "Bergamot EO")
  synonym TEXT,                               -- nama sinonim / IUPAC
  family TEXT NOT NULL,                       -- scent family: Citrus, Floral, Woody, Herbal, 
                                              --   Sweet/Balsamic, Fruity, Green, Animalic, 
                                              --   Mineral, Industrial, Soulful
  subfamily TEXT,                             -- sub-kategori (e.g. "floral-rose", "woody-sandal")
  
  -- Odor Profile
  odor_profile TEXT NOT NULL,                 -- deskripsi aroma (e.g. "fresh citrus lemon sweet")
  odor_intensity INTEGER CHECK(odor_intensity BETWEEN 1 AND 10),  -- daya penguapan 1-10
  odor_longevity_hours REAL,                  -- lama ketahanan aroma (jam)
  
  -- Chemical Properties
  cas_number TEXT,                            -- CAS registry number (e.g. "5392-40-5")
  molecular_formula TEXT,                     -- rumus molekul
  molecular_weight REAL,                      -- berat molekul (g/mol)
  boiling_point REAL,                         -- titik didih (°C)
  flash_point REAL,                           -- titik nyala (°C)
  specific_gravity REAL,                      -- berat jenis
  solubility TEXT,                            -- kelarutan (e.g. "soluble in alcohol, insoluble in water")
  chemical_group TEXT,                        -- gugus kimia (e.g. "aldehyde", "ester", "ketone", "alcohol")
  
  -- Origin & History
  origin TEXT,                                -- asal (natural/synthetic + negara)
  history TEXT,                               -- sejarah & latar belakang
  extraction_method TEXT,                     -- metode ekstraksi (if natural)
  raw_material_source TEXT,                                   -- sumber bahan baku
  
  -- Safety
  ifra_class TEXT,                            -- IFRA classification
  max_usage_percent REAL,                                     -- maksimum penggunaan (%)
  allergens TEXT,                             -- allergen info
  safety_notes TEXT,                          -- catatan keamanan
  
  -- Classification
  note_position TEXT CHECK(note_position IN ('top', 'middle', 'base', 'all')),
  scent_wheel TEXT,                           -- posisi di scent wheel
  
  -- Pricing (per ml, dalam IDR)
  price_per_5ml INTEGER DEFAULT 0,
  price_per_10ml INTEGER DEFAULT 0,
  price_per_50ml INTEGER DEFAULT 0,
  price_per_100ml INTEGER DEFAULT 0,
  price_per_500ml INTEGER DEFAULT 0,
  
  -- Stock
  stock_ml REAL DEFAULT 0,                    -- stok tersedia (ml)
  min_stock_ml REAL DEFAULT 50,               -- minimum stok alert (ml)
  
  -- Dilution info (etalase)
  is_diluted BOOLEAN DEFAULT 0,               -- apakah ini bahan yang sudah di-dilute
  dilution_percent REAL,                      -- persentase konsentrasi (e.g. 50 untuk 50%)
  dilution_solvent TEXT,                      -- pelarut (e.g. "DPG", "BB", "Ethanola", "castor")
  pure_material_id INTEGER,                   -- referensi ke bahan 100% asli
  display_name_on_shelf TEXT,                 -- nama yang ditampilkan di etalase
  
  -- Metadata
  kategori_rm TEXT,                           -- kategori saat ini: 'eco_base', 'pure', 'accord', 'solvent'
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (pure_material_id) REFERENCES raw_materials(id)
);

-- Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_rm_family ON raw_materials(family);
CREATE INDEX IF NOT EXISTS idx_rm_note ON raw_materials(note_position);
CREATE INDEX IF NOT EXISTS idx_rm_name ON raw_materials(name);
CREATE INDEX IF NOT EXISTS idx_rm_cas ON raw_materials(cas_number);
CREATE INDEX IF NOT EXISTS idx_rm_diluted ON raw_materials(is_diluted);

-- ── Dilution Master List ────────────────────
-- Daftar semua bahan etalasi yang sudah di-dilute
-- Setiap raw material bisa punya multiple dilute variants
CREATE TABLE IF NOT EXISTS dilution_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_material_id INTEGER NOT NULL,
  variant_name TEXT NOT NULL,                 -- e.g. "Galaxolide 50% DPG"
  dilution_percent REAL NOT NULL,             -- 50 untuk 50%
  solvent TEXT NOT NULL,                      -- "DPG", "BB", "Ethanola", "castor"
  cas_number TEXT,
  price_modifier REAL DEFAULT 1.0,            -- modifier harga vs pure
  shelf_label TEXT,                           -- label untuk display etalase
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

CREATE INDEX IF NOT EXISTS idx_dil_raw ON dilution_variants(raw_material_id);

-- ── Compatibility Matrix ────────────────────
-- Mana yang cocok / tidak cocok dipasangkan
CREATE TABLE IF NOT EXISTS compatibility (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_a_id INTEGER NOT NULL,
  material_b_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating BETWEEN -2 AND 2),
  -- -2: kontraindikasi (jangan dipasangkan)
  -- -1: tidak cocok
  --  0: netral
  --  1: cocok
  --  2: sangat cocok (synergistic)
  notes TEXT,
  
  FOREIGN KEY (material_a_id) REFERENCES raw_materials(id),
  FOREIGN KEY (material_b_id) REFERENCES raw_materials(id),
  UNIQUE(material_a_id, material_b_id)
);

-- ── Visitors / Customers ────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT,
  email TEXT,
  visit_date TEXT DEFAULT (datetime('now')),
  source TEXT                                 -- 'walk-in', 'event', 'online', 'referral'
);

-- ── Formulas ───────────────────────────────
-- Formula yang dibuat AI untuk pengunjung
CREATE TABLE IF NOT EXISTS formulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formula_code TEXT UNIQUE NOT NULL,          -- e.g. "SW-20250601-001"
  
  -- Input dari pengunjung
  input_type TEXT CHECK(input_type IN ('text_prompt', 'image', 'story', 'mood')),
  input_text TEXT,                            -- prompt / cerita dari pengunjung
  input_image_path TEXT,                      -- path ke gambar yang diupload
  
  -- AI Analysis
  ai_mood TEXT,                               -- mood yang terdeteksi
  ai_scent_profile TEXT,                      -- JSON array of scent families
  ai_top_notes TEXT,                          -- JSON array
  ai_middle_notes TEXT,                       -- JSON array
  ai_base_notes TEXT,                         -- JSON array
  ai_intensity INTEGER,                       -- 1-10
  ai_longevity_target TEXT,                   -- e.g. "4-6 jam"
  
  -- Formula Settings
  bottle_size_ml INTEGER DEFAULT 30,          -- selalu 30ml
  concentration_type TEXT CHECK(concentration_type IN ('EDT', 'EDP', 'extrait')),
                                      -- EDT: 5-15%, EDP: 15-20%, extrait: 20-30%
  concentration_percent REAL DEFAULT 15,      -- % total concentrate
  
  -- Formula Output (summary)
  total_concentrate_ml REAL,                 -- total ml bahan pekat
  total_alcohol_ml REAL,                     -- total ml alkohol
  total_water_ml REAL,                       -- total ml air (jika ada)
  
  -- Masterasi
  maturation_days INTEGER DEFAULT 14,         -- lama masterasi
  maturation_notes TEXT,                       -- instruksi masterasi
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'confirmed', 'mixed', 'matured', 'completed', 'cancelled')),
  
  -- Pricing
  total_cost INTEGER DEFAULT 0,              -- total harga bahan (IDR)
  selling_price INTEGER DEFAULT 0,           -- harga jual ke pengunjung
  
  -- Visitor
  visitor_id INTEGER,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);

CREATE INDEX IF NOT EXISTS idx_formula_code ON formulas(formula_code);
CREATE INDEX IF NOT EXISTS idx_formula_status ON formulas(status);

-- ── Formula Ingredients ────────────────────
-- Detail komposisi per formula
CREATE TABLE IF NOT EXISTS formula_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formula_id INTEGER NOT NULL,
  raw_material_id INTEGER NOT NULL,
  
  -- Quantity (dual unit: bisa tetes ATAU gram)
  quantity_drops REAL,                        -- jumlah tetes (20 tetes ≈ 1ml)
  quantity_grams REAL,                        -- jumlah gram
  quantity_ml REAL,                           -- jumlah ml (computed dari drops/gram)
  
  -- Display
  display_order INTEGER NOT NULL,              -- urutan penambahan
  addition_step INTEGER,                      -- step ke-berapa ditambahkan
  step_label TEXT,                            -- "Top Notes", "Middle Notes", "Base Notes", "Carrier"
  
  -- Actual (setelah mixing)
  actual_ml REAL,                             -- ml yang benar-benar digunakan
  
  -- Cost
  cost_at_time INTEGER DEFAULT 0,            -- harga saat formula dibuat
  
  notes TEXT,
  
  FOREIGN KEY (formula_id) REFERENCES formulas(id),
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);

CREATE INDEX IF NOT EXISTS idx_ing_formula ON formula_ingredients(formula_id);

-- ── Mixing Steps (generated guide) ─────────
CREATE TABLE IF NOT EXISTS mixing_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formula_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT,
  duration_seconds INTEGER DEFAULT 0,
  ingredient_ids TEXT,                       -- JSON array of formula_ingredient ids
  animation_type TEXT,                       -- 'pour', 'shake', 'wait', 'filter', 'bottle'
  visual_color TEXT,                          -- warna untuk UI (hex)
  
  FOREIGN KEY (formula_id) REFERENCES formulas(id)
);

-- ── Sessions ───────────────────────────────
-- Untuk login admin/staff di kiosk
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- ── Users ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK(role IN ('admin', 'staff', 'viewer')),
  name TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Audit Log ──────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  user_id INTEGER,
  data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Branding ───────────────────────────────
-- Konfigurasi branding (rebrand dari ecofragrantica)
CREATE TABLE IF NOT EXISTS branding (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO branding (key, value) VALUES
  ('brand_name', 'Sensasi Wangi Indonesia'),
  ('brand_short', 'SWI'),
  ('brand_tagline', 'Your Story, Your Scent'),
  ('brand_previous_name', 'EcoFragrantica'),
  ('bottle_size_ml', '30'),
  ('concentration_default', 'EDP'),
  ('maturation_default_days', '14'),
  ('unit_type', 'drops_gram'),   -- dual unit: tetes dan gram
  ('currency', 'IDR'),
  ('language', 'id');
