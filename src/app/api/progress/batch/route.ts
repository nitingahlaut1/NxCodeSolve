import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { batchUpdateProgress } from '@/lib/db';
import { ProblemStatus } from '@/types';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';

  try {
    const { problemIds, status } = await req.json();

    if (!Array.isArray(problemIds) || !status) {
      return NextResponse.json({ error: 'problemIds (array) and status are required' }, { status: 400 });
    }

    const updatedMap = await batchUpdateProgress(userId, problemIds.map(Number), status as ProblemStatus);

    return NextResponse.json({ success: true, progress: updatedMap });
  } catch (err) {
    console.error('Batch update error:', err);
    return NextResponse.json({ error: 'Failed to batch update progress' }, { status: 500 });
  }
}
