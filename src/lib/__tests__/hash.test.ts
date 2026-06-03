// src/lib/__tests__/hash.test.ts
// Tests for stateless session token (replaces old PBKDF2 hash tests)
import { createSession, getUserFromSession } from '@/lib/auth';

// SESSION_SECRET must be set for these tests
const TEST_SECRET = 'test-secret-key-for-unit-tests-only-min-32-chars!!';
process.env.SESSION_SECRET = TEST_SECRET;

describe('Session Token', () => {
  test('createSession returns token with dot separator', () => {
    const token = createSession(1, 'admin', 'admin');
    expect(token).toContain('.');
    const parts = token.split('.');
    expect(parts).toHaveLength(2);
  });

  test('createSession payload contains correct user data', () => {
    const token = createSession(1, 'admin', 'admin');
    const [encodedPayload] = token.split('.');
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    expect(payload.id).toBe(1);
    expect(payload.username).toBe('admin');
    expect(payload.role).toBe('admin');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('getUserFromSession returns valid user for correct token', () => {
    const token = createSession(1, 'beriman', 'admin');
    const user = getUserFromSession(token);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(1);
    expect(user!.username).toBe('beriman');
    expect(user!.role).toBe('admin');
  });

  test('getUserFromSession returns null for tampered token', () => {
    const token = createSession(1, 'beriman', 'admin');
    const tampered = token.slice(0, -5) + 'XXXXX';
    const user = getUserFromSession(tampered);
    expect(user).toBeNull();
  });

  test('getUserFromSession returns null for malformed token', () => {
    expect(getUserFromSession('')).toBeNull();
    expect(getUserFromSession('nodots')).toBeNull();
    expect(getUserFromSession('payload.')).toBeNull();
    expect(getUserFromSession('.signature')).toBeNull();
  });

  test('getUserFromSession returns null for completely invalid token', () => {
    expect(getUserFromSession('a.b')).toBeNull();
    expect(getUserFromSession('not-base64.sig')).toBeNull();
  });
});
