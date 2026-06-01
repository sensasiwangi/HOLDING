// src/lib/swi-db.ts
// Sensasi Wangi Indonesia — Database Singleton
// @ts-ignore - better-sqlite3 types
import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "swi.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create tables if not exist
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS raw_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no INTEGER UNIQUE,
      name TEXT NOT NULL,
      synonym TEXT,
      family TEXT NOT NULL,
      subfamily TEXT,
      odor_profile TEXT NOT NULL,
      odor_intensity INTEGER,
      odor_longevity_hours REAL,
      cas_number TEXT,
      molecular_formula TEXT,
      molecular_weight REAL,
      boiling_point REAL,
      flash_point REAL,
      specific_gravity REAL,
      solubility TEXT,
      chemical_group TEXT,
      origin TEXT,
      history TEXT,
      extraction_method TEXT,
      ifra_class TEXT,
      max_usage_percent REAL,
      allergens TEXT,
      safety_notes TEXT,
      note_position TEXT CHECK(note_position IN ('top', 'middle', 'base', 'all')),
      scent_wheel TEXT,
      price_per_5ml INTEGER DEFAULT 0,
      price_per_10ml INTEGER DEFAULT 0,
      price_per_50ml INTEGER DEFAULT 0,
      price_per_100ml INTEGER DEFAULT 0,
      price_per_500ml INTEGER DEFAULT 0,
      stock_ml REAL DEFAULT 0,
      min_stock_ml REAL DEFAULT 50,
      is_diluted BOOLEAN DEFAULT 0,
      dilution_percent REAL,
      dilution_solvent TEXT,
      pure_material_id INTEGER,
      display_name_on_shelf TEXT,
      kategori_rm TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dilution_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_material_id INTEGER NOT NULL,
      variant_name TEXT NOT NULL,
      dilution_percent REAL NOT NULL,
      solvent TEXT NOT NULL,
      cas_number TEXT,
      price_modifier REAL DEFAULT 1.0,
      shelf_label TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS compatibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_a_id INTEGER NOT NULL,
      material_b_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating BETWEEN -2 AND 2),
      notes TEXT,
      UNIQUE(material_a_id, material_b_id)
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      email TEXT,
      visit_date TEXT DEFAULT (datetime('now')),
      source TEXT
    );

    CREATE TABLE IF NOT EXISTS formulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formula_code TEXT UNIQUE NOT NULL,
      input_type TEXT CHECK(input_type IN ('text_prompt', 'image', 'story', 'mood')),
      input_text TEXT,
      input_image_path TEXT,
      ai_mood TEXT,
      ai_scent_profile TEXT,
      ai_top_notes TEXT,
      ai_middle_notes TEXT,
      ai_base_notes TEXT,
      ai_intensity INTEGER,
      ai_longevity_target TEXT,
      bottle_size_ml INTEGER DEFAULT 30,
      concentration_type TEXT CHECK(concentration_type IN ('EDT', 'EDP', 'extrait')),
      concentration_percent REAL DEFAULT 15,
      total_concentrate_ml REAL,
      total_alcohol_ml REAL,
      total_water_ml REAL,
      maturation_days INTEGER DEFAULT 14,
      maturation_notes TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'confirmed', 'mixed', 'matured', 'completed', 'cancelled')),
      total_cost INTEGER DEFAULT 0,
      selling_price INTEGER DEFAULT 0,
      visitor_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS formula_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formula_id INTEGER NOT NULL,
      raw_material_id INTEGER NOT NULL,
      quantity_drops REAL,
      quantity_grams REAL,
      quantity_ml REAL,
      display_order INTEGER NOT NULL,
      addition_step INTEGER,
      step_label TEXT,
      actual_ml REAL,
      cost_at_time INTEGER DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS mixing_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formula_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      step_title TEXT NOT NULL,
      step_description TEXT,
      duration_seconds INTEGER DEFAULT 0,
      ingredient_ids TEXT,
      animation_type TEXT,
      visual_color TEXT
    );

    CREATE TABLE IF NOT EXISTS conversion_factors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_material_id INTEGER NOT NULL UNIQUE,
      drops_per_ml REAL DEFAULT 20,
      specific_gravity REAL DEFAULT 1.0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS formula_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      mood TEXT,
      scent_family TEXT,
      concentration_type TEXT DEFAULT 'EDP',
      concentration_percent REAL DEFAULT 15,
      maturation_days INTEGER DEFAULT 14,
      template_data TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      avg_rating REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS branding (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_rm_family ON raw_materials(family);
    CREATE INDEX IF NOT EXISTS idx_rm_note ON raw_materials(note_position);
    CREATE INDEX IF NOT EXISTS idx_rm_name ON raw_materials(name);
    CREATE INDEX IF NOT EXISTS idx_formula_code ON formulas(formula_code);
    CREATE INDEX IF NOT EXISTS idx_formula_status ON formulas(status);

    INSERT OR IGNORE INTO branding (key, value) VALUES
      ('brand_name', 'Sensasi Wangi Indonesia'),
      ('brand_short', 'SWI'),
      ('brand_tagline', 'Your Story, Your Scent'),
      ('brand_previous_name', 'EcoFragrantica'),
      ('bottle_size_ml', '30'),
      ('concentration_default', 'EDP'),
      ('maturation_default_days', '14'),
      ('unit_type', 'drops_gram'),
      ('currency', 'IDR'),
      ('language', 'id');
  `);
}

export default getDb;
