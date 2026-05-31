// lib/auth.ts — Authentication library
import { db } from './db';
import crypto from 'crypto';

const SALT_LENGTH = 32;
const HASH_LENGTH = 64;
const ITERATIONS = 100_000;
const DIGEST = 'sha512';
const SESSION_TTL_HOURS = 24;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, HASH_LENGTH, DIGEST).toString('hex');
  return `${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const testHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, HASH_LENGTH, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

export function createSession(userId: number): string {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  return token;
}

export function getUserFromSession(token: string): { id: number; username: string; role: string } | null {
  const row = db.prepare(`
    SELECT s.user_id AS id, u.username, u.role, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?
  `).get(token) as any;
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return { id: row.id, username: row.username, role: row.role };
}

export function destroySession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function authenticateUser(username: string, password: string): { id: number; username: string; role: string } | null {
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username) as any;
  if (!user) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, username: user.username, role: user.role };
}

export function registerUser(username: string, password: string, role: string = 'viewer'): { id: number } | { error: string } {
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) return { error: 'Username sudah digunakan' };
  const hash = hashPassword(password);
  const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role);
  return { id: result.lastInsertRowid as number };
}

export const ROLES: Record<string, { level: number; label: string }> = {
  admin: { level: 3, label: 'Admin' },
  analyst: { level: 2, label: 'Analyst' },
  viewer: { level: 1, label: 'Viewer' },
};

export function hasRole(userRole: string, required: string): boolean {
  return (ROLES[userRole]?.level ?? 0) >= (ROLES[required]?.level ?? 99);
}
