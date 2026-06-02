import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession, isPortalConfigured } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!isPortalConfigured()) {
      return NextResponse.json(
        { error: 'Portal internal belum dikonfigurasi. Hubungi administrator.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const user = authenticateUser(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = createSession(user.id, user.username, user.role);
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
