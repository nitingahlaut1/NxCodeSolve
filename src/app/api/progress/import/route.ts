import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { importUserProgress } from '@/lib/db';
import { UserProgressMap } from '@/types';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';

  try {
    const data = await req.json();
    const progressMap: UserProgressMap = data.progress || data;

    if (!progressMap || typeof progressMap !== 'object') {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    await importUserProgress(userId, progressMap);
    return NextResponse.json({ success: true, message: 'Progress imported successfully' });
  } catch (err) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Failed to import progress' }, { status: 500 });
  }
}
