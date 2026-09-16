import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserStats } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';
  const stats = getUserStats(userId);
  return NextResponse.json({ stats });
}
