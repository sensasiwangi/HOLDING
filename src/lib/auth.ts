// lib/auth.ts — stateless portal authentication for serverless deployments
import crypto from 'crypto';

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const DEFAULT_PORTAL_USERNAME = 'beriman';

export interface SessionUser {
  id: number;
  username: string;
  role: string;
}

interface SessionPayload extends SessionUser {
  exp: number;
}

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  return secret;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(encodedPayload: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(encodedPayload).digest('base64url');
}

export function isPortalConfigured(): boolean {
  return Boolean(process.env.INTERNAL_PORTAL_PASSWORD && process.env.SESSION_SECRET);
}

export function createSession(userId: number, username: string, role: string): string {
  const payload: SessionPayload = {
    id: userId,
    username,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function getUserFromSession(token: string): SessionUser | null {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;
    if (!safeEqual(sign(encodedPayload), signature)) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.id || !payload.username || !payload.role || !payload.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

    return { id: payload.id, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

// Stateless sessions are invalidated client-side by deleting the cookie.
export function destroySession(_token: string): void {}

export function authenticateUser(username: string, password: string): SessionUser | null {
  const expectedUsername = process.env.INTERNAL_PORTAL_USERNAME || DEFAULT_PORTAL_USERNAME;
  const expectedPassword = process.env.INTERNAL_PORTAL_PASSWORD;
  if (!expectedPassword || !process.env.SESSION_SECRET) return null;

  if (!safeEqual(username, expectedUsername)) return null;
  if (!safeEqual(password, expectedPassword)) return null;

  return { id: 1, username: expectedUsername, role: 'admin' };
}

export const ROLES: Record<string, { level: number; label: string }> = {
  admin: { level: 4, label: 'Admin' },
  staff: { level: 3, label: 'Staff' },
  auditor: { level: 2, label: 'Auditor' },
  viewer: { level: 1, label: 'Viewer' },
};

export function hasRole(userRole: string, required: string): boolean {
  return (ROLES[userRole]?.level ?? 0) >= (ROLES[required]?.level ?? 99);
}
