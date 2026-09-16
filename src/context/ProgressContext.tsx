'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ProblemStatus, UserProgressMap, StatsSummary, ProblemProgress } from '@/types';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface ProgressContextType {
  progress: UserProgressMap;
  stats: StatsSummary | null;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (d: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  stepFilter: string;
  setStepFilter: (s: string) => void;
  viewMode: 'accordion' | 'table' | 'cards';
  setViewMode: (v: 'accordion' | 'table' | 'cards') => void;
  updateStatus: (problemId: number, status: ProblemStatus) => Promise<void>;
  updateProblemDetails: (problemId: number, details: Partial<ProblemProgress>) => Promise<void>;
  toggleProblemBookmark: (problemId: number) => Promise<void>;
  batchUpdate: (problemIds: number[], status: ProblemStatus) => Promise<void>;
  resetAll: () => Promise<void>;
  refresh: () => Promise<void>;
  exportProgress: () => void;
  importProgress: (file: File) => Promise<boolean>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgressMap>({});
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stepFilter, setStepFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'accordion' | 'table' | 'cards'>('accordion');

  const fetchProgressAndStats = useCallback(async () => {
    try {
      setLoading(true);
      const [progRes, statsRes] = await Promise.all([
        fetch('/api/progress'),
        fetch('/api/stats')
      ]);

      if (progRes.ok) {
        const progData = await progRes.json();
        setProgress(progData.progress || {});
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || null);
      }
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgressAndStats();
  }, [user, fetchProgressAndStats]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const updateStatus = async (problemId: number, status: ProblemStatus) => {
    // Optimistic UI update
    const previous = progress[problemId];
    const isNowComplete = status === 'completed';
    const wasComplete = previous?.status === 'completed';

    setProgress(prev => ({
      ...prev,
      [problemId]: {
        ...(prev[problemId] || { bookmarked: false, updatedAt: new Date().toISOString() }),
        status,
        updatedAt: new Date().toISOString(),
        completedAt: isNowComplete ? (prev[problemId]?.completedAt || new Date().toISOString().split('T')[0]) : undefined
      }
    }));

    if (isNowComplete && !wasComplete) {
      triggerCelebration();
    }

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, status })
      });
      if (res.ok) {
        // Refresh stats silently
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Update status error', err);
      // Revert if error
      if (previous) {
        setProgress(prev => ({ ...prev, [problemId]: previous }));
      }
    }
  };

  const updateProblemDetails = async (problemId: number, details: Partial<ProblemProgress>) => {
    setProgress(prev => ({
      ...prev,
      [problemId]: {
        ...(prev[problemId] || { status: 'todo', bookmarked: false, updatedAt: new Date().toISOString() }),
        ...details,
        updatedAt: new Date().toISOString()
      }
    }));

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, ...details })
      });
      if (res.ok) {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Update details error', err);
    }
  };

  const toggleProblemBookmark = async (problemId: number) => {
    const existing = progress[problemId]?.bookmarked || false;
    setProgress(prev => ({
      ...prev,
      [problemId]: {
        ...(prev[problemId] || { status: 'todo', updatedAt: new Date().toISOString() }),
        bookmarked: !existing,
        updatedAt: new Date().toISOString()
      }
    }));

    try {
      const res = await fetch('/api/progress/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId })
      });
      if (res.ok) {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Toggle bookmark error', err);
    }
  };

  const batchUpdate = async (problemIds: number[], status: ProblemStatus) => {
    try {
      const res = await fetch('/api/progress/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemIds, status })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        if (status === 'completed') {
          triggerCelebration();
        }
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Batch update error', err);
    }
  };

  const resetAll = async () => {
    try {
      const res = await fetch('/api/progress/reset', { method: 'POST' });
      if (res.ok) {
        setProgress({});
        fetchProgressAndStats();
      }
    } catch (err) {
      console.error('Reset error', err);
    }
  };

  const exportProgress = () => {
    window.open('/api/progress/export', '_blank');
  };

  const importProgress = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/progress/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });
      if (res.ok) {
        await fetchProgressAndStats();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        stats,
        loading,
        searchQuery,
        setSearchQuery,
        difficultyFilter,
        setDifficultyFilter,
        statusFilter,
        setStatusFilter,
        stepFilter,
        setStepFilter,
        viewMode,
        setViewMode,
        updateStatus,
        updateProblemDetails,
        toggleProblemBookmark,
        batchUpdate,
        resetAll,
        refresh: fetchProgressAndStats,
        exportProgress,
        importProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
