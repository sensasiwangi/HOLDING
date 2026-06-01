// src/lib/crm.ts
// P1-3: Customer Relationship Management + CLV Engine
// Segmentasi pelacakan, customer lifetime value, rekomendasi formula

import { getDb } from "./swi-db";

// ── Types ──────────────────────────────────────────────────────

export type CustomerSegment = "new" | "regular" | "loyal" | "vip";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  visit_count: number;
  total_spent: number;
  clv: number;
  segment: CustomerSegment;
  last_visit: string | null;
  referred_by: number | null;
  created_at: string;
}

export interface Purchase {
  id: number;
  customer_id: number;
  formula_id: number | null;
  amount: number;
  formula_name: string | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
}

export interface CustomerProfile extends Customer {
  purchases: Purchase[];
  preferred_moods: string[];
  preferred_families: string[];
  avg_purchase_value: number;
}

export interface SegmentDistribution {
  new: number;
  regular: number;
  loyal: number;
  vip: number;
  total: number;
}

// ── Schema ─────────────────────────────────────────────────────

export function createCrmTables(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT UNIQUE,
      email TEXT,
      source TEXT,
      visit_count INTEGER DEFAULT 1,
      total_spent INTEGER DEFAULT 0,
      clv REAL DEFAULT 0,
      segment TEXT DEFAULT 'new',
      referred_by INTEGER,
      last_visit TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      formula_id INTEGER,
      amount INTEGER NOT NULL,
      formula_name TEXT,
      mood TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases(customer_id);
  `);
}

// ── Segmentation ───────────────────────────────────────────────

function getSegment(visitCount: number): CustomerSegment {
  if (visitCount >= 10) return "vip";
  if (visitCount >= 5) return "loyal";
  if (visitCount >= 2) return "regular";
  return "new";
}

// ── CLV Calculation ────────────────────────────────────────────

function calculateCLVValue(totalSpent: number, visitCount: number, monthsActive: number): number {
  if (visitCount === 0) return 0;
  const avgPurchaseValue = totalSpent / visitCount;
  const purchaseFrequency = monthsActive > 0 ? visitCount / monthsActive : visitCount;
  // CLV = avg purchase × frequency × estimated 12-month lifespan
  return Math.round(avgPurchaseValue * purchaseFrequency * 12);
}

export function recalculateCLV(customerId: number): number {
  const db = getDb();
  createCrmTables();

  const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(customerId) as any;
  if (!customer) return 0;

  const purchases = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM purchases WHERE customer_id = ?").get(customerId) as { count: number; total: number };

  // Calculate months active
  const firstPurchase = db.prepare("SELECT MIN(created_at) as first FROM purchases WHERE customer_id = ?").get(customerId) as { first: string } | undefined;
  let monthsActive = 1;
  if (firstPurchase?.first) {
    const first = new Date(firstPurchase.first);
    const now = new Date();
    monthsActive = Math.max(1, (now.getTime() - first.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  const clv = calculateCLVValue(purchases.total || customer.total_spent, customer.visit_count, monthsActive);
  db.prepare("UPDATE customers SET clv = ?, updated_at = datetime('now') WHERE id = ?").run(clv, customerId);

  return clv;
}

// ── Customer Lookup ────────────────────────────────────────────

export function getCustomerByPhone(phone: string): Customer | null {
  const db = getDb();
  createCrmTables();

  const row = db.prepare("SELECT * FROM customers WHERE phone = ?").get(phone) as any;
  if (!row) return null;

  return {
    id: row.id,
    name: row.name || "",
    phone: row.phone,
    email: row.email,
    source: row.source,
    visit_count: row.visit_count,
    total_spent: row.total_spent,
    clv: row.clv,
    segment: row.segment,
    last_visit: row.last_visit,
    referred_by: row.referred_by,
    created_at: row.created_at,
  };
}

export function upsertCustomer(name: string, phone: string, email?: string, source?: string, referredBy?: number): Customer {
  const db = getDb();
  createCrmTables();

  const existing = getCustomerByPhone(phone);
  if (existing) {
    const newCount = existing.visit_count + 1;
    const segment = getSegment(newCount);
    db.prepare(`
      UPDATE customers SET
        visit_count = ?, segment = ?, last_visit = datetime('now'),
        updated_at = datetime('now'),
        name = COALESCE(?, name),
        email = COALESCE(?, email)
      WHERE phone = ?
    `).run(newCount, segment, name || null, email || null, phone);
    return { ...existing, visit_count: newCount, segment, name: name || existing.name, email: email || existing.email };
  }

  const stmt = db.prepare(`
    INSERT INTO customers (name, phone, email, source, referred_by, last_visit)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  const info = stmt.run(name || null, phone, email || null, source || null, referredBy || null);

  return {
    id: info.lastInsertRowid as number,
    name: name || "",
    phone,
    email: email || null,
    source: source || null,
    visit_count: 1,
    total_spent: 0,
    clv: 0,
    segment: "new",
    last_visit: new Date().toISOString(),
    referred_by: referredBy || null,
    created_at: new Date().toISOString(),
  };
}

// ── Purchase Recording ──────────────────────────────────────────

export function recordPurchase(
  customerId: number,
  amount: number,
  formulaId?: number,
  formulaName?: string,
  mood?: string,
  notes?: string
): number {
  const db = getDb();
  createCrmTables();

  const info = db.prepare(`
    INSERT INTO purchases (customer_id, formula_id, amount, formula_name, mood, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(customerId, formulaId || null, amount, formulaName || null, mood || null, notes || null);

  // Update customer totals
  db.prepare(`
    UPDATE customers SET
      total_spent = total_spent + ?,
      visit_count = visit_count + 1,
      segment = CASE
        WHEN visit_count + 1 >= 10 THEN 'vip'
        WHEN visit_count + 1 >= 5 THEN 'loyal'
        WHEN visit_count + 1 >= 2 THEN 'regular'
        ELSE 'new'
      END,
      updated_at = datetime('now'),
      last_visit = datetime('now')
    WHERE id = ?
  `).run(amount, customerId);

  // Recalculate CLV
  recalculateCLV(customerId);

  return info.lastInsertRowid as number;
}

// ── Customer Profile ───────────────────────────────────────────

export function getCustomerProfile(phoneOrId: string | number): CustomerProfile | null {
  const db = getDb();
  createCrmTables();

  let customer: any;
  if (typeof phoneOrId === "string") {
    customer = db.prepare("SELECT * FROM customers WHERE phone = ?").get(phoneOrId);
  } else {
    customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(phoneOrId);
  }
  if (!customer) return null;

  const purchases = db.prepare("SELECT * FROM purchases WHERE customer_id = ? ORDER BY DESC").all(customer.id) as any[];
  if (purchases.length === 0) {
    // Try without DESC syntax issue
    const p2 = db.prepare("SELECT * FROM purchases WHERE customer_id = ? ORDER BY created_at DESC").all(customer.id) as any[];
    purchases.push(...p2);
  }

  // Analyze preferences
  const moodCounts: Record<string, number> = {};
  for (const p of purchases) {
    if (p.mood) {
      moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
    }
  }
  const preferredMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([m]) => m);

  // Get preferred scent families from formulas
  const formulaIds = purchases.filter(p => p.formula_id).map(p => p.formula_id);
  const preferredFamilies: string[] = [];
  if (formulaIds.length > 0) {
    const placeholders = formulaIds.map(() => "?").join(",");
    const families = db.prepare(`
      SELECT json_extract(f.ai_scent_profile, '$') as profile
      FROM formulas f WHERE f.id IN (${placeholders})
    `).all(...formulaIds) as any[];
    const familyCounts: Record<string, number> = {};
    for (const f of families) {
      try {
        const profile = JSON.parse(f.profile || "{}");
        for (const key of ["top_notes", "middle_notes", "base_notes"]) {
          if (profile[key] && Array.isArray(profile[key])) {
            for (const fam of profile[key]) {
              familyCounts[fam] = (familyCounts[fam] || 0) + 1;
            }
          }
        }
      } catch {}
    }
    preferredFamilies.push(
      ...Object.entries(familyCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f)
    );
  }

  const avgPurchase = purchases.length > 0 ? purchases.reduce((s: number, p: any) => s + p.amount, 0) / purchases.length : 0;

  return {
    id: customer.id,
    name: customer.name || "",
    phone: customer.phone,
    email: customer.email,
    source: customer.source,
    visit_count: customer.visit_count,
    total_spent: customer.total_spent,
    clv: customer.clv,
    segment: customer.segment,
    last_visit: customer.last_visit,
    referred_by: customer.referred_by,
    created_at: customer.created_at,
    purchases,
    preferred_moods: preferredMoods,
    preferred_families: preferredFamilies,
    avg_purchase_value: Math.round(avgPurchase),
  };
}

// ── Segmentation & Analytics ───────────────────────────────────

export function getCustomerSegments(): SegmentDistribution {
  const db = getDb();
  createCrmTables();

  const rows = db.prepare("SELECT segment, COUNT(*) as count FROM customers GROUP BY segment").all() as { segment: string; count: number }[];
  const dist: SegmentDistribution = { new: 0, regular: 0, loyal: 0, vip: 0, total: 0 };
  for (const r of rows) {
    if (r.segment in dist) (dist as any)[r.segment] = r.count;
    dist.total += r.count;
  }
  return dist;
}

export function getAllCustomers(): Customer[] {
  const db = getDb();
  createCrmTables();

  const rows = db.prepare(`
    SELECT * FROM customers ORDER BY total_spent DESC
  `).all() as any[];

  return rows.map(c => ({
    id: c.id, name: c.name || "", phone: c.phone, email: c.email,
    source: c.source, visit_count: c.visit_count, total_spent: c.total_spent,
    clv: c.clv, segment: c.segment, last_visit: c.last_visit,
    referred_by: c.referred_by, created_at: c.created_at,
  }));
}

export function getTopCustomers(limit: number = 10): Customer[] {
  const db = getDb();
  createCrmTables();

  const rows = db.prepare("SELECT * FROM customers ORDER BY clv DESC LIMIT ?").limit(limit).all() as any[];
  return rows.map(c => ({
    id: c.id, name: c.name || "", phone: c.phone, email: c.email,
    source: c.source, visit_count: c.visit_count, total_spent: c.total_spent,
    clv: c.clv, segment: c.segment, last_visit: c.last_visit,
    referred_by: c.referred_by, created_at: c.created_at,
  }));
}

export function getRepeatRate(): number {
  const db = getDb();
  createCrmTables();

  const total = db.prepare("SELECT COUNT(*) as count FROM customers").get() as { count: number };
  const repeat = db.prepare("SELECT COUNT(*) as count FROM customers WHERE visit_count > 1").get() as { count: number };

  return total.count > 0 ? Math.round((repeat.count / total.count) * 100) : 0;
}

export function getAvgPurchaseValue(): number {
  const db = getDb();
  createCrmTables();

  const result = db.prepare("SELECT COALESCE(AVG(amount), 0) as avg FROM purchases").get() as { avg: number };
  return Math.round(result.avg);
}

// ── Recommendation Engine ──────────────────────────────────────

export function recommendFormula(customerId: number): {
  recommended_moods: string[];
  recommended_families: string[];
  reason: string;
} {
  const profile = getCustomerProfile(customerId);
  if (!profile || profile.purchases.length === 0) {
    return {
      recommended_moods: ["fresh", "romantic", "elegant"],
      recommended_families: ["citrus", "floral", "woody"],
      reason: "Pelanggan baru — rekomendasi populer",
    };
  }

  const recommendedMoods = profile.preferred_moods.length > 0
    ? profile.preferred_moods
    : ["fresh", "romantic"];

  const recommendedFamilies = profile.preferred_families.length > 0
    ? profile.preferred_families
    : ["citrus", "floral"];

  return {
    recommended_moods: recommendedMoods,
    recommended_families: recommendedFamilies,
    reason: `Berdasarkan ${profile.purchases.length} pembelian sebelumnya — mood: ${recommendedMoods.join(", ")}`,
  };
}
