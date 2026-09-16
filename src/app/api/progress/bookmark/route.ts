import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleBookmark } from '@/lib/db';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';

  try {
    const { problemId } = await req.json();
    if (!problemId) {
      return NextResponse.json({ error: 'problemId is required' }, { status: 400 });
    }

    const isBookmarked = await toggleBookmark(userId, Number(problemId));
    return NextResponse.json({ success: true, bookmarked: isBookmarked });
  } catch {
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
