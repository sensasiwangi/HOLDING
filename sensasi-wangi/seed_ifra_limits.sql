-- =============================================
-- P0-1: IFRA Material Limits Seed Data
-- Common restricted raw materials with IFRA limits
-- Based on IFRA 51st Amendment standards
-- =============================================

-- High-risk materials (prohibited or severely restricted)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.0, 'prohibited', 'Prohibited in leave-on products. Birch tar oil is a known carcinogen.'
FROM raw_materials WHERE name LIKE '%Birch%tar%' OR name LIKE '%Betula%';

-- Oakmoss / Treemoss (restricted — allergen)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.1, 'restricted', 'IFRA: Oakmoss extract restricted to 0.1% in finished products due to atranol/chloroatranol sensitization.'
FROM raw_materials WHERE name LIKE '%Oakmoss%' OR name LIKE '%Evernia prunastri%';

INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.1, 'restricted', 'IFRA: Treemoss extract restricted to 0.1% in finished products.'
FROM raw_materials WHERE name LIKE '%Treemoss%' OR name LIKE '%Evernia furfuracea%';

-- Lyral / HICC (restricted)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.0, 'prohibited', 'Lyral (HICC) is prohibited in cosmetics per EU Regulation.'
FROM raw_materials WHERE name LIKE '%Lyral%' OR name LIKE '%HICC%' OR name LIKE '%hydroxyisohexyl%';

-- Cinnamaldehyde (restricted — sensitizer)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.05, 'restricted', 'IFRA: Cinnamaldehyde restricted due to skin sensitization. Max 0.05% in leave-on.'
FROM raw_materials WHERE name LIKE '%Cinnamaldehyde%' OR name LIKE '%Cinnamal%';

-- Eugenol (restricted — sensitizer)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.5, 'restricted', 'IFRA: Eugenol restricted to 0.5% in leave-on products (except oral).'
FROM raw_materials WHERE no = 154;

-- Citral (restricted — sensitizer, total 2.7% in EDP)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.6, 'restricted', 'IFRA: Citral restricted to max 0.6% in hydroalcoholic products. Must be used with antioxidants.'
FROM raw_materials WHERE no = 104;

-- Limonene (restricted — oxidizes easily)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 15.0, 'specification', 'IFRA: Limonene must be used with antioxidants (BHT/TBHQ) due to auto-oxidation.'
FROM raw_materials WHERE name LIKE '%Limonene%' OR name LIKE '%Lemonene%';

-- Linalool (restricted — oxidizes easily)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 15.0, 'specification', 'IFRA: Linalool must be used with antioxidants due to auto-oxidation.'
FROM raw_materials WHERE no = 244;

-- Indole (restricted — strong odor)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.1, 'restricted', 'IFRA: Indole restricted to 0.1% in EDP due to very strong odor. Use sparingly.'
FROM raw_materials WHERE no = 192 OR no = 193;

-- Isobutyl quinoline (prohibited)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.0, 'prohibited', 'Prohibited in cosmetics.'
FROM raw_materials WHERE name LIKE '%quinoline%';

-- Diethyl phthalate (prohibited as fragrance ingredient)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 0.0, 'prohibited', 'DEP is prohibited as a fragrance ingredient per IFRA.'
FROM raw_materials WHERE name LIKE '%phthalate%' OR name LIKE '%DEP%';

-- Musk Xylene & Musk Ketone (restricted — environmental concern)
INSERT OR IGNORE INTO ifra_material_limits (raw_material_id, ifra_category_code, max_concentration_percent, restriction_type, notes)
SELECT id, 'CAT4', 1.0, 'restricted', 'IFRA: Nitromusks restricted due to environmental persistence. Use synthetic polycyclic musks instead.'
FROM raw_materials WHERE name LIKE '%Musk Xylene%' OR name LIKE '%Musk Ketone%';

-- Update raw_materials with IFRA class for key materials
UPDATE raw_materials SET ifra_class = 'Class D — Restricted', max_usage_percent = 0.1 WHERE name LIKE '%Oakmoss%' OR name LIKE '%Evernia prunastri%';
UPDATE raw_materials SET ifra_class = 'Class D — Restricted', max_usage_percent = 0.5 WHERE no = 154; -- Eugenol
UPDATE raw_materials SET ifra_class = 'Class B — Restricted', max_usage_percent = 0.05 WHERE name LIKE '%Cinnamaldehyde%';
UPDATE raw_materials SET ifra_class = 'Class B — Restricted', max_usage_percent = 0.6 WHERE no = 104; -- Citral
UPDATE raw_materials SET ifra_class = 'Class A — Restricted', max_usage_percent = 0.1 WHERE no = 192 OR no = 193; -- Indole
UPDATE raw_materials SET ifra_class = 'Class C — Specification', max_usage_percent = NULL WHERE no = 244; -- Linalool (needs antioxidant)
