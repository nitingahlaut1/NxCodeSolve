'use client';

import React, { useEffect } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { X, Flame, Trophy, CheckCircle2, BarChart2 } from 'lucide-react';
import dsaQuestions from '@/data/dsaQuestions.json';

interface AnalyticsModalProps {
  onClose: () => void;
}

export default function AnalyticsModal({ onClose }: AnalyticsModalProps) {
  const { stats, progress } = useProgress();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const heatmap = stats?.activityHeatmap || [];
  const currentStreak = stats?.streak?.currentStreak || 0;
  const longestStreak = stats?.streak?.longestStreak || 0;
  const completed = stats?.completedQuestions || 0;
  const total = stats?.totalQuestions || 476;

  // Step breakdown calculation
  const uniqueSteps = Array.from(new Set(dsaQuestions.map(q => q.step)));
  const stepStats = uniqueSteps.map(stepName => {
    const stepProbs = dsaQuestions.filter(q => q.step === stepName);
    const stepCompleted = stepProbs.filter(p => progress[p.id]?.status === 'completed').length;
    const pct = stepProbs.length > 0 ? Math.round((stepCompleted / stepProbs.length) * 100) : 0;
    const match = stepName.match(/Step\s+(\d+):\s*(.*)/i);
    return {
      name: match ? `Step ${match[1]}: ${match[2]}` : stepName,
      shortName: match ? `S${match[1]}` : stepName.slice(0, 4),
      completed: stepCompleted,
      total: stepProbs.length,
      pct
    };
  });

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'var(--bg-card)';
    if (count === 1) return 'rgba(16, 185, 129, 0.35)';
    if (count <= 3) return 'rgba(16, 185, 129, 0.65)';
    if (count <= 6) return 'rgba(16, 185, 129, 0.85)';
    return '#10b981';
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <BarChart2 size={20} className="text-cyan" />
              <h2 className="modal-title">Preparation Analytics & Heatmap</h2>
            </div>
            <button className="modal-close-btn" onClick={onClose} title="Close modal (Esc)">
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {/* Streak & Highlights Cards */}
            <div className="highlights-row">
              <div className="highlight-card glass-panel">
                <div className="hl-icon-wrap hl-flame">
                  <Flame size={22} />
                </div>
                <div>
                  <div className="hl-value">{currentStreak} Days</div>
                  <div className="hl-label">Current Streak</div>
                </div>
              </div>

              <div className="highlight-card glass-panel">
                <div className="hl-icon-wrap hl-trophy">
                  <Trophy size={22} />
                </div>
                <div>
                  <div className="hl-value">{longestStreak} Days</div>
                  <div className="hl-label">Best Streak</div>
                </div>
              </div>

              <div className="highlight-card glass-panel">
                <div className="hl-icon-wrap hl-done">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="hl-value">{completed} / {total}</div>
                  <div className="hl-label">Total Solved ({stats?.completionPercentage || 0}%)</div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="analytics-section">
              <div className="section-head">
                <h3 className="section-title">90-Day Problem Solving Activity</h3>
                <span className="section-subtitle">Consistent practice builds mastery</span>
              </div>

              <div className="heatmap-container glass-panel">
                <div className="heatmap-grid">
                  {heatmap.map(day => (
                    <div
                      key={day.date}
                      className="heatmap-cell"
                      style={{ background: getHeatmapColor(day.count) }}
                      title={`${day.date}: ${day.count} problem${day.count === 1 ? '' : 's'} solved`}
                    />
                  ))}
                </div>

                <div className="heatmap-legend">
                  <span>Less</span>
                  <div className="legend-cell" style={{ background: 'var(--bg-card)' }} />
                  <div className="legend-cell" style={{ background: 'rgba(16, 185, 129, 0.35)' }} />
                  <div className="legend-cell" style={{ background: 'rgba(16, 185, 129, 0.65)' }} />
                  <div className="legend-cell" style={{ background: '#10b981' }} />
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Breakdown */}
            <div className="analytics-section">
              <div className="section-head">
                <h3 className="section-title">Step-by-Step Mastery</h3>
                <span className="section-subtitle">Progress across all 18 DSA syllabus modules</span>
              </div>

              <div className="step-bars-list glass-panel">
                {stepStats.map(s => (
                  <div key={s.name} className="step-stat-row">
                    <div className="step-stat-info">
                      <span className="step-stat-name">{s.name}</span>
                      <span className="step-stat-count">{s.completed}/{s.total} ({s.pct}%)</span>
                    </div>
                    <div className="step-stat-track">
                      <div
                        className={`step-stat-fill ${s.pct === 100 ? 'fill-max' : ''}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-panel {
          width: 100%;
          max-width: 800px;
          max-height: 88vh;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .modal-close-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-glass);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .highlights-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .highlight-card {
          padding: 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .hl-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hl-flame {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .hl-trophy {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
        }

        .hl-done {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .hl-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hl-label {
          font-size: 0.76rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .analytics-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .section-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .heatmap-container {
          padding: 18px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .heatmap-grid {
          display: grid;
          grid-auto-flow: column;
          grid-template-rows: repeat(7, 14px);
          gap: 5px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .heatmap-cell {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          transition: transform 0.1s;
          cursor: pointer;
        }

        .heatmap-cell:hover {
          transform: scale(1.3);
          z-index: 10;
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .legend-cell {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .step-bars-list {
          padding: 18px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 280px;
          overflow-y: auto;
        }

        .step-stat-row {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .step-stat-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .step-stat-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .step-stat-count {
          color: var(--text-muted);
          font-weight: 600;
        }

        .step-stat-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }

        [data-theme='light'] .step-stat-track {
          background: rgba(0, 0, 0, 0.08);
        }

        .step-stat-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #06b6d4);
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .step-stat-fill.fill-max {
          background: linear-gradient(90deg, #10b981, #34d399);
        }

        .text-cyan { color: var(--accent-cyan); }

        @media (max-width: 640px) {
          .highlights-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
