// src/lib/__tests__/investors-api.test.ts
/**
 * Test the investor CRUD operations directly via database layer.
 */
import { db } from '@/lib/db';

describe('Investor CRUD Operations', () => {
  let testId: number;

  beforeAll(() => {
    db.prepare("DELETE FROM investors WHERE nama LIKE 'TEST_%'").run();
  });

  afterAll(() => {
    db.prepare("DELETE FROM investors WHERE nama LIKE 'TEST_%'").run();
  });

  test('insert a new investor', () => {
    const result = db.prepare(`
      INSERT INTO investors (no, nama, jenis, ktp, npwp, phone, email, bank, rekening_number, rekening_name, alamat, status, kyc_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(99901, 'TEST_Investor1', 'Perorangan', '1234567890123456', '987654321012345', '081234567890', 'test1@example.com', 'BCA', '1234567890', 'Test Investor', 'Jl. Test 1', 'aktif', 0);

    expect(result.changes).toBe(1);
    expect(typeof result.lastInsertRowid).toBe('number');
    testId = result.lastInsertRowid as number;
  });

  test('read investor by id', () => {
    const row = db.prepare('SELECT * FROM investors WHERE id = ?').get(testId) as any;
    expect(row).toBeDefined();
    expect(row.nama).toBe('TEST_Investor1');
    expect(row.email).toBe('test1@example.com');
    expect(row.no).toBe(99901);
    expect(row.phone).toBe('081234567890');
    expect(row.status).toBe('aktif');
  });

  test('update investor', () => {
    const result = db.prepare(`
      UPDATE investors SET nama = ?, email = ?, kyc_verified = ? WHERE id = ?
    `).run('TEST_Investor1_Updated', 'updated@example.com', 1, testId);

    expect(result.changes).toBe(1);

    const row = db.prepare('SELECT * FROM investors WHERE id = ?').get(testId) as any;
    expect(row.nama).toBe('TEST_Investor1_Updated');
    expect(row.kyc_verified).toBe(1);
    expect(row.kyc_verified_at).toBeTruthy;
  });

  test('list all test investors', () => {
    const rows = db.prepare("SELECT * FROM investors WHERE nama LIKE 'TEST_%'").all() as any[];
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  test('delete investor', () => {
    const result = db.prepare('DELETE FROM investors WHERE id = ?').run(testId);
    expect(result.changes).toBe(1);

    const row = db.prepare('SELECT * FROM investors WHERE id = ?').get(testId);
    expect(row).toBeUndefined();
  });
});
