'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { CheckCircle2, Bookmark, Clock, Trophy, Target, Sparkles } from 'lucide-react';

export default function ProgressDashboard() {
  const { stats, loading } = useProgress();

  if (loading && !stats) {
    return (
      <div className="dashboard-skeleton glass-panel">
        <div className="skeleton-bar" />
      </div>
    );
  }

  const total = stats?.totalQuestions || 476;
  const completed = stats?.completedQuestions || 0;
  const percentage = stats?.completionPercentage || 0;
  const inProgress = stats?.inProgressQuestions || 0;
  const revision = stats?.revisionQuestions || 0;
  const bookmarked = stats?.bookmarkedQuestions || 0;
  const solvedToday = stats?.solvedToday || 0;
  const dailyGoal = stats?.dailyGoal || 3;

  const easy = stats?.byDifficulty.Easy || { total: 143, completed: 0 };
  const medium = stats?.byDifficulty.Medium || { total: 271, completed: 0 };
  const hard = stats?.byDifficulty.Hard || { total: 61, completed: 0 };

  const easyPct = easy.total > 0 ? Math.round((easy.completed / easy.total) * 100) : 0;
  const medPct = medium.total > 0 ? Math.round((medium.completed / medium.total) * 100) : 0;
  const hardPct = hard.total > 0 ? Math.round((hard.completed / hard.total) * 100) : 0;

  // Estimated days remaining based on daily goal
  const remainingProblems = Math.max(0, total - completed);
  const estimatedDays = Math.ceil(remainingProblems / Math.max(1, dailyGoal));

  return (
    <div className="dashboard-root">
      {/* Top Banner with Main Progress */}
      <div className="master-progress-card glass-panel glow-box">
        <div className="master-progress-header">
          <div className="header-info">
            <div className="badge-row">
              <span className="live-badge">
                <Sparkles size={13} />
                <span>DSA Roadmap</span>
              </span>
              <span className="pct-pill">{percentage}% Completed</span>
            </div>
            <h2 className="master-title">Your Striver A2Z Preparation Journey</h2>
            <p className="master-desc">
              Master 476 curated DSA problems covering foundational mathematics to advanced dynamic programming & graphs.
            </p>
          </div>

          <div className="stats-metric-box">
            <div className="metric-number-row">
              <span className="metric-completed">{completed}</span>
              <span className="metric-total">/ {total}</span>
            </div>
            <span className="metric-label">Problems Solved</span>
          </div>
        </div>

        {/* Big Animated Master Progress Bar */}
        <div className="master-bar-container">
          <div className="master-bar-track">
            <div
              className="master-bar-fill"
              style={{ width: `${Math.min(100, percentage)}%` }}
            >
              <div className="bar-glow-effect" />
            </div>
          </div>
          <div className="master-bar-legend">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
            <span>476</span>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="quick-status-row">
          <div className="status-stat-item">
            <CheckCircle2 size={16} className="text-emerald" />
            <span><strong>{completed}</strong> Completed</span>
          </div>
          <div className="status-stat-item">
            <Clock size={16} className="text-blue" />
            <span><strong>{inProgress}</strong> In Progress</span>
          </div>
          <div className="status-stat-item">
            <Bookmark size={16} className="text-yellow" />
            <span><strong>{bookmarked}</strong> Bookmarked</span>
          </div>
          <div className="status-stat-item">
            <Target size={16} className="text-purple" />
            <span><strong>{revision}</strong> For Revision</span>
          </div>
        </div>
      </div>

      {/* Difficulty & Goal Grid */}
      <div className="cards-grid">
        {/* Easy Card */}
        <div className="difficulty-card glass-panel easy-card">
          <div className="diff-header">
            <div className="diff-name-group">
              <span className="diff-dot easy-dot" />
              <span className="diff-title">Easy</span>
            </div>
            <span className="diff-count">{easy.completed} / {easy.total}</span>
          </div>
          <div className="diff-bar-track">
            <div className="diff-bar-fill easy-fill" style={{ width: `${easyPct}%` }} />
          </div>
          <div className="diff-footer">
            <span>{easyPct}% mastered</span>
            <span>{easy.total - easy.completed} remaining</span>
          </div>
        </div>

        {/* Medium Card */}
        <div className="difficulty-card glass-panel medium-card">
          <div className="diff-header">
            <div className="diff-name-group">
              <span className="diff-dot medium-dot" />
              <span className="diff-title">Medium</span>
            </div>
            <span className="diff-count">{medium.completed} / {medium.total}</span>
          </div>
          <div className="diff-bar-track">
            <div className="diff-bar-fill medium-fill" style={{ width: `${medPct}%` }} />
          </div>
          <div className="diff-footer">
            <span>{medPct}% mastered</span>
            <span>{medium.total - medium.completed} remaining</span>
          </div>
        </div>

        {/* Hard Card */}
        <div className="difficulty-card glass-panel hard-card">
          <div className="diff-header">
            <div className="diff-name-group">
              <span className="diff-dot hard-dot" />
              <span className="diff-title">Hard</span>
            </div>
            <span className="diff-count">{hard.completed} / {hard.total}</span>
          </div>
          <div className="diff-bar-track">
            <div className="diff-bar-fill hard-fill" style={{ width: `${hardPct}%` }} />
          </div>
          <div className="diff-footer">
            <span>{hardPct}% mastered</span>
            <span>{hard.total - hard.completed} remaining</span>
          </div>
        </div>

        {/* Target Goal & Pace Card */}
        <div className="difficulty-card glass-panel goal-card">
          <div className="diff-header">
            <div className="diff-name-group">
              <Trophy size={16} className="text-amber" />
              <span className="diff-title">Daily Pace</span>
            </div>
            <span className="diff-count">{solvedToday} / {dailyGoal} Today</span>
          </div>
          <div className="diff-bar-track">
            <div
              className="diff-bar-fill goal-fill"
              style={{ width: `${Math.min(100, Math.round((solvedToday / dailyGoal) * 100))}%` }}
            />
          </div>
          <div className="diff-footer">
            <span>Goal: {dailyGoal}/day</span>
            <span>~{estimatedDays} days left</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-root {
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeIn 0.4s var(--ease-out) forwards;
        }

        .dashboard-skeleton {
          height: 180px;
          padding: 24px;
          display: flex;
          align-items: center;
        }

        .skeleton-bar {
          width: 100%;
          height: 16px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          animation: pulseGlow 1.5s infinite;
        }

        .master-progress-card {
          padding: 28px;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          animation: slideUp 0.4s var(--ease-out) forwards;
        }

        [data-theme='light'] .master-progress-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
        }

        .master-progress-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #818cf8;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.35);
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .pct-pill {
          font-size: 0.75rem;
          font-weight: 700;
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .master-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .master-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          max-width: 650px;
          line-height: 1.5;
        }

        .stats-metric-box {
          text-align: right;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          padding: 12px 20px;
          border-radius: 14px;
          min-width: 140px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .stats-metric-box:hover {
          border-color: var(--border-highlight);
          box-shadow: var(--shadow-glow);
        }

        .metric-number-row {
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 4px;
        }

        .metric-completed {
          font-size: 2.1rem;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .metric-total {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .metric-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .master-bar-container {
          margin-bottom: 20px;
        }

        .master-bar-track {
          width: 100%;
          height: 14px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border-subtle);
        }

        [data-theme='light'] .master-bar-track {
          background: rgba(0, 0, 0, 0.08);
        }

        .master-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #06b6d4 50%, #10b981 100%);
          border-radius: 9999px;
          transition: width 0.8s var(--ease-spring);
          position: relative;
          will-change: width;
        }

        .bar-glow-effect {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 20px;
          background: rgba(255, 255, 255, 0.6);
          filter: blur(4px);
          border-radius: 9999px;
          animation: floatSubtle 2s infinite ease-in-out;
        }

        .master-bar-legend {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 6px;
          padding: 0 4px;
        }

        .quick-status-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .status-stat-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: color 0.2s;
        }

        .status-stat-item:hover {
          color: var(--text-primary);
        }

        .status-stat-item strong {
          color: var(--text-primary);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .difficulty-card {
          padding: 18px 20px;
          border-radius: 16px;
          transition: transform 0.25s var(--ease-spring), border-color 0.25s, box-shadow 0.25s;
          animation: slideUp 0.4s var(--ease-out) both;
        }

        .difficulty-card:nth-child(1) { animation-delay: 80ms; }
        .difficulty-card:nth-child(2) { animation-delay: 140ms; }
        .difficulty-card:nth-child(3) { animation-delay: 200ms; }
        .difficulty-card:nth-child(4) { animation-delay: 260ms; }

        .difficulty-card:hover {
          transform: translateY(-4px);
        }

        .easy-card:hover {
          border-color: var(--color-easy-border);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.12);
        }

        .medium-card:hover {
          border-color: var(--color-medium-border);
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.12);
        }

        .hard-card:hover {
          border-color: var(--color-hard-border);
          box-shadow: 0 4px 20px rgba(244, 63, 94, 0.12);
        }

        .goal-card:hover {
          border-color: var(--border-highlight);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.12);
        }

        .diff-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .diff-name-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .diff-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          transition: transform 0.2s;
        }

        .difficulty-card:hover .diff-dot {
          transform: scale(1.3);
        }

        .easy-dot { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); }
        .medium-dot { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.6); }
        .hard-dot { background: #f43f5e; box-shadow: 0 0 10px rgba(244, 63, 94, 0.6); }

        .diff-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .diff-count {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .diff-bar-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        [data-theme='light'] .diff-bar-track {
          background: rgba(0, 0, 0, 0.08);
        }

        .diff-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.6s var(--ease-spring);
          will-change: width;
        }

        .easy-fill { background: linear-gradient(90deg, #10b981, #34d399); }
        .medium-fill { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .hard-fill { background: linear-gradient(90deg, #f43f5e, #fb7185); }
        .goal-fill { background: linear-gradient(90deg, #6366f1, #a855f7); }

        .diff-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .text-emerald { color: #10b981; }
        .text-blue { color: #3b82f6; }
        .text-yellow { color: #eab308; }
        .text-purple { color: #a855f7; }
        .text-amber { color: #f59e0b; }

        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .master-progress-header {
            flex-direction: column;
          }
          .stats-metric-box {
            width: 100%;
            text-align: left;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
