import crypto from 'crypto';
import { cookies } from 'next/headers';
import { findUserByEmail, findUserById, createUser, UserRecord } from './db';
import { UserProfile } from '@/types';

const SESSION_COOKIE_NAME = 'codesolve_session';
const SECRET_KEY = process.env.AUTH_SECRET || 'codesolve-super-secret-production-key-dsa-sheet-2026';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
}

export function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = JSON.stringify({ userId, expiresAt });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(base64Payload).digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(base64Payload).digest('base64url');
    if (signature !== expectedSignature) return null;

    const payloadStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function sanitizeUser(user: UserRecord): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    createdAt: user.createdAt,
    dailyGoal: user.dailyGoal || 3,
    targetDate: user.targetDate
  };
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const verified = verifySessionToken(token);
  if (!verified) {
    return null;
  }

  const user = await findUserById(verified.userId);
  if (!user) return null;

  return sanitizeUser(user);
}

export async function setAuthCookie(userId: string) {
  const token = createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function authenticateGuest(): Promise<UserProfile> {
  let guest = await findUserById('guest_demo_user');
  if (!guest) {
    const { hash, salt } = hashPassword('demo123');
    guest = await createUser({
      id: 'guest_demo_user',
      email: 'guest@codesolve.dev',
      passwordHash: hash,
      salt: salt,
      displayName: 'DSA Explorer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      dailyGoal: 3,
      targetDate: '2026-12-31'
    });
  }

  await setAuthCookie(guest.id);
  return sanitizeUser(guest);
}
