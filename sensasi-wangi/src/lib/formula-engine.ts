// src/lib/formula-engine.ts
// AI Perfume Composer — Formula Engine
// Botol: 30ml | Unit: drops & gram dual | Masterasi: di botol, tempat gelap

import { getDb } from "./swi-db";

// ════════════════════════════════════════════
// Types
// ════════════════════════════════════════∎

export interface RawMaterialRow {
  id: number;
  no: number;
  name: string;
  synonym: string | null;
  family: string;
  odor_profile: string;
  odor_intensity: number | null;
  cas_number: string | null;
  chemical_group: string | null;
  note_position: string;
  stock_ml: number;
  is_diluted: boolean;
  dilution_percent: number | null;
  dilution_solvent: string | null;
  price_per_5ml: number;
  price_per_10ml: number;
  price_per_50ml: number;
  price_per_100ml: number;
  price_per_500ml: number;
  kategori_rm: string;
  display_name_on_shelf: string | null;
}

export interface ScentProfile {
  mood: string;
  intensity: number;
  longevity_target: string;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  forbidden_families?: string[];
}

export interface FormulaIngredient {
  raw_material_id: number;
  name: string;
  family: string;
  note_position: string;
  quantity_drops: number;
  quantity_grams: number;
  quantity_ml: number;
  display_order: number;
  addition_step: number;
  step_label: string;
  cost: number;
  is_diluted: boolean;
  dilution_percent: number;
  shelf_label: string;
  odor_profile: string;
  odor_intensity?: number;
}

export interface MixingStep {
  step_number: number;
  step_title: string;
  step_description: string;
  duration_seconds: number;
  visual_color: string;
  ingredients: FormulaIngredient[];
  animation_type: string;
}

export interface FormulaResult {
  ingredients: FormulaIngredient[];
  mixing_steps: MixingStep[];
  total_cost: number;
  total_concentrate_ml: number;
  total_alcohol_ml: number;
  maturation_days: number;
  maturation_notes: string;
  formula_name: string;
}

// ════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════

export const BOTTLE_SIZE = 30; // ml
export const CONCENTRATION_EDP = 15; // percent
export const DROPS_PER_ML = 20;
const SPECIFIC_GRAVITY_DEFAULT = 0.95;

// Color per note layer for UI
const LAYER_COLORS: Record<string, string> = {
  top: "#FFD700",    // gold
  middle: "#E8B4C8", // floral pink
  base: "#8B6914",   // warm wood
  carrier: "#7EB8DA", // aquatic blue
};

// ════════════════════════════════════════════
// Main Formula Generator
// ════════════════════════════════════════════

export function generateFormula(profile: ScentProfile): FormulaResult {
  const db = getDb();

  const totalConcentrateMl = BOTTLE_SIZE * (CONCENTRATION_EDP / 100); // 4.5ml for 30ml EDP
  const totalAlcoholMl = BOTTLE_SIZE - totalConcentrateMl;           // 25.5ml

  // Target ratios: top 25%, middle 35%, base 40%
  const topMl = totalConcentrateMl * 0.25;
  const midMl = totalConcentrateMl * 0.35;
  const baseMl = totalConcentrateMl * 0.40;

  const forbidden = profile.forbidden_families || [];

  // Select materials per layer
  const topIngredients = selectMaterials(db, profile.top_notes, "top", topMl, forbidden);
  const midIngredients = selectMaterials(db, profile.middle_notes, "middle", midMl, forbidden);
  const baseIngredients = selectMaterials(db, profile.base_notes, "base", baseMl, forbidden);

  const allIngredients = [...topIngredients, ...midIngredients, ...baseIngredients];

  // Generate mixing steps
  const mixingSteps = generateMixingSteps(allIngredients);

  // Maturation
  const maturationDays = calculateMaturation(allIngredients);
  const maturationNotes = `Simpan botol ini di tempat gelap selama ${maturationDays} hari. Aduk pelan setiap 2-3 hari. Setelah ${maturationDays} hari, parfum siap digunakan.`;

  const totalCost = allIngredients.reduce((sum, ing) => sum + ing.cost, 0);

  return {
    ingredients: allIngredients,
    mixing_steps: mixingSteps,
    total_cost: totalCost,
    total_concentrate_ml: totalConcentrateMl,
    total_alcohol_ml: totalAlcoholMl,
    maturation_days: maturationDays,
    maturation_notes: maturationNotes,
    formula_name: generateFormulaName(profile.mood),
  };
}

function selectMaterials(
  db: ReturnType<typeof getDb>,
  families: string[],
  layer: "top" | "middle" | "base",
  totalMl: number,
  forbidden: string[]
): FormulaIngredient[] {
  const ingredients: FormulaIngredient[] = [];
  const nMaterials = Math.min(families.length, 3); // max 3 per layer
  const mlPerMat = totalMl / nMaterials;

  let counter = layer === "top" ? 1 : layer === "middle" ? 50 : 100;

  for (let i = 0; i < nMaterials; i++) {
    const family = families[i];

    // Skip forbidden families
    if (forbidden.includes(family)) continue;

    const mats = db.prepare(`
      SELECT rm.*, cf.drops_per_ml, cf.specific_gravity
      FROM raw_materials rm
      LEFT JOIN conversion_factors cf ON cf.raw_material_id = rm.id
      WHERE rm.family = ?
        AND (rm.note_position = ? OR rm.note_position = 'all')
        AND rm.stock_ml > 0
        AND rm.kategori_rm NOT IN ('solvent', 'eco_base')
      ORDER BY rm.odor_intensity DESC NULLS LAST, rm.price_per_10ml ASC
      LIMIT 1
    `).get(family, layer) as (RawMaterialRow & { drops_per_ml: number; specific_gravity: number }) | undefined;

    if (!mats) continue;

    const sg = mats.specific_gravity || SPECIFIC_GRAVITY_DEFAULT;
    const dpm = mats.drops_per_ml || DROPS_PER_ML;
    const dilFactor = mats.dilution_percent ? (100 / mats.dilution_percent) : 1;
    const adjMl = mlPerMat * dilFactor;

    const grams = Math.round(adjMl * sg * 100) / 100;
    const drops = Math.round(adjMl * dpm);

    const costPerMl = (mats.price_per_100ml || mats.price_per_50ml / 2 || mats.price_per_10ml / 10 || 0);
    const cost = Math.round(adjMl * costPerMl);

    ingredients.push({
      raw_material_id: mats.id,
      name: mats.display_name_on_shelf || mats.name,
      family: mats.family,
      note_position: layer,
      quantity_drops: drops,
      quantity_grams: grams,
      quantity_ml: Math.round(adjMl * 100) / 100,
      display_order: counter++,
      addition_step: layer === "top" ? 1 : layer === "middle" ? 2 : 3,
      step_label: layer === "top" ? "Top Notes" : layer === "middle" ? "Middle Notes" : "Base Notes",
      cost,
      is_diluted: mats.is_diluted,
      dilution_percent: mats.dilution_percent || 100,
      shelf_label: mats.name,
      odor_profile: mats.odor_profile,
    });
  }

  return ingredients;
}

function generateMixingSteps(ingredients: FormulaIngredient[]): MixingStep[] {
  const steps: MixingStep[] = [];
  let stepNum = 1;

  // Group by step label
  const groups: Record<string, FormulaIngredient[]> = {};
  for (const ing of ingredients) {
    const key = ing.step_label;
    if (!groups[key]) groups[key] = [];
    groups[key].push(ing);
  }

  const layerOrder = ["Top Notes", "Middle Notes", "Base Notes"];
  const animTypes = ["pour", "pour", "pour"];

  for (let i = 0; i < layerOrder.length; i++) {
    const label = layerOrder[i];
    const group = groups[label];
    if (!group || group.length === 0) continue;

    const ingredientList = group.map(g => `${g.name}: ${g.quantity_drops} tetes / ${g.quantity_grams}g`).join("\\n");

    steps.push({
      step_number: stepNum++,
      step_title: `Tambahkan ${label}`,
      step_description: `Teteskan bahan ${label.toLowerCase()} secara perlahan ke dalam beaker:\\n${ingredientList}`,
      duration_seconds: 30,
      visual_color: LAYER_COLORS[label === "Top Notes" ? "top" : label === "Middle Notes" ? "middle" : "base"],
      ingredients: group,
      animation_type: animTypes[i],
    });

    // Add shake step after each layer (except last)
    if (i < layerOrder.length - 1) {
      steps.push({
        step_number: stepNum++,
        step_title: "Aduk Pelan",
        step_description: "Goyangkan beaker perlahan selama 10 detik hingga tercampur rata",
        duration_seconds: 10,
        visual_color: "#CCCCCC",
        ingredients: [],
        animation_type: "shake",
      });
    }
  }

  // Final shake
  steps.push({
    step_number: stepNum++,
    step_title: "Aduk Rata",
    step_description: "Goyangkan beaker selama 30 detik hingga semua bahan tercampur sempurna",
    duration_seconds: 30,
    visual_color: "#888888",
    ingredients: [],
    animation_type: "shake",
  });

  // Add alcohol
  steps.push({
    step_number: stepNum++,
    step_title: "Tambahkan Alkohol",
    step_description: "Tambahkan Ethanol 96% ke dalam beaker. Goyangkan 1 menit hingga homogen",
    duration_seconds: 60,
    visual_color: LAYER_COLORS.carrier,
    ingredients: [],
    animation_type: "pour",
  });

  // Transfer to bottle
  steps.push({
    step_number: stepNum++,
    step_title: "Pindahkan ke Botol",
    step_description: "Tuang campuran dari beaker ke botol 30ml menggunakan corong. Tutup rapat botol",
    duration_seconds: 15,
    visual_color: "#FFFFFF",
    ingredients: [],
    animation_type: "pour",
  });

  // Maturation
  steps.push({
    step_number: stepNum,
    step_title: "Masterasi",
    step_description: "Simpan botol di tempat gelap. Aduk pelan setiap 2-3 hari. Parfum siap setelah masa masterasi.",
    duration_seconds: 0,
    visual_color: "#2C1810",
    ingredients: [],
    animation_type: "wait",
  });

  return steps;
}

function calculateMaturation(ingredients: FormulaIngredient[]): number {
  // Base: 7 days for EDT, 14 for EDP, 30 for extrait
  let days = 14; // EDP default

  // +7 days if heavy base notes present
  const hasHeavyBase = ingredients.some(i =>
    i.note_position === "base" &&
    i.family === "woody" &&
    i.odor_intensity && i.odor_intensity > 7
  );
  if (hasHeavyBase) days += 7;

  // +7 days if animalic notes present
  const hasAnimalic = ingredients.some(i => i.family === "Animalic");
  if (hasAnimalic) days += 7;

  return Math.min(days, 45); // cap at 45 days
}

function generateFormulaName(mood: string): string {
  const prefixes: Record<string, string> = {
    fresh: "Segar",
    romantic: "Romantis",
    mysterious: "Misterius",
    energetic: "Energik",
    calming: "Tenang",
    sensual: "Sensual",
    clean: "Bersih",
    warm: "Hangat",
    cool: "Dingin",
    tropical: "Tropis",
    elegant: "Elegan",
    cozy: "Nyaman",
    modern: "Modern",
    cultural: "Nusantara",
  };

  const base = mood.split(" ")[0].toLowerCase();
  const prefix = prefixes[base] || "Unik";

  const rand = Math.floor(Math.random() * 1000);
  return `${prefix} #${rand}`;
}

// ════════════════════════════════════════════
// Prompt-to-Scent Analysis (calls OpenAI)
// ════════════════════════════════════════════

export async function analyzePromptWithAI(prompt: string): Promise<ScentProfile> {
  // This calls the OpenAI API via our backend
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("AI analysis failed");
  }

  return response.json();
}

// ════════════════════════════════════════════
// Image-to-Scent Analysis (calls OpenAI Vision)
// ════════════════════════════════════════════

export async function analyzeImageWithAI(base64Image: string): Promise<ScentProfile> {
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    throw new Error("Image analysis failed");
  }

  return response.json();
}

// ════════════════════════════════════════════
// Formula Persistence
// ════════════════════════════════════════════

export function saveFormula(
  profile: ScentProfile,
  result: FormulaResult,
  visitorId?: number,
  inputType: string = "text_prompt",
  inputText?: string
): number {
  const db = getDb();

  const code = `SW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

  // Insert formula
  const formulaStmt = db.prepare(`
    INSERT INTO formulas (
      formula_code, input_type, input_text, ai_mood, ai_scent_profile,
      ai_top_notes, ai_middle_notes, ai_base_notes, ai_intensity,
      bottle_size_ml, concentration_type, concentration_percent,
      total_concentrate_ml, total_alcohol_ml,
      maturation_days, maturation_notes,
      total_cost, selling_price,
      visitor_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
  `);

  const info = formulaStmt.run(
    code,
    inputType,
    inputText || null,
    profile.mood,
    JSON.stringify(profile),
    JSON.stringify(profile.top_notes),
    JSON.stringify(profile.middle_notes),
    JSON.stringify(profile.base_notes),
    profile.intensity,
    BOTTLE_SIZE,
    "EDP",
    CONCENTRATION_EDP,
    result.total_concentrate_ml,
    result.total_alcohol_ml,
    result.maturation_days,
    result.maturation_notes,
    result.total_cost,
    Math.round(result.total_cost * 2.5), // selling price = 2.5x cost
    visitorId || null
  );

  const formulaId = info.lastInsertRowid as number;

  // Insert ingredients
  const ingStmt = db.prepare(`
    INSERT INTO formula_ingredients (
      formula_id, raw_material_id, quantity_drops, quantity_grams,
      quantity_ml, display_order, addition_step, step_label, cost_at_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ing of result.ingredients) {
    ingStmt.run(
      formulaId, ing.raw_material_id, ing.quantity_drops, ing.quantity_grams,
      ing.quantity_ml, ing.display_order, ing.addition_step, ing.step_label, ing.cost
    );
  }

  // Insert mixing steps
  const stepStmt = db.prepare(`
    INSERT INTO mixing_steps (
      formula_id, step_number, step_title, step_description,
      duration_seconds, ingredient_ids, animation_type, visual_color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const step of result.mixing_steps) {
    stepStmt.run(
      formulaId, step.step_number, step.step_title, step.step_description,
      step.duration_seconds,
      JSON.stringify(step.ingredients.map(i => i.raw_material_id)),
      step.animation_type, step.visual_color
    );
  }

  // Update stock
  const stockStmt = db.prepare(`UPDATE raw_materials SET stock_ml = stock_ml - ? WHERE id = ?`);
  for (const ing of result.ingredients) {
    stockStmt.run(ing.quantity_ml, ing.raw_material_id);
  }

  return formulaId;
}

// ════════════════════════════════════════════
// Shelf Display
// ════════════════════════════════════════════

export interface ShelfDisplay {
  id: number;
  name: string;
  family: string;
  note_position: string;
  concentration: string;  // "100%" or "50% DPG" etc
  has_stock: boolean;
}

/**
 * Get all materials for etalase display
 * Groups by family, shows both pure and diluted versions
 */
export function getShelfDisplay(): ShelfDisplay[] {
  const db = getDb();

  const materials = db.prepare(`
    SELECT rm.id, rm.name, rm.family, rm.note_position, rm.stock_ml,
           rm.dilution_percent, rm.dilution_solvent, rm.is_diluted,
           rm.display_name_on_shelf
    FROM raw_materials rm
    WHERE rm.kategori_rm NOT IN ('solvent', 'eco_base')
    ORDER BY rm.family, rm.note_position, rm.name
  `).all() as {
    id: number; name: string; family: string; note_position: string;
    stock_ml: number; dilution_percent: number | null;
    dilution_solvent: string | null; is_diluted: boolean;
    display_name_on_shelf: string | null;
  }[];

  return materials.map(m => ({
    id: m.id,
    name: m.display_name_on_shelf || m.name,
    family: m.family,
    note_position: m.note_position,
    concentration: m.is_diluted && m.dilution_percent
      ? `${m.dilution_percent}% ${m.dilution_solvent || ''}`.trim()
      : "100%",
    has_stock: m.stock_ml > 0,
  }));
}

// ════════════════════════════════════════════
// Material Detail (for AI knowledge)
// ════════════════════════════════════════════

export function getMaterialDetail(id: number): RawMaterialRow & {
  history: string;
  solubility: string;
  safety_notes: string;
} | null {
  const db = getDb();
  return db.prepare("SELECT * FROM raw_materials WHERE id = ?").get(id) as any;
}

/**
 * Search materials by keyword — used by AI to find matching materials
 */
export function searchMaterials(keyword: string, family?: string, limit: number = 10): RawMaterialRow[] {
  const db = getDb();

  let sql = `
    SELECT rm.*
    FROM raw_materials rm
    WHERE rm.stock_ml > 0
      AND (rm.name LIKE ? OR rm.odor_profile LIKE ? OR rm.synonym LIKE ?)
  `;
  const params: any[] = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

  if (family) {
    sql += ` AND rm.family = ?`;
    params.push(family);
  }

  sql += ` ORDER BY rm.odor_intensity DESC LIMIT ?`;
  params.push(limit);

  return db.prepare(sql).all(...params) as RawMaterialRow[];
}
