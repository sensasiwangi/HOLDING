// src/lib/__tests__/sukuk-api.test.ts
/**
 * Test sukuk CRUD and distribution operations.
 * Uses actual DB column names from schema.sql.
 */
import { db } from '@/lib/db';

describe('Sukuk CRUD Operations', () => {
  let testId: number;

  beforeAll(() => {
    db.prepare("DELETE FROM sukuk WHERE nama LIKE 'TEST_%'").run();
  });

  afterAll(() => {
    db.prepare("DELETE FROM sukuk WHERE nama LIKE 'TEST_%'").run();
  });

  test('insert a new sukuk', () => {
    const result = db.prepare(`
      INSERT INTO sukuk (kode, nama, jenis_akad, nilai_sukuk, harga_unit, total_unit, target_unit, tenor_bulan, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('TEST-001', 'TEST_Sukuk1', 'mudharabah', 100000000, 1000000, 100, 100, 12, '2025-01-01', '2025-12-31', 'open');

    expect(result.changes).toBe(1);
    testId = result.lastInsertRowid as number;
  });

  test('read sukuk by id', () => {
    const row = db.prepare('SELECT * FROM sukuk WHERE id = ?').get(testId) as any;
    expect(row).toBeDefined();
    expect(row.nama).toBe('TEST_Sukuk1');
    expect(row.kode).toBe('TEST-001');
    expect(row.jenis_akad).toBe('mudharabah');
    expect(row.nilai_sukuk).toBe(100000000);
    expect(row.status).toBe('open');
  });

  test('update sukuk', () => {
    const result = db.prepare(`
      UPDATE sukuk SET nama = ?, nilai_sukuk = ?, status = ? WHERE id = ?
    `).run('TEST_Sukuk1_Updated', 200000000, 'closed', testId);

    expect(result.changes).toBe(1);

    const row = db.prepare('SELECT * FROM sukuk WHERE id = ?').get(testId) as any;
    expect(row.nilai_sukuk).toBe(200000000);
    expect(row.status).toBe('closed');
  });

  test('list all test sukuk', () => {
    // Insert another one
    db.prepare(`
      INSERT INTO sukuk (kode, nama, jenis_akad, nilai_sukuk, harga_unit, total_unit, target_unit, tenor_bulan, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('TEST-002', 'TEST_Sukuk2', 'musyarakah', 50000000, 500000, 100, 100, 6, 'open');

    const rows = db.prepare("SELECT * FROM sukuk WHERE nama LIKE 'TEST_%'").all() as any[];
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  test('delete sukuk', () => {
    const result = db.prepare('DELETE FROM sukuk WHERE id = ?').run(testId);
    expect(result.changes).toBe(1);

    const row = db.prepare('SELECT * FROM sukuk WHERE id = ?').get(testId);
    expect(row).toBeUndefined();
  });

  test('default sukuk seed exists', () => {
    const row = db.prepare("SELECT * FROM sukuk WHERE kode = 'SWQ-001'").get() as any;
    expect(row).toBeDefined();
    expect(row.nama).toContain('SWI');
  });
});

describe('Profit Distribution CRUD', () => {
  let sukukId: number;

  beforeAll(() => {
    // Create a test sukuk for FK reference
    const result = db.prepare(`
      INSERT INTO sukuk (kode, nama, jenis_akad, nilai_sukuk, harga_unit, total_unit, target_unit, tenor_bulan, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('TEST-DIST', 'TEST_Distribution_Sukuk', 'musyarakah', 100000000, 1000000, 100, 100, 12, 'open');
    sukukId = result.lastInsertRowid as number;
  });

  afterAll(() => {
    db.prepare("DELETE FROM profit_distributions WHERE sukuk_id = ?").run(sukukId);
    db.prepare("DELETE FROM sukuk WHERE id = ?").run(sukukId);
  });

  test('insert and sum profit distributions', () => {
    const stmt = db.prepare(`
      INSERT INTO profit_distributions (sukuk_id, periode, revenue, bagi_hasil_total, bagi_investor_total, bagi_swi_total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const d1 = stmt.run(sukukId, '2025-01', 10000000, 5000000, 2125000, 2125000, 'paid');
    const d2 = stmt.run(sukukId, '2025-02', 12000000, 6000000, 2550000, 2550000, 'paid');
    const d3 = stmt.run(sukukId, '2025-03', 8000000, 4000000, 1700000, 1700000, 'projected');

    expect(d1.changes).toBe(1);
    expect(d2.changes).toBe(1);
    expect(d3.changes).toBe(1);

    const total = db.prepare("SELECT SUM(bagi_hasil_total) as total FROM profit_distributions WHERE sukuk_id = ?").get(sukukId) as any;
    expect(total.total).toBe(15000000);

    const paid = db.prepare("SELECT SUM(bagi_hasil_total) as total FROM profit_distributions WHERE sukuk_id = ? AND status = 'paid'").get(sukukId) as any;
    expect(paid.total).toBe(11000000);
  });

  test('nisbah percentages validate against schema defaults', () => {
    const sukuk = db.prepare("SELECT * FROM sukuk WHERE kode = 'SWQ-001'").get() as any;
    expect(sukuk).toBeDefined();
    expect(sukuk.nisbah_investor_pct).toBe(42.5);
    expect(sukuk.nisbah_swi_pct).toBe(42.5);
    expect(sukuk.tim_fee_pct).toBe(10.0);
    expect(sukuk.reserve_pct).toBe(5.0);
    // Sum should be 100%
    const total = sukuk.nisbah_investor_pct + sukuk.nisbah_swi_pct + sukuk.tim_fee_pct + sukuk.reserve_pct;
    expect(total).toBe(100.0);
  });
});

describe('Bagi Hasil Math', () => {
  test('calculate bagi hasil: 12% annual on 100M for 1 month', () => {
    const nilaiSukuk = 100000000;
    const imbalan = 12;
    const months = 1;
    const gross = Math.round((nilaiSukuk * imbalan / 100 / 12) * months);
    expect(gross).toBe(1000000);
  });

  test('calculate bagi hasil: 10% annual on 50M for 6 months', () => {
    const nilaiSukuk = 50000000;
    const imbalan = 10;
    const months = 6;
    const gross = Math.round((nilaiSukuk * imbalan / 100 / 12) * months);
    expect(gross).toBe(2500000);
  });

  test('distribution split across investors proportionally', () => {
    const distributionAmount = 1000000;
    const totalInvestment = 100000000;

    const investorA = 60000000;
    const shareA = Math.round((investorA / totalInvestment) * distributionAmount);
    expect(shareA).toBe(600000);

    const investorB = 40000000;
    const shareB = Math.round((investorB / totalInvestment) * distributionAmount);
    expect(shareB).toBe(400000);

    expect(shareA + shareB).toBe(distributionAmount);
  });

  test('nisbah split: investor 42.5% and SWI 42.5%', () => {
    const bagiHasil = 10000000;
    const investorShare = Math.round(bagiHasil * 0.425);
    const swiShare = Math.round(bagiHasil * 0.425);
    const timFee = Math.round(bagiHasil * 0.10);
    const reserve = Math.round(bagiHasil * 0.05);

    expect(investorShare).toBe(4250000);
    expect(swiShare).toBe(4250000);
    expect(timFee).toBe(1000000);
    expect(reserve).toBe(500000);
    expect(investorShare + swiShare + timFee + reserve).toBe(bagiHasil);
  });
});
