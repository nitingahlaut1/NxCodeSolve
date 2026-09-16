import { NextResponse } from 'next/server';
import { authenticateGuest } from '@/lib/auth';

export async function POST() {
  try {
    const user = await authenticateGuest();
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Guest auth error:', err);
    return NextResponse.json({ error: 'Failed to authenticate as guest' }, { status: 500 });
  }
}
