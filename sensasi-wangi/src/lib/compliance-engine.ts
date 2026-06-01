// src/lib/compliance-engine.ts
// P0-1: IFRA Compliance Engine
// P0-3: Allergen Label Generator
// Checks every formula against IFRA standards and generates safety labels

import { getDb } from "./swi-db";
import type { FormulaIngredient } from "./formula-engine";

// ════════════════════════════════════════════
// Types
// ════════════════════════════════════════════

export interface ComplianceResult {
  overallStatus: "pass" | "warn" | "fail";
  productCategory: string;
  totalConcentration: number;
  maxAllowedConcentration: number;
  failingIngredients: FailingIngredient[];
  warnings: string[];
  passedChecks: string[];
}

export interface FailingIngredient {
  name: string;
  casNumber: string | null;
  actualPercent: number;
  maxAllowedPercent: number;
  restrictionType: "prohibited" | "restricted" | "specification";
  notes: string;
}

export interface AllergenLabel {
  formulaId: number;
  labelText: string;
  allergens: AllergenInfo[];
  warnings: string[];
  precautions: string[];
  storageInstructions: string;
  expiryDate: string;
}

export interface AllergenInfo {
  name: string;
  casNumber: string | null;
  source: string;
  concentration: number;
  isAboveThreshold: boolean;
}

// ════════════════════════════════════════════
// P0-1: IFRA Compliance Check
// ════════════════════════════════════════════

/**
 * Check a formula against IFRA standards
 *
 * Flow:
 * 1. Get product category (default: CAT4 — hydroalcoholic body)
 * 2. Get max allowed concentration for the category
 * 3. For each ingredient, check:
 *    a. Material-specific IFRA limit (if exists)
 *    b. Category-level limit
 *    c. Allergen threshold (0.01% for leave-on, 0.001% for rinse-off)
 * 4. Return compliance result with pass/warn/fail status
 */
export function checkCompliance(
  ingredients: FormulaIngredient[],
  productCategory: string = "CAT4",
  bottleSizeMl: number = 30
): ComplianceResult {
  const db = getDb();

  // Get category limit
  const category = db.prepare(
    "SELECT * FROM ifra_categories WHERE category_code = ?"
  ).get(productCategory) as {
    category_code: string;
    max_concentration_percent: number;
  } | undefined;

  const maxCategoryConcentration = category?.max_concentration_percent ?? 15.0;

  // Calculate total concentrate
  const totalConcentrateMl = ingredients.reduce((sum, ing) => sum + ing.quantity_ml, 0);
  const totalConcentration = (totalConcentrateMl / bottleSizeMl) * 100;

  const failingIngredients: FailingIngredient[] = [];
  const warnings: string[] = [];
  const passedChecks: string[] = [];

  // Check each ingredient
  for (const ing of ingredients) {
    const rm = db.prepare(
      "SELECT * FROM raw_materials WHERE id = ?"
    ).get(ing.raw_material_id) as {
      id: number;
      name: string;
      cas_number: string | null;
      ifra_class: string | null;
      max_usage_percent: number | null;
      allergens: string | null;
      safety_notes: string | null;
    } | undefined;

    if (!rm) {
      warnings.push(`Raw material "${ing.name}" not found in database`);
      continue;
    }

    const ingredientPercent = (ing.quantity_ml / bottleSizeMl) * 100;

    // Check 1: Material-specific IFRA limit
    const materialLimit = db.prepare(
      "SELECT * FROM ifra_material_limits WHERE raw_material_id = ? AND ifra_category_code = ?"
    ).get(ing.raw_material_id, productCategory) as {
      max_concentration_percent: number;
      restriction_type: string;
      notes: string;
    } | undefined;

    const effectiveLimit = materialLimit
      ? materialLimit.max_concentration_percent
      : (rm.max_usage_percent ?? maxCategoryConcentration);

    if (ingredientPercent > effectiveLimit) {
      failingIngredients.push({
        name: rm.name,
        casNumber: rm.cas_number,
        actualPercent: Math.round(ingredientPercent * 100) / 100,
        maxAllowedPercent: effectiveLimit,
        restrictionType: materialLimit?.restriction_type as any ?? "restricted",
        notes: materialLimit?.notes ?? `Exceeds max usage of ${effectiveLimit}%`,
      });
    } else {
      passedChecks.push(`${rm.name}: ${Math.round(ingredientPercent * 100) / 100}% ≤ ${effectiveLimit}%`);
    }

    // Check 2: Allergen threshold (IFRA: >0.01% for leave-on products)
    if (rm.allergens) {
      const allergenThreshold = productCategory.startsWith("CAT5") ? 0.001 : 0.01;
      if (ingredientPercent > allergenThreshold) {
        warnings.push(
          `${rm.name} contains allergens (${rm.allergens}) at ${Math.round(ingredientPercent * 100) / 100}% — exceeds ${allergenThreshold}% threshold for ${productCategory}`
        );
      }
    }

    // Check 3: Safety notes
    if (rm.safety_notes) {
      warnings.push(`${rm.name}: ${rm.safety_notes}`);
    }
  }

  // Check total concentration
  if (totalConcentration > maxCategoryConcentration) {
    warnings.push(
      `Total concentrate ${Math.round(totalConcentration * 100) / 100}% exceeds category limit of ${maxCategoryConcentration}% for ${productCategory}`
    );
  } else {
    passedChecks.push(
      `Total concentration: ${Math.round(totalConcentration * 100) / 100}% ≤ ${maxCategoryConcentration}%`
    );
  }

  // Determine overall status
  let overallStatus: "pass" | "warn" | "fail" = "pass";
  if (failingIngredients.some(f => f.restrictionType === "prohibited")) {
    overallStatus = "fail";
  } else if (failingIngredients.length > 0) {
    overallStatus = "fail";
  } else if (warnings.length > 0) {
    overallStatus = "warn";
  }

  return {
    overallStatus,
    productCategory,
    totalConcentration: Math.round(totalConcentration * 100) / 100,
    maxAllowedConcentration: maxCategoryConcentration,
    failingIngredients,
    warnings,
    passedChecks,
  };
}

/**
 * Save compliance check result to database
 */
export function saveComplianceCheck(
  formulaId: number,
  result: ComplianceResult
): number {
  const db = getDb();

  const info = db.prepare(`
    INSERT INTO compliance_checks (
      formula_id, overall_status, product_category,
      total_concentration_percent, failing_ingredients,
      warnings, passed_checks, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    formulaId,
    result.overallStatus,
    result.productCategory,
    result.totalConcentration,
    JSON.stringify(result.failingIngredients),
    JSON.stringify(result.warnings),
    JSON.stringify(result.passedChecks),
    result.overallStatus === "fail" ? "Formula requires revision" : null
  );

  return info.lastInsertRowid as number;
}

// ════════════════════════════════════════════
// P0-3: Allergen Label Generator
// ════════════════════════════════════════════

/**
 * Generate allergen label for a formula
 *
 * Based on EU Regulation 1223/2009 and IFRA standards:
 * - 26 allergens must be listed if >0.01% (leave-on) or >0.001% (rinse-off)
 * - Must include: product name, ingredients, batch, expiry, warnings
 */
export function generateAllergenLabel(
  formulaId: number,
  ingredients: FormulaIngredient[],
  productName: string,
  bottleSizeMl: number = 30,
  maturationDays: number = 14
): AllergenLabel {
  const db = getDb();

  const allergens: AllergenInfo[] = [];
  const warnings: string[] = [];
  const precautions: string[] = [];

  // Known fragrance allergens (EU 26 + common ones)
  const knownAllergenKeywords = [
    "linalool", "limonene", "citronellol", "geraniol", "citral",
    "eugenol", "coumarin", "benzyl alcohol", "benzyl benzoate",
    "benzyl salicylate", "cinnamal", "cinnamyl alcohol", "farnesol",
    "alpha-isomethyl ionone", "hydroxycitronellal", "anise alcohol",
    "amyl cinnamal", "amylcinnamyl alcohol", "isoeugenol",
    "methyl 2-octynoate", "evernia prunastri", "evernia furfuracea",
    "hydroxyisohexyl 3-cyclohexene carboxaldehyde",
  ];

  for (const ing of ingredients) {
    const rm = db.prepare(
      "SELECT * FROM raw_materials WHERE id = ?"
    ).get(ing.raw_material_id) as {
      name: string;
      cas_number: string | null;
      allergens: string | null;
      safety_notes: string | null;
    } | undefined;

    if (!rm) continue;

    const concentration = (ing.quantity_ml / bottleSizeMl) * 100;
    const threshold = 0.01; // leave-on threshold

    // Check if ingredient is a known allergen
    const isAllergen =
      rm.allergens ||
      knownAllergenKeywords.some(kw =>
        rm.name.toLowerCase().includes(kw) ||
        (rm.cas_number && rm.cas_number.includes(kw))
      );

    if (isAllergen && concentration > threshold) {
      allergens.push({
        name: rm.name,
        casNumber: rm.cas_number,
        source: rm.name,
        concentration: Math.round(concentration * 100) / 100,
        isAboveThreshold: true,
      });
    }
  }

  // Standard warnings
  warnings.push("Hanya untuk pemakaian luar");
  warnings.push("Hindari kontak dengan mata");
  warnings.push("Jauhkan dari jangkauan anak-anak");
  warnings.push("Simpan di tempat sejuk dan kering, hindari sinar matahari langsung");

  if (allergens.some(a => a.name.toLowerCase().includes("citral") || a.name.toLowerCase().includes("limonene"))) {
    warnings.push("Mengandung senyawa yang dapat menyebabkan reaksi alergi pada kulit sensitif");
  }

  // Standard precautions
  precautions.push("Lakukan patch test sebelum penggunaan pertama");
  precautions.push("Hentikan penggunaan jika terjadi iritasi");
  precautions.push("Konsultasikan dengan dokter jika memiliki kondisi kulit tertentu");

  // Calculate expiry (typically 12-24 months from production)
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);

  // Generate label text
  const labelText = generateLabelText(
    productName,
    bottleSizeMl,
    allergens,
    warnings,
    precautions,
    maturationDays,
    expiryDate
  );

  // Save to database
  db.prepare(`
    INSERT OR REPLACE INTO allergen_labels (
      formula_id, label_text, allergen_list, warning_list,
      precaution_list
    ) VALUES (?, ?, ?, ?, ?)
  `).run(
    formulaId,
    labelText,
    JSON.stringify(allergens),
    JSON.stringify(warnings),
    JSON.stringify(precautions)
  );

  return {
    formulaId,
    labelText,
    allergens,
    warnings,
    precautions,
    storageInstructions: "Simpan di tempat sejuk dan kering, hindari sinar matahari langsung",
    expiryDate: expiryDate.toISOString().slice(0, 10),
  };
}

function generateLabelText(
  productName: string,
  bottleSizeMl: number,
  allergens: AllergenInfo[],
  warnings: string[],
  precautions: string[],
  maturationDays: number,
  expiryDate: Date
): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════");
  lines.push(`  ${productName.toUpperCase()}`);
  lines.push(`  PT Sensasi Wangi Indonesia`);
  lines.push("═══════════════════════════════════════");
  lines.push("");
  lines.push(`  Netto: ${bottleSizeMl} ml`);
  lines.push(`  Konsentrasi: EDP (15%)`);
  lines.push("");

  if (allergens.length > 0) {
    lines.push("  ⚠️  ALERGEN:");
    for (const a of allergens) {
      lines.push(`    • ${a.name} (${a.concentration}%)`);
    }
    lines.push("");
  }

  lines.push("  📋 PERINGATAN:");
  for (const w of warnings) {
    lines.push(`    • ${w}`);
  }
  lines.push("");

  lines.push("  💡 TIPS PENGGUNAAN:");
  lines.push(`    • Masterasi: ${maturationDays} hari di tempat gelap`);
  lines.push(`    • Aduk pelan setiap 2-3 hari selama masterasi`);
  lines.push(`    • Setelah ${maturationDays} hari, parfum siap digunakan`);
  lines.push("");

  lines.push("  🔬 PENCEGAHAN:");
  for (const p of precautions) {
    lines.push(`    • ${p}`);
  }
  lines.push("");

  lines.push("  📦 PENYIMPANAN:");
  lines.push("    • Simpan di tempat sejuk & kering");
  lines.push("    • Hindari sinar matahari langsung");
  lines.push("    • Jauhkan dari api");
  lines.push("");

  lines.push(`  📅 Exp: ${expiryDate.toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("  🏭 PT Sensasi Wangi Indonesia");
  lines.push("  Jakarta, Indonesia");
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

// ════════════════════════════════════════════
// P0-2: Batch Traceability Helpers
// ════════════════════════════════════════════

/**
 * Generate a lot number for raw material batch
 */
export function generateLotNumber(rawMaterialId: number): string {
  const db = getDb();
  const rm = db.prepare("SELECT name FROM raw_materials WHERE id = ?").get(rawMaterialId) as { name: string } | undefined;
  const prefix = rm ? rm.name.slice(0, 4).toUpperCase() : "RM";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `LOT-${date}-${prefix}-${rand}`;
}

/**
 * Generate a product batch number
 */
export function generateBatchNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `SW-${date}-${rand}`;
}

/**
 * Create a product batch with full traceability
 */
export function createProductBatch(
  formulaId: number,
  ingredients: FormulaIngredient[],
  producedBy: string = "system"
): { batchNumber: string; batchId: number } {
  const db = getDb();

  const batchNumber = generateBatchNumber();

  // Insert product batch
  const batchInfo = db.prepare(`
    INSERT INTO product_batches (
      batch_number, formula_id, produced_by, status,
      maturation_start_date
    ) VALUES (?, ?, ?, 'produced', ?)
  `).run(
    batchNumber,
    formulaId,
    producedBy,
    new Date().toISOString().slice(0, 10)
  );

  const batchId = batchInfo.lastInsertRowid as number;

  // Link to raw material batches (use oldest available batch per material)
  for (const ing of ingredients) {
    const rmBatch = db.prepare(`
      SELECT * FROM raw_material_batches
      WHERE raw_material_id = ? AND remaining_ml >= ? AND quality_status = 'approved'
      ORDER BY received_date ASC
      LIMIT 1
    `).get(ing.raw_material_id, ing.quantity_ml) as {
      id: number;
      remaining_ml: number;
    } | undefined;

    if (rmBatch) {
      // Link material to product batch
      db.prepare(`
        INSERT INTO product_batch_materials (product_batch_id, raw_material_batch_id, quantity_used_ml)
        VALUES (?, ?, ?)
      `).run(batchId, rmBatch.id, ing.quantity_ml);

      // Deduct remaining stock
      db.prepare(`
        UPDATE raw_material_batches SET remaining_ml = remaining_ml - ? WHERE id = ?
      `).run(ing.quantity_ml, rmBatch.id);
    }
  }

  return { batchNumber, batchId };
}

/**
 * Get full traceability report for a product batch
 */
export function getTraceabilityReport(batchNumber: string): {
  batch: any;
  formula: any;
  materials: any[];
  compliance: any;
} | null {
  const db = getDb();

  const batch = db.prepare(`
    SELECT pb.*, f.formula_code, f.ai_mood, f.concentration_type
    FROM product_batches pb
    JOIN formulas f ON f.id = pb.formula_id
    WHERE pb.batch_number = ?
  `).get(batchNumber);

  if (!batch) return null;

  const materials = db.prepare(`
    SELECT
      rmb.lot_number, rmb.supplier_name, rmb.received_date,
      rmb.quality_status, rmb.test_results,
      rm.name as material_name, rm.cas_number,
      pbm.quantity_used_ml
    FROM product_batch_materials pbm
    JOIN raw_material_batches rmb ON rmb.id = pbm.raw_material_batch_id
    JOIN raw_materials rm ON rm.id = rmb.raw_material_id
    WHERE pbm.product_batch_id = ?
  `).all((batch as any).id);

  const compliance = db.prepare(`
    SELECT * FROM compliance_checks
    WHERE formula_id = ?
    ORDER BY checked_at DESC
    LIMIT 1
  `).get((batch as any).formula_id);

  return {
    batch,
    formula: batch,
    materials,
    compliance,
  };
}

// ════════════════════════════════════════════
// P0-4: BPOM Registration Helpers
// ════════════════════════════════════════════

/**
 * Create BPOM registration entry
 */
export function createBPOMRegistration(
  productName: string,
  formulaId: number,
  productBatchId: number,
  productType: string = "kosmetik"
): number {
  const db = getDb();

  const info = db.prepare(`
    INSERT INTO bpom_registrations (
      product_name, product_type, formula_id, product_batch_id, status
    ) VALUES (?, ?, ?, ?, 'draft')
  `).run(productName, productType, formulaId, productBatchId);

  return info.lastInsertRowid as number;
}

/**
 * Get BPOM registration status summary
 */
export function getBPOMSummary(): {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  expired: number;
} {
  const db = getDb();

  const rows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM bpom_registrations
    GROUP BY status
  `).all() as { status: string; count: number }[];

  const summary = { total: 0, draft: 0, submitted: 0, approved: 0, expired: 0 };
  for (const row of rows) {
    summary.total += row.count;
    if (row.status in summary) {
      (summary as any)[row.status] = row.count;
    }
  }

  return summary;
}
