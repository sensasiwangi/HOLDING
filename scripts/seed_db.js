const { google } = require('googleapis');
const Database = require('better-sqlite3');
const fs = require('fs');

const TOKEN_PATH = '/home/ubuntu/.hermes/google_token.json';
const SPREADSHEET_ID = '1rOEzDUV2mNLG1y0ba4MZsxRurZuOEmynbKXESmHqad4';
const DB_PATH = './data/swi.db';

async function main() {
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  const auth = new google.auth.OAuth2(tokens.client_id, tokens.client_secret, 'urn:ietf:wg:oauth:2.0:oob');
  auth.setCredentials(tokens);
  const sheets = google.sheets({ version: 'v4', auth });

  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Price List EcoFragrantica Update!A1:H500',
  });

  const rows = data.data.values || [];
  console.log('Total rows from sheets:', rows.length);

  // Remove old DB
  try { fs.unlinkSync(DB_PATH); } catch(e) {}

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = OFF');

  // Create schema
  const schema = fs.readFileSync('sensasi-wangi/schema.sql', 'utf-8');
  db.exec(schema);

  const compliance = fs.readFileSync('sensasi-wangi/schema_p0_compliance.sql', 'utf-8');
  db.exec(compliance);

  // Helper tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS dilution_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_material_id INTEGER NOT NULL,
      variant_name TEXT NOT NULL,
      dilution_percent REAL NOT NULL,
      solvent TEXT NOT NULL,
      shelf_label TEXT,
      is_active BOOLEAN DEFAULT 1
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
      template_data TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1
    );
  `);

  // Insert materials from sheets
  const stmt = db.prepare(`INSERT OR IGNORE INTO raw_materials
    (name, synonym, family, odor_profile, cas_number, note_position, price_per_5ml, price_per_10ml, price_per_50ml, kategori_rm, chemical_group)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  let inserted = 0;
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row[1] || row[1].trim() === '') continue;

    const no = parseInt(row[0]) || i - 2;
    const name = row[1].trim();
    const synonym = row[2] && row[2].trim() ? row[2].trim() : null;
    const family = row[3] && row[3].trim() ? row[3].trim() : 'Other';
    const odorProfile = row[4] && row[4].trim() ? row[4].trim() : '';
    const casNumber = row[5] && row[5].trim() && row[5].trim() !== '#N/A' ? row[5].trim() : null;
    const price5 = parseInt((row[6] || '0').replace(/[^\d]/g, '')) || 0;
    const price10 = parseInt((row[7] || '0').replace(/[^\d]/g, '')) || 0;
    const price50 = parseInt((row[8] || '0').replace(/[^\d]/g, '')) || 0;

    let notePosition = 'all';
    const fL = family.toLowerCase();
    const oL = odorProfile.toLowerCase();
    if (fL.includes('citrus') || oL.includes('fresh')) notePosition = 'top';
    else if (fL.includes('floral') || fL.includes('green')) notePosition = 'middle';
    else if (fL.includes('woody') || fL.includes('balsamic') || fL.includes('animalic')) notePosition = 'base';

    let chemGroup = 'synthetic';
    if (name.includes('Oil') || name.includes('oil')) chemGroup = 'essential_oil';
    else if (fL.includes('accord')) chemGroup = 'accord';
    else if (fL.includes('industrial')) chemGroup = 'solvent';

    try {
      stmt.run(name, synonym, family, odorProfile, casNumber, notePosition, price5, price10, price50, 'pure', chemGroup);
      inserted++;
    } catch(e) {}
  }
  console.log('Inserted:', inserted, 'materials');

  // Insert IFRA limits
  const ifraStmt = db.prepare('INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes) VALUES (?, ?, ?, ?, ?)');
  const ifraData = [
    ['Eugenol', 0.5, 'restricted', 'IFRA: Max 0.5% in leave-on'],
    ['Citral', 0.6, 'restricted', 'IFRA: Max 0.6% hydroalcoholic'],
    ['Linalool', 15.0, 'specification', 'Needs antioxidant'],
    ['d-Limonene', 15.0, 'specification', 'Needs antioxidant'],
    ['Cinnamaldehyde', 0.05, 'restricted', 'Max 0.05% sensitization'],
    ['Coumarin', 1.6, 'restricted', 'Max 1.6%'],
    ['Indole', 0.1, 'restricted', 'Strong odor max 0.1%'],
    ['Benzyl Alcohol', 1.0, 'restricted', 'Max 1.0%'],
    ['Benzyl Benzoate', 26.7, 'specification', 'Specification only'],
    ['Benzyl Salicylate', 26.7, 'specification', 'Specification only'],
    ['Linalool Oxide', 15.0, 'specification', 'Needs antioxidant'],
    ['Diphenyl Oxide', 5.0, 'restricted', 'Max 5.0% in EDP'],
  ];
  let ifraOk = 0;
  for (const [name, max, type, note] of ifraData) {
    const rm = db.prepare('SELECT id FROM raw_materials WHERE name LIKE ?').get('%' + name + '%');
    if (rm) {
      ifraStmt.run(rm.id, 'CAT4', max, type, note);
      ifraOk++;
    }
  }
  console.log('IFRA limits:', ifraOk);

  // Update raw_materials with IFRA class and allergens
  db.exec("UPDATE raw_materials SET ifra_class = 'Class B', max_usage_percent = 0.5 WHERE name LIKE '%Eugenol%'");
  db.exec("UPDATE raw_materials SET ifra_class = 'Class B', max_usage_percent = 0.6 WHERE name LIKE '%Citral%'");
  db.exec("UPDATE raw_materials SET ifra_class = 'Class C', allergens = 'Contains linalool' WHERE name LIKE '%Linalool%'");
  db.exec("UPDATE raw_materials SET allergens = 'Contains linalool, limonene' WHERE name LIKE '%Bergamot%'");
  db.exec("UPDATE raw_materials SET allergens = 'Contains eugenol' WHERE name LIKE '%Clove%'");
  db.exec("UPDATE raw_materials SET allergens = 'Contains cinnamaldehyde, eugenol' WHERE name LIKE '%Cinnamon%'");
  db.exec("UPDATE raw_materials SET allergens = 'Contains benzyl benzoate' WHERE name LIKE '%Benzoin%'");
  db.exec("UPDATE raw_materials SET allergens = 'Contains methyl salicylate' WHERE name LIKE '%Methyl Salicylate%'");

  // Default conversion factors
  db.exec("INSERT INTO conversion_factors (raw_material_id, drops_per_ml, specific_gravity, notes) SELECT id, 20, 1.0, 'Default' FROM raw_materials");

  // Branding
  db.exec("INSERT OR IGNORE INTO branding (key, value) VALUES ('brand_name', 'Sensasi Wangi Indonesia')");
  db.exec("INSERT OR IGNORE INTO branding (key, value) VALUES ('brand_short', 'SWI')");
  db.exec("INSERT OR IGNORE INTO branding (key, value) VALUES ('bottle_size_ml', '30')");

  const total = db.prepare('SELECT COUNT(*) as c FROM raw_materials').get();
  const ifraTotal = db.prepare('SELECT COUNT(*) as c FROM ifra_material_limits').get();
  const cfTotal = db.prepare('SELECT COUNT(*) as c FROM conversion_factors').get();
  console.log('DB:', total.c, 'materials,', ifraTotal.c, 'IFRA limits,', cfTotal.c, 'conversion factors');

  db.close();
  console.log('Done');
}

main().catch(e => console.error(e.message));
