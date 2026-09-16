import fs from 'fs';
import path from 'path';
import { ProblemProgress, UserProgressMap, UserProfile, StatsSummary } from '@/types';
import dsaQuestions from '@/data/dsaQuestions.json';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'codesolve_db.json');

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  avatar: string;
  createdAt: string;
  dailyGoal: number;
  targetDate?: string;
}

export interface DbSchema {
  users: UserRecord[];
  progress: { [userId: string]: UserProgressMap };
  activity: { [userId: string]: { [date: string]: number } }; // date -> count of solved
}

// In-memory cached DB
let inMemoryDb: DbSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ensureDbExists(): DbSchema {
  if (inMemoryDb) return inMemoryDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(content);
      return inMemoryDb!;
    } catch (e) {
      console.error('Failed to parse codesolve_db.json, recreating fresh schema', e);
    }
  }

  // Initialize fresh DB with Guest demo user
  const initialDb: DbSchema = {
    users: [
      {
        id: 'guest_demo_user',
        email: 'guest@codesolve.dev',
        passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // demo
        salt: 'demo_salt_codesolve',
        displayName: 'DSA Explorer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        dailyGoal: 3,
        targetDate: '2026-12-31'
      }
    ],
    progress: {
      guest_demo_user: {
        1: { status: 'completed', bookmarked: false, updatedAt: new Date().toISOString(), completedAt: getTodayString() },
        2: { status: 'completed', bookmarked: true, notes: 'Handled negative values and 32-bit overflow check using INT_MAX/10.', updatedAt: new Date().toISOString(), completedAt: getTodayString() },
        3: { status: 'completed', bookmarked: false, updatedAt: new Date().toISOString(), completedAt: getTodayString() },
        4: { status: 'in_progress', bookmarked: false, updatedAt: new Date().toISOString() },
        8: { status: 'completed', bookmarked: false, updatedAt: new Date().toISOString(), completedAt: getTodayString() },
        9: { status: 'completed', bookmarked: false, updatedAt: new Date().toISOString(), completedAt: getTodayString() },
        15: { status: 'revision', bookmarked: true, notes: 'Review selection sort vs bubble sort space complexity.', updatedAt: new Date().toISOString() }
      }
    },
    activity: {
      guest_demo_user: {
        [getTodayString()]: 5
      }
    }
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  inMemoryDb = initialDb;
  return inMemoryDb;
}

async function persistDb(): Promise<void> {
  const dbToSave = inMemoryDb;
  if (!dbToSave) return;

  writeQueue = writeQueue.then(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempPath, JSON.stringify(dbToSave, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error persisting db to file:', err);
    }
  });

  return writeQueue;
}

// User Operations
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = ensureDbExists();
  const normalized = email.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === normalized);
  return user || null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = ensureDbExists();
  const user = db.users.find(u => u.id === id);
  return user || null;
}

export async function createUser(user: UserRecord): Promise<UserRecord> {
  const db = ensureDbExists();
  db.users.push(user);
  if (!db.progress[user.id]) {
    db.progress[user.id] = {};
  }
  if (!db.activity[user.id]) {
    db.activity[user.id] = {};
  }
  await persistDb();
  return user;
}

export async function updateUserProfile(id: string, updates: Partial<Pick<UserRecord, 'displayName' | 'avatar' | 'dailyGoal' | 'targetDate'>>): Promise<UserRecord | null> {
  const db = ensureDbExists();
  const user = db.users.find(u => u.id === id);
  if (!user) return null;

  Object.assign(user, updates);
  await persistDb();
  return user;
}

// Progress Operations
export function getUserProgress(userId: string): UserProgressMap {
  const db = ensureDbExists();
  return db.progress[userId] || {};
}

export async function updateProblemProgress(
  userId: string,
  problemId: number,
  updates: Partial<ProblemProgress>
): Promise<ProblemProgress> {
  const db = ensureDbExists();
  if (!db.progress[userId]) {
    db.progress[userId] = {};
  }
  if (!db.activity[userId]) {
    db.activity[userId] = {};
  }

  const existing = db.progress[userId][problemId] || {
    status: 'todo',
    bookmarked: false,
    updatedAt: new Date().toISOString()
  };

  const wasCompleted = existing.status === 'completed';
  const isNowCompleted = updates.status === 'completed';
  const today = getTodayString();

  const updated: ProblemProgress = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
    completedAt: isNowCompleted ? (existing.completedAt || today) : (updates.status ? undefined : existing.completedAt)
  };

  db.progress[userId][problemId] = updated;

  // Track activity count
  if (!wasCompleted && isNowCompleted) {
    db.activity[userId][today] = (db.activity[userId][today] || 0) + 1;
  } else if (wasCompleted && updates.status && updates.status !== 'completed') {
    if (db.activity[userId][today] && db.activity[userId][today] > 0) {
      db.activity[userId][today] -= 1;
    }
  }

  await persistDb();
  return updated;
}

export async function batchUpdateProgress(
  userId: string,
  problemIds: number[],
  status: ProblemProgress['status']
): Promise<UserProgressMap> {
  const db = ensureDbExists();
  if (!db.progress[userId]) {
    db.progress[userId] = {};
  }
  if (!db.activity[userId]) {
    db.activity[userId] = {};
  }

  const today = getTodayString();
  let newlyCompleted = 0;

  for (const id of problemIds) {
    const existing = db.progress[userId][id] || {
      status: 'todo',
      bookmarked: false,
      updatedAt: new Date().toISOString()
    };
    if (existing.status !== 'completed' && status === 'completed') {
      newlyCompleted++;
    }
    db.progress[userId][id] = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
      completedAt: status === 'completed' ? today : undefined
    };
  }

  if (newlyCompleted > 0) {
    db.activity[userId][today] = (db.activity[userId][today] || 0) + newlyCompleted;
  }

  await persistDb();
  return db.progress[userId];
}

export async function toggleBookmark(userId: string, problemId: number): Promise<boolean> {
  const db = ensureDbExists();
  if (!db.progress[userId]) {
    db.progress[userId] = {};
  }
  const existing = db.progress[userId][problemId] || {
    status: 'todo',
    bookmarked: false,
    updatedAt: new Date().toISOString()
  };
  const newBookmarked = !existing.bookmarked;
  db.progress[userId][problemId] = {
    ...existing,
    bookmarked: newBookmarked,
    updatedAt: new Date().toISOString()
  };
  await persistDb();
  return newBookmarked;
}

export async function resetProgress(userId: string): Promise<void> {
  const db = ensureDbExists();
  db.progress[userId] = {};
  db.activity[userId] = {};
  await persistDb();
}

export async function importUserProgress(userId: string, progressData: UserProgressMap): Promise<void> {
  const db = ensureDbExists();
  db.progress[userId] = { ...progressData };
  await persistDb();
}

// Stats & Calculations
export function calculateStreak(activityMap: { [date: string]: number } = {}): { currentStreak: number; longestStreak: number } {
  const dates = Object.keys(activityMap)
    .filter(d => (activityMap[d] || 0) > 0)
    .sort();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(dates);
  let longestStreak = 0;
  let currentRun = 0;

  // Compute longest streak
  const sortedDateObjs = dates.map(d => new Date(d));
  for (let i = 0; i < sortedDateObjs.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const prev = sortedDateObjs[i - 1];
      const curr = sortedDateObjs[i];
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentRun);
  }

  // Compute current streak from today/yesterday backwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = new Date(today);
  let currentStreak = 0;

  const todayStr = getTodayString();
  const hasToday = (activityMap[todayStr] || 0) > 0;

  if (!hasToday) {
    // Check if streak was active yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;

    if ((activityMap[dStr] || 0) > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak)
  };
}

export function getUserStats(userId: string): StatsSummary {
  const db = ensureDbExists();
  const progress = db.progress[userId] || {};
  const user = db.users.find(u => u.id === userId);
  const activityMap = db.activity[userId] || {};

  const totalQuestions = dsaQuestions.length;
  let completedQuestions = 0;
  let inProgressQuestions = 0;
  let revisionQuestions = 0;
  let bookmarkedQuestions = 0;

  const byDifficulty = {
    Easy: { total: 0, completed: 0 },
    Medium: { total: 0, completed: 0 },
    Hard: { total: 0, completed: 0 }
  };

  for (const q of dsaQuestions) {
    const diff = q.difficulty as 'Easy' | 'Medium' | 'Hard';
    if (byDifficulty[diff]) {
      byDifficulty[diff].total++;
    }

    const p = progress[q.id];
    if (p) {
      if (p.status === 'completed') {
        completedQuestions++;
        if (byDifficulty[diff]) {
          byDifficulty[diff].completed++;
        }
      } else if (p.status === 'in_progress') {
        inProgressQuestions++;
      } else if (p.status === 'revision') {
        revisionQuestions++;
      }

      if (p.bookmarked) {
        bookmarkedQuestions++;
      }
    }
  }

  const completionPercentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 1000) / 10 : 0;
  const streak = calculateStreak(activityMap);
  const todayStr = getTodayString();
  const solvedToday = activityMap[todayStr] || 0;

  // Build 90-day activity heatmap list
  const heatmap: { date: string; count: number }[] = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - 90);

  for (let i = 0; i <= 90; i++) {
    const curr = new Date(startDay);
    curr.setDate(curr.getDate() + i);
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    heatmap.push({
      date: dateStr,
      count: activityMap[dateStr] || 0
    });
  }

  return {
    totalQuestions,
    completedQuestions,
    inProgressQuestions,
    revisionQuestions,
    bookmarkedQuestions,
    completionPercentage,
    byDifficulty,
    streak,
    dailyGoal: user?.dailyGoal || 3,
    solvedToday,
    activityHeatmap: heatmap
  };
}
