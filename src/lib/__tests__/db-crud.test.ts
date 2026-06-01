// src/lib/__tests__/db-crud.test.ts
import { db } from '@/lib/db';

const ts = Date.now();

describe('Database CRUD Operations', () => {
  describe('Investors table', () => {
    it('insert + read + update + delete', () => {
      const r = db.prepare(`
        INSERT INTO investors (no, nama, jenis, ktp, npwp, phone, email, bank, rekening_number, rekening_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(ts, 'CRUD Test', 'Perorangan', `${ts}0000000000`, `${ts}.000.000.0-000.000`, '081111111111', `crud${ts}@test.com`, 'BCA', '1111111111', 'CRUD Test');
      expect(r.lastInsertRowid).toBeGreaterThan(0);

      const row = db.prepare('SELECT * FROM investors WHERE email = ?').get(`crud${ts}@test.com`) as any;
      expect(row.nama).toBe('CRUD Test');

      const u = db.prepare('UPDATE investors SET kyc_verified = 1 WHERE email = ?').run(`crud${ts}@test.com`);
      expect(u.changes).toBe(1);

      const d = db.prepare('DELETE FROM investors WHERE email = ?').run(`crud${ts}@test.com`);
      expect(d.changes).toBe(1);
    });
  });

  describe('Sukuk table', () => {
    it('insert + read + update + delete lifecycle', () => {
      const r = db.prepare(`
        INSERT INTO sukuk (nama, kode, nilai_sukuk, harga_unit, total_unit, unit_terjual, target_unit,
                           nisbah_investor_pct, nisbah_swi_pct, tim_fee_pct, reserve_pct, tenor_bulan, jenis_akad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run('Sukuk CRUD', `SKT-${ts}`, 500000000, 1000000, 500, 0, 500, 60, 30, 5, 5, 24, 'ijarah');
      expect(r.lastInsertRowid).toBeGreaterThan(0);
      const sukukId = r.lastInsertRowid as number;

      const row = db.prepare('SELECT * FROM sukuk WHERE id = ?').get(sukukId) as any;
      expect(row.nilai_sukuk).toBe(500000000);

      const u = db.prepare('UPDATE sukuk SET unit_terjual = 10 WHERE id = ?').run(sukukId);
      expect(u.changes).toBe(1);

      const d = db.prepare('DELETE FROM sukuk WHERE id = ?').run(sukukId);
      expect(d.changes).toBe(1);
    });
  });

  describe('Views', () => {
    it('v_investor_summary works', () => {
      const rows = db.prepare('SELECT * FROM v_investor_summary LIMIT 5').all();
      expect(Array.isArray(rows)).toBe(true);
    });

    it('v_sukuk_progress works', () => {
      const rows = db.prepare('SELECT * FROM v_sukuk_progress LIMIT 5').all();
      expect(Array.isArray(rows)).toBe(true);
    });
  });

  describe('Triggers', () => {
    it('has 3 updated_at triggers', () => {
      const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE 'trg_%_updated'").all() as any[];
      expect(triggers.length).toBe(3);
    });
  });
});
