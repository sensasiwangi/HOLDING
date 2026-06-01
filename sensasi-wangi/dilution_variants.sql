-- =============================================
-- SENSASI WANGI INDONESIA
-- Dilution Variants — Etalase Raw Material
-- =============================================
-- Di etalase, ada 2 tipe:
-- 1. 100% (pure) — bahan murni
-- 2. Diluted — bahan yang sudah di-dilute dengan solvent
--
-- Setiap raw material bisa punya multiple dilute variants
-- dengan konsentrasi berbeda.
--
-- Contoh:
--   - Galaxolide 50% DPG
--   - Benzoin 1%  
--   - Ambroxan 10% TEC
-- =============================================

-- ════════════════════════════════════════════
-- DILUTION VARIANTS (Etalase Display)
-- ════════════════════════════════════════════

-- Galaxolide variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Galaxolide 100% Pure', 100, 'none', 'Galaxolide 100%'
FROM raw_materials WHERE name LIKE '%Galaxolide%';

-- Galaxolide 50% DPG
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Galaxolide 50% DPG', 50, 'DPG', 'Galaxolide 50% DPG'
FROM raw_materials WHERE name LIKE '%Galaxolide%';

-- Ambroxan variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Ambroxan 10% TEC', 10, 'TEC', 'Ambroxan 10%'
FROM raw_materials WHERE no = 40;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Ambroxan 100% Pure', 100, 'none', 'Ambroxan 100%'
FROM raw_materials WHERE no = 40;

-- Hedione variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Hedione / MDJ 100%', 100, 'none', 'Hedione 100%'
FROM raw_materials WHERE no = 183;

-- Indole variants (very strong — always diluted)
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Indole 50% BB', 50, 'Benzyl Benzoate', 'Indole 50% in BB'
FROM raw_materials WHERE no = 192;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Indole 1% DPG', 1, 'DPG', 'Indole 1% in DPG'
FROM raw_materials WHERE no = 192;

-- Indolene variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Indolene 50% BB', 50, 'Benzyl Benzoate', 'Indolene 50% in BB'
FROM raw_materials WHERE no = 193;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Indolene 50% Castor', 50, 'Castor Oil', 'Indolene 50% in Castor'
FROM raw_materials WHERE no = 194;

-- Helvetolide variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Helvetolide 100%', 100, 'none', 'Helvetolide 100%'
FROM raw_materials WHERE no = 185;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Helvetolide 10% TEC', 10, 'TEC', 'Helvetolide 10%'
FROM raw_materials WHERE no = 186;

-- Aldehyde C-12 MNA variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Aldehyde C-12 MNA 100%', 100, 'none', 'C-12 MNA 100%'
FROM raw_materials WHERE no = 25;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Aldehyde C-12 MNA 10% TEC', 10, 'TEC', 'C-12 MNA 10%'
FROM raw_materials WHERE no = 26;

-- Aldehyde C-6 Hexanal variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Aldehyde C-6 100%', 100, 'none', 'C-6 Hexanal 100%'
FROM raw_materials WHERE no = 25;  -- hexanal row

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Aldehyde C-6 10% TEC', 10, 'TEC', 'C-6 Hexanal 10%'
FROM raw_materials WHERE no = 31;  -- hexanal 10% tec

-- Ambrocenide variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Ambrocenide Crystal 100%', 100, 'none', 'Ambrocenide Crystal'
FROM raw_materials WHERE no = 39;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Ambrocenide 10% TEC', 10, 'TEC', 'Ambrocenide 10%'
FROM raw_materials WHERE no = 38;

-- Beta Damascone variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Beta Damascone 100%', 100, 'none', 'Beta Damascone 100%'
FROM raw_materials WHERE no = 73;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Beta Damascone 10% TEC', 10, 'TEC', 'Beta Damascone 10%'
FROM raw_materials WHERE no = 74;

-- Beta Ionone variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Beta Ionone 100%', 100, 'none', 'Beta Ionone 100%'
FROM raw_materials WHERE no = 75;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Beta Ionone 10% TEC', 10, 'TEC', 'Beta Ionone 10%'
FROM raw_materials WHERE no = 76;

-- Beta Ionone Epoxide variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Beta Ionone Epoxide 100%', 100, 'none', 'Beta Ionone Epoxide 100%'
FROM raw_materials WHERE no = 77;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Beta Ionone Epoxide 10% TEC', 10, 'TEC', 'Beta Ionone Epoxide 10%'
FROM raw_materials WHERE no = 78;

-- Floralozone variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Floralozone 100%', 100, 'none', 'Floralozone 100%'
FROM raw_materials WHERE no = 158;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Floralozone 10% TEC', 10, 'TEC', 'Floralozone 10%'
FROM raw_materials WHERE no = 159;

-- Javanol variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Javanol 100%', 100, 'none', 'Javanol 100%'
FROM raw_materials WHERE name = 'Javanol';

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Javanol 10% TEC', 10, 'TEC', 'Javanol 10%'
FROM raw_materials WHERE name = 'Javanol 10-TEC';

-- Mate Absolute variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Mate Absolute 100%', 100, 'none', 'Mate Absolute 100%'
FROM raw_materials WHERE name = 'Mate Absolute';

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Mate Absolute 10% TEC', 10, 'TEC', 'Mate Absolute 10%'
FROM raw_materials WHERE name = 'Mate Absolute 10-TEC';

-- Milk Lactone variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Milk Lactone 100%', 100, 'none', 'Milk Lactone 100%'
FROM raw_materials WHERE name = 'Milk Lactone';

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Milk Lactone 10% TEC', 10, 'TEC', 'Milk Lactone 10%'
FROM raw_materials WHERE name = 'Milk Lactone 10-TEC';

-- Nonadienal (Cucumber Aldehyde) variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Nonadienal 100%', 100, 'none', 'Nonadienal 100%'
FROM raw_materials WHERE name LIKE 'Nonadienal%';

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Nonadienal 10% TEC', 10, 'TEC', 'Nonadienal 10%'
FROM raw_materials WHERE name LIKE 'Nonadienal%10-TEC';

-- Opoponax variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Opoponax Resinoid 50% BB', 50, 'Benzyl Benzoate', 'Opoponax 50% in BB'
FROM raw_materials WHERE name LIKE 'Opoponax%';

-- Benzoin variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Benzoin 50% BB', 50, 'Benzyl Benzoate', 'Benzoin 50% in BB'
FROM raw_materials WHERE name LIKE 'Benzoin 50 BB%';

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Benzoin 50% Ethanol', 50, 'Ethanol', 'Benzoin 50% in Etha'
FROM raw_materials WHERE name LIKE 'Benzoin 50 Etha%';

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Benzoin 55% Ethanol', 55, 'Ethanol', 'Benzoin 55% in Etha'
FROM raw_materials WHERE name LIKE 'Benzoin 55% Etha%';

-- Benzoin Siam
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Benzoin Siam Resinoid 50% DPG', 50, 'DPG', 'Benzoin Siam 50% DPG'
FROM raw_materials WHERE name LIKE 'Benzoin Siam%';

-- Galbanum variants
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Galbanum Oil 100%', 100, 'none', 'Galbanum Oil'
FROM raw_materials WHERE no = 168;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Galbanum Resin 50% Ethanol', 50, 'Ethanol', 'Galbanum Resin 50% Etha'
FROM raw_materials WHERE no = 169;

INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Galbanum Resin Synthetic 100%', 100, 'none', 'Galbanum Synthetic'
FROM raw_materials WHERE no = 170;

-- Patchouli Clove (special blend)
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilation_percent, solvent, shelf_label)
SELECT id, 'Patchouli Clove Accord', 100, 'none', 'Patchouli Clove'
FROM raw_materials WHERE name LIKE 'Patchouli Clove%';

-- Cooling Agent
INSERT OR IGNORE INTO dilution_variants (raw_material_id, variant_name, dilution_percent, solvent, shelf_label)
SELECT id, 'Cooling Agent 25% TEC', 25, 'TEC', 'Cooling Agent 25%'
FROM raw_materials WHERE name LIKE 'Cooling Agent%';

-- =============================================
-- FORMULA TEMPLATES (starting points for AI)
-- =============================================

CREATE TABLE IF NOT EXISTS formula_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  mood TEXT,
  scent_family TEXT,
  concentration_type TEXT DEFAULT 'EDP',
  concentration_percent REAL DEFAULT 15,
  maturation_days INTEGER DEFAULT 14,
  template_data TEXT NOT NULL,  -- JSON with ingredient ratios
  is_active BOOLEAN DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  avg_rating REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Template: Fresh Citrus
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('Fresh Citrus', 'Bright citrus opening with clean musk base', 'energetic fresh clean', 'citrus', '{"top":[{"family":"citrus","percent":40,"notes":["bergamot","lemon","grapefruit"]},{"family":"green","percent":10,"notes":["cis-3-hexenol"]}],"middle":[{"family":"floral","percent":15,"notes":["linalool","geraniol"]}],"base":[{"family":"musk","percent":20,"notes":["galaxolide","helvetolide"]},{"family":"woody","percent":15,"notes":["ambroxan","iso-e-super"]}]}');

-- Template: White Floral Dream
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('White Floral Dream', 'Elegant white floral with jasmine and tuberose',
 'romantic elegant feminine', 'floral',
 '{"top":[{"family":"citrus","percent":15,"notes":["bergamot"]},{"family":"green","percent":10,"notes":["cis-3-hexenol"]}],"middle":[{"family":"floral","percent":45,"notes":["jasmine","tuberose","ylang-ylang","hydroxycitronellal"]}],"base":[{"family":"musk","percent":15,"notes":["galaxolide","hedione"]},{"family":"balsamic","percent":15,"notes":["benzyl salicylate","vanilla"]}]}');

-- Template: Woody Oriental
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('Woody Oriental', 'Warm woody oriental with amber and spices',
 'mysterious warm sensual', 'woody',
 '{"top":[{"family":"spicy","percent":15,"notes":["cinnamon","cardamom"]},{"family":"citrus","percent":10,"notes":["bergamot"]}],"middle":[{"family":"woody","percent":30,"notes":["sandalwood","patchouli","cedarwood"]},{"family":"floral","percent":10,"notes":["rose","geranium"]}],"base":[{"family":"amber","percent":20,"notes":["ambroxan","vanilla","benzoin"]},{"family":"musk","percent":15,"notes":["galaxolide","ethylene-brassylate"]}]}');

-- Template: Tropical Paradise
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('Tropical Paradise', 'Juicy tropical fruits with coconut and vanilla',
 'fun vacation summer', 'fruity',
 '{"top":[{"family":"fruity","percent":30,"notes":["coconut-lactone","mango","passion-fruit"]},{"family":"citrus","percent":15,"notes":["grapefruit","lime"]}],"middle":[{"family":"floral","percent":20,"notes":["frangipani","jasmine","ylang-ylang"]}],"base":[{"family":"gourmand","percent":20,"notes":["vanilla","coumarin","benzoin"]},{"family":"musk","percent":15,"notes":["galaxolide"]}]}');

-- Template: Clean & Fresh (Unisex)
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('Clean & Fresh', 'Modern clean scent with aquatic and ozonic notes',
 'clean modern minimalist', 'fresh',
 '{"top":[{"family":"ozone","percent":25,"notes":["floralozone","cyclemone","melonal"]},{"family":"citrus","percent":15,"notes":["lemon","dihydromyrcenol"]}],"middle":[{"family":"herbal","percent":20,"notes":["lavender","eucalyptol","linalool"]}],"base":[{"family":"musk","percent":25,"notes":["galaxolide","helvetolide","hedione"]},{"family":"woody","percent":15,"notes":["iso-e-super","ambroxan"]}]}');

-- Template: Gourmand Delight
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('Gourmand Delight', 'Sweet edible gourmand with chocolate and vanilla',
 'cozy indulgent warm', 'gourmand',
 '{"top":[{"family":"gourmand","percent":20,"notes":["vanilla","coumarin","ethyl-maltol"]}],"middle":[{"family":"sweet","percent":30,"notes":["chocolate","caramel","furaneol","ethyl-vanillin"]}],"base":[{"family":"balsamic","percent":30,"notes":["benzoin","tonka","benzyl-benzoate"]},{"family":"musk","percent":20,"notes":["galaxolide","ethylene-brassylate"]}]}');

-- Template: Indonesian Heritage
INSERT OR IGNORE INTO formula_templates (name, description, mood, scent_family, template_data) VALUES
('Indonesian Heritage', 'Indonesian-inspired with spices, woods, and tropical florals',
 'cultural earthy exotic unique', 'oriental',
 '{"top":[{"family":"spicy","percent":20,"notes":["cardamom","cinnamon","clove"]},{"family":"citrus","percent":10,"notes":["bergamot","orange"]}],"middle":[{"family":"floral","percent":20,"notes":["ylang-ylang","frangipani","jasmine"]},{"family":"woody","percent":15,"notes":["patchouli","vetiver","sandalwood"]}],"base":[{"family":"resin","percent":20,"notes":["benzoin","opoponax","labdanum"]},{"family":"amber","percent":15,"notes":["ambroxan","vanilla","musk"]}]}');

-- =============================================
-- CONVERSION TABLE: Drops ↔ ml ↔ grams
-- Essential for dual-unit display
-- =============================================

CREATE TABLE IF NOT EXISTS conversion_factors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_material_id INTEGER NOT NULL,
  drops_per_ml REAL DEFAULT 20,      -- standar: 20 tetes = 1ml
  specific_gravity REAL DEFAULT 1.0,  -- berat jenis (air = 1.0)
  -- Untuk essential oil: ~0.85-0.95
  -- Untuk absolute: ~0.95-1.05
  -- Untuk synthetic: ~0.90-1.10
  -- Untuk musk: ~0.98-1.02
  notes TEXT,
  
  FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id),
  UNIQUE(raw_material_id)
);

-- Default conversion for all materials (20 drops/ml, gravity 1.0)
-- Will be updated per material based on actual properties
INSERT OR IGNORE INTO conversion_factors (raw_material_id, drops_per_ml, specific_gravity, notes)
SELECT id, 20, 1.0, 'Default: 20 tetes/ml, gravity 1.0'
FROM raw_materials;

-- Update for essential oils (lighter, ~0.88-0.92)
UPDATE conversion_factors SET drops_per_ml = 22, specific_gravity = 0.90, notes = 'Essential oil: lighter, more drops per ml'
WHERE raw_material_id IN (
  SELECT id FROM raw_materials WHERE chemical_group = 'essential_oil'
);

UPDATE conversion_factors SET drops_per_ml = 22, specific_gravity = 0.88, notes = 'Citrus essential oil'
WHERE raw_material_id IN (
  SELECT id FROM raw_materials WHERE chemical_group = 'essential_oil' AND family = 'Citrus'
);

-- Update for heavy/resinous materials
UPDATE conversion_factors SET drops_per_ml = 18, specific_gravity = 1.05, notes = 'Resinoid/absolute: heavier'
WHERE raw_material_id IN (
  SELECT id FROM raw_materials WHERE chemical_group IN ('resinoid', 'absolute', 'balsamic_resin')
);
