import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserProgress } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  const userId = user ? user.id : 'guest_demo_user';
  const progress = getUserProgress(userId);

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    user: user ? { email: user.email, displayName: user.displayName } : { email: 'guest@codesolve.dev' },
    progress
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="codesolve_dsa_backup_${Date.now()}.json"`
    }
  });
}
