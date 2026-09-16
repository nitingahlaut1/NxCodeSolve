import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserByEmail, createUser } from '@/lib/db';
import { hashPassword, setAuthCookie, sanitizeUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const { hash, salt } = hashPassword(password);
    const id = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const name = displayName?.trim() || email.split('@')[0];
    
    // Pick an avatar
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const user = await createUser({
      id,
      email,
      passwordHash: hash,
      salt,
      displayName: name,
      avatar: randomAvatar,
      createdAt: new Date().toISOString(),
      dailyGoal: 3
    });

    await setAuthCookie(user.id);

    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch (err: unknown) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
