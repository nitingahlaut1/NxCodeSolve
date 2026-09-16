import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { resetProgress } from '@/lib/db';

export async function POST() {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';

  try {
    await resetProgress(userId);
    return NextResponse.json({ success: true, message: 'Progress has been reset' });
  } catch {
    return NextResponse.json({ error: 'Failed to reset progress' }, { status: 500 });
  }
}
