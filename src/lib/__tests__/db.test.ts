// src/lib/__tests__/db.test.ts
import { db } from '../db';

describe('Database', () => {
  it('should export db instance', () => {
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe('function');
    expect(typeof db.exec).toBe('function');
  });

  it('should have correct pragmas', () => {
    const mode = db.pragma('journal_mode', { simple: true });
    expect(mode).toBe('wal');
    const fk = db.pragma('foreign_keys', { simple: true });
    expect(fk).toBe(1);
  });

  it('should query existing tables', () => {
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];
    const names = tables.map(t => t.name);
    expect(names).toContain('investors');
    expect(names).toContain('sukuk');
    expect(names).toContain('users');
    expect(names).toContain('sessions');
  });
});
