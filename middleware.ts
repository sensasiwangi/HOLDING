// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/api/sukuk', '/api/investors', '/api/finance', '/api/calculate'];
const PUBLIC_ROUTES = ['/investor', '/api/auth', '/login', '/_next', '/favicon'];
const AUTH_ENABLED = process.env.ENABLE_PORTAL_AUTH === 'true';

interface SessionPayload {
  id: number;
  username: string;
  role: string;
  exp: number;
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(encodedPayload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedPayload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

async function readSession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = await sign(encodedPayload, secret);
    if (!safeEqual(expectedSignature, signature)) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as SessionPayload;
    if (!payload.id || !payload.username || !payload.role || !payload.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function withUserHeaders(req: NextRequest, user: { id: number; role: string }) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', String(user.id));
  requestHeaders.set('x-user-role', user.role);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function unauthorized(req: NextRequest, message: string) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Temporary development mode: open the internal portal without login.
  // Set ENABLE_PORTAL_AUTH=true in Vercel when the portal is ready to publish.
  if (!AUTH_ENABLED) {
    return withUserHeaders(req, { id: 1, role: 'admin' });
  }

  const token = req.cookies.get('session_token')?.value;
  if (!token) return unauthorized(req, 'Unauthorized');

  const user = await readSession(token);
  if (!user) return unauthorized(req, 'Session expired');

  return withUserHeaders(req, user);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
