// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from './src/lib/auth';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/api/sukuk', '/api/investors', '/api/finance', '/api/calculate'];
// Routes accessible without auth
const PUBLIC_ROUTES = ['/investor', '/api/auth', '/login', '/_next', '/favicon'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check session
  const token = req.cookies.get('session_token')?.value;
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = getUserFromSession(token);
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', String(user.id));
  requestHeaders.set('x-user-role', user.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
