// Test auth functions directly without Next.js route handlers
import { hashPassword, verifyPassword, ROLES, hasRole } from '@/lib/auth';

describe('Authentication Logic', () => {
  describe('hashPassword', () => {
    it('returns salt$hash format', () => {
      const result = hashPassword('test123');
      expect(result).toContain('$');
      const [salt, hash] = result.split('$');
      expect(salt.length).toBe(64);
      expect(hash.length).toBe(128);
    });

    it('produces different hashes for same password', () => {
      expect(hashPassword('same')).not.toBe(hashPassword('same'));
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', () => {
      expect(verifyPassword('correct', hashPassword('correct'))).toBe(true);
    });

    it('returns false for wrong password', () => {
      expect(verifyPassword('wrong', hashPassword('correct'))).toBe(false);
    });

    it('returns false for malformed hash', () => {
      expect(verifyPassword('test', 'nodelimiter')).toBe(false);
      expect(verifyPassword('test', '')).toBe(false);
    });
  });

  describe('Role hierarchy', () => {
    it('has correct levels', () => {
      expect(ROLES.admin.level).toBe(3);
      expect(ROLES.analyst.level).toBe(2);
      expect(ROLES.viewer.level).toBe(1);
    });

    it('admin can do everything', () => {
      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('admin', 'analyst')).toBe(true);
      expect(hasRole('admin', 'viewer')).toBe(true);
    });

    it('analyst cannot admin', () => {
      expect(hasRole('analyst', 'admin')).toBe(false);
    });

    it('viewer is most restricted', () => {
      expect(hasRole('viewer', 'admin')).toBe(false);
      expect(hasRole('viewer', 'analyst')).toBe(false);
      expect(hasRole('viewer', 'viewer')).toBe(true);
    });

    it('unknown role returns false', () => {
      expect(hasRole('ghost', 'viewer')).toBe(false);
    });
  });
});
