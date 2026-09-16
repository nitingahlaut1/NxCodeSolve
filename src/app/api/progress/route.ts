import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserProgress, updateProblemProgress } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';
  const progress = getUserProgress(userId);
  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';

  try {
    const { problemId, status, bookmarked, notes, code, language } = await req.json();

    if (!problemId) {
      return NextResponse.json({ error: 'problemId is required' }, { status: 400 });
    }

    const updated = await updateProblemProgress(userId, Number(problemId), {
      status,
      bookmarked,
      notes,
      code,
      language
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('Progress update error:', err);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
