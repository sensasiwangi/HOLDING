// src/lib/__tests__/hash.test.ts
import { hashPassword, verifyPassword } from '@/lib/auth';

describe('Password Hashing', () => {
  test('hashPassword returns salt$hash format', () => {
    const hash = hashPassword('testpassword');
    expect(hash).toMatch(/^[a-f0-9]+\$[a-f0-9]+$/);
    const parts = hash.split('$');
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  test('hashPassword produces different hashes for same password (different salts)', () => {
    const hash1 = hashPassword('samepassword');
    const hash2 = hashPassword('samepassword');
    expect(hash1).not.toBe(hash2);
  });

  test('verifyPassword returns true for correct password', () => {
    const hash = hashPassword('mypassword123');
    expect(verifyPassword('mypassword123', hash)).toBe(true);
  });

  test('verifyPassword returns false for wrong password', () => {
    const hash = hashPassword('mypassword123');
    expect(verifyPassword('wrongpassword', hash)).toBe(false);
  });

  test('verifyPassword returns false for malformed hash', () => {
    expect(verifyPassword('any', 'nodelimiterhere')).toBe(false);
    expect(verifyPassword('any', '')).toBe(false);
    expect(verifyPassword('any', 'salt$')).toBe(false); // empty hash after $
  });

  test('verifyPassword is case-sensitive', () => {
    const hash = hashPassword('Secret');
    expect(verifyPassword('secret', hash)).toBe(false);
    expect(verifyPassword('Secret', hash)).toBe(true);
  });
});
