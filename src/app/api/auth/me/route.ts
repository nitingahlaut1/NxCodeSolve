import { NextResponse } from 'next/server';
import { getCurrentUser, authenticateGuest } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    // If no user session, auto-fallback or return null
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await updateUserProfile(user.id, {
      displayName: body.displayName,
      avatar: body.avatar,
      dailyGoal: body.dailyGoal,
      targetDate: body.targetDate
    });

    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
