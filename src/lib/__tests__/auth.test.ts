// Test auth functions directly without Next.js route handlers
// Updated for stateless session + env-based authentication
import { createSession, getUserFromSession, ROLES, hasRole, isPortalConfigured, authenticateUser } from '@/lib/auth';

// Set required env vars for tests
const TEST_SECRET = 'test-secret-key-for-unit-tests-only-min-32-chars!!';
process.env.SESSION_SECRET = TEST_SECRET;

describe('Authentication Logic', () => {
  describe('Session tokens', () => {
    it('createSession returns valid token format', () => {
      const token = createSession(1, 'beriman', 'admin');
      expect(token).toContain('.');
      const [payload, sig] = token.split('.');
      expect(payload.length).toBeGreaterThan(0);
      expect(sig.length).toBeGreaterThan(0);
    });

    it('getUserFromSession validates and decodes token', () => {
      const token = createSession(1, 'beriman', 'admin');
      const user = getUserFromSession(token);
      expect(user).toEqual({ id: 1, username: 'beriman', role: 'admin' });
    });

    it('getUserFromSession rejects tampered tokens', () => {
      const token = createSession(1, 'beriman', 'admin');
      expect(getUserFromSession(token + 'x')).toBeNull();
    });

    it('getUserFromSession rejects malformed tokens', () => {
      expect(getUserFromSession('')).toBeNull();
      expect(getUserFromSession('abc')).toBeNull();
      expect(getUserFromSession('a.b')).toBeNull();
    });
  });

  describe('Role hierarchy', () => {
    it('has correct levels', () => {
      expect(ROLES.admin.level).toBe(4);
      expect(ROLES.staff.level).toBe(3);
      expect(ROLES.auditor.level).toBe(2);
      expect(ROLES.viewer.level).toBe(1);
    });

    it('admin can do everything', () => {
      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('admin', 'staff')).toBe(true);
      expect(hasRole('admin', 'auditor')).toBe(true);
      expect(hasRole('admin', 'viewer')).toBe(true);
    });

    it('staff cannot admin', () => {
      expect(hasRole('staff', 'admin')).toBe(false);
    });

    it('viewer is most restricted', () => {
      expect(hasRole('viewer', 'admin')).toBe(false);
      expect(hasRole('viewer', 'auditor')).toBe(false);
      expect(hasRole('viewer', 'viewer')).toBe(true);
    });

    it('unknown role returns false', () => {
      expect(hasRole('ghost', 'viewer')).toBe(false);
    });
  });

  describe('authenticateUser', () => {
    it('returns user for correct env credentials', () => {
      process.env.INTERNAL_PORTAL_PASSWORD = 'correctpass';
      const user = authenticateUser('beriman', 'correctpass');
      expect(user).not.toBeNull();
      expect(user!.username).toBe('beriman');
      expect(user!.role).toBe('admin');
    });

    it('returns null for wrong password', () => {
      process.env.INTERNAL_PORTAL_PASSWORD = 'correctpass';
      const user = authenticateUser('beriman', 'wrongpass');
      expect(user).toBeNull();
    });

    it('returns null for wrong username', () => {
      process.env.INTERNAL_PORTAL_PASSWORD = 'correctpass';
      const user = authenticateUser('hacker', 'correctpass');
      expect(user).toBeNull();
    });

    it('returns null when password env not set', () => {
      delete process.env.INTERNAL_PORTAL_PASSWORD;
      const user = authenticateUser('beriman', 'anypass');
      expect(user).toBeNull();
    });
  });

  describe('isPortalConfigured', () => {
    it('returns true when both env vars are set', () => {
      process.env.INTERNAL_PORTAL_PASSWORD = 'pass';
      process.env.SESSION_SECRET = TEST_SECRET;
      expect(isPortalConfigured()).toBe(true);
    });

    it('returns false when password is missing', () => {
      delete process.env.INTERNAL_PORTAL_PASSWORD;
      process.env.SESSION_SECRET = TEST_SECRET;
      expect(isPortalConfigured()).toBe(false);
    });

    it('returns false when secret is missing', () => {
      process.env.INTERNAL_PORTAL_PASSWORD = 'pass';
      delete process.env.SESSION_SECRET;
      expect(isPortalConfigured()).toBe(false);
    });
  });
});
