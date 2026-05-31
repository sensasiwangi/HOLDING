import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('session_token')?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  const user = getUserFromSession(token);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
