'use client';

import React, { useState } from 'react';
import { Problem } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import ProblemRow from './ProblemRow';
import { ChevronDown, ChevronRight, CheckCircle2, MoreVertical, Sparkles } from 'lucide-react';

interface StepAccordionProps {
  stepName: string;
  problems: Problem[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenDrawer: (problem: Problem) => void;
}

export default function StepAccordion({
  stepName,
  problems,
  isOpen,
  onToggle,
  onOpenDrawer
}: StepAccordionProps) {
  const { progress, batchUpdate } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  // Group problems by topic within this step
  const topicsMap = problems.reduce<Record<string, Problem[]>>((acc, p) => {
    if (!acc[p.topic]) {
      acc[p.topic] = [];
    }
    acc[p.topic].push(p);
    return acc;
  }, {});

  // Step progress statistics
  const total = problems.length;
  const completed = problems.filter(p => progress[p.id]?.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isFullyComplete = total > 0 && completed === total;

  const handleMarkStepComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ids = problems.map(p => p.id);
    batchUpdate(ids, 'completed');
    setMenuOpen(false);
  };

  const handleResetStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ids = problems.map(p => p.id);
    batchUpdate(ids, 'todo');
    setMenuOpen(false);
  };

  // Extract Step number and cleaned title
  const stepMatch = stepName.match(/Step\s+(\d+):\s*(.*)/i);
  const stepNumber = stepMatch ? stepMatch[1] : '';
  const cleanTitle = stepMatch ? stepMatch[2] : stepName;

  return (
    <div className={`step-card glass-panel ${isFullyComplete ? 'step-fully-completed' : ''}`}>
      {/* Step Header Accordion Trigger */}
      <div className="step-header" onClick={onToggle}>
        <div className="header-left">
          <button className="chevron-btn">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="step-num-badge">
            <span>{stepNumber ? `0${stepNumber}`.slice(-2) : '•'}</span>
          </div>

          <div className="step-title-group">
            <div className="step-title-row">
              <h3 className="step-title">{cleanTitle}</h3>
              {isFullyComplete && (
                <span className="step-complete-badge">
                  <CheckCircle2 size={13} /> Completed
                </span>
              )}
            </div>
            <div className="step-sub-info">
              <span>{Object.keys(topicsMap).length} Topics</span>
              <span>•</span>
              <span>{total} Problems</span>
            </div>
          </div>
        </div>

        <div className="header-right" onClick={e => e.stopPropagation()}>
          {/* Progress Pill and Mini Bar */}
          <div className="step-progress-wrapper">
            <div className="step-progress-meta">
              <span className="step-pct-text">{percentage}%</span>
              <span className="step-ratio-text">({completed}/{total})</span>
            </div>
            <div className="step-bar-track">
              <div
                className={`step-bar-fill ${isFullyComplete ? 'fill-done' : ''}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Quick Menu */}
          <div className="step-menu-container">
            <button
              className="step-menu-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
              title="Step Options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="step-dropdown glass-panel animate-fade-in">
                <button className="step-dropdown-item" onClick={handleMarkStepComplete}>
                  <CheckCircle2 size={15} className="text-emerald" /> Mark All Complete
                </button>
                <button className="step-dropdown-item" onClick={handleResetStep}>
                  <Sparkles size={15} /> Reset Step to Todo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Content (Topics & Problems) */}
      {isOpen && (
        <div className="step-content animate-fade-in">
          {Object.entries(topicsMap).map(([topicName, topicProblems]) => {
            const topicCompleted = topicProblems.filter(p => progress[p.id]?.status === 'completed').length;
            const topicTotal = topicProblems.length;
            const topicDone = topicTotal > 0 && topicCompleted === topicTotal;

            return (
              <div key={topicName} className="topic-group">
                {/* Topic Subheader */}
                <div className="topic-header">
                  <div className="topic-name-group">
                    <span className={`topic-status-indicator ${topicDone ? 'topic-done' : ''}`} />
                    <h4 className="topic-name">{topicName}</h4>
                  </div>
                  <div className="topic-meta">
                    <span className="topic-count-pill">
                      {topicCompleted} / {topicTotal}
                    </span>
                  </div>
                </div>

                {/* Problem Rows List */}
                <div className="problems-list">
                  {topicProblems.map(prob => (
                    <ProblemRow
                      key={prob.id}
                      problem={prob}
                      onOpenDrawer={onOpenDrawer}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .step-card {
          margin-bottom: 14px;
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.3s var(--ease-smooth), box-shadow 0.3s var(--ease-smooth);
        }

        .step-card:hover {
          border-color: var(--border-highlight);
          box-shadow: 0 2px 16px rgba(99, 102, 241, 0.08);
        }

        .step-fully-completed {
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.06);
        }

        .step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          user-select: none;
          gap: 16px;
          background: var(--bg-card);
          transition: background 0.2s var(--ease-smooth);
        }

        .step-header:hover {
          background: var(--bg-card-hover);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .chevron-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: transform 0.25s var(--ease-spring);
        }

        .step-card:hover .chevron-btn {
          color: var(--text-primary);
        }

        .step-num-badge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          font-family: var(--font-code);
          border: 1px solid rgba(99, 102, 241, 0.3);
          transition: transform 0.2s var(--ease-spring), box-shadow 0.2s;
        }

        .step-card:hover .step-num-badge {
          transform: scale(1.05);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
        }

        .step-fully-completed .step-num-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .step-title-group {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .step-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .step-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .step-complete-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 2px 8px;
          border-radius: 9999px;
          animation: scaleIn 0.3s var(--ease-spring);
        }

        .step-sub-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .step-progress-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          min-width: 130px;
        }

        .step-progress-meta {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .step-pct-text {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .step-ratio-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .step-bar-track {
          width: 130px;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }

        [data-theme='light'] .step-bar-track {
          background: rgba(0, 0, 0, 0.08);
        }

        .step-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #06b6d4);
          border-radius: 9999px;
          transition: width 0.5s var(--ease-spring);
        }

        .step-bar-fill.fill-done {
          background: linear-gradient(90deg, #10b981, #34d399);
        }

        .step-menu-container {
          position: relative;
        }

        .step-menu-trigger {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .step-header:hover .step-menu-trigger {
          opacity: 1;
        }

        .step-menu-trigger:hover {
          color: var(--text-primary);
          background: var(--bg-surface);
        }

        .step-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          width: 200px;
          padding: 6px;
          z-index: 35;
          box-shadow: var(--shadow-lg);
        }

        .step-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
        }

        .step-dropdown-item:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .step-content {
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-top: 1px solid var(--border-subtle);
          animation: accordionExpand 0.35s var(--ease-out) forwards;
        }

        @keyframes accordionExpand {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .topic-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .topic-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 6px;
        }

        .topic-name-group {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .topic-status-indicator {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: var(--text-muted);
          transition: background 0.3s, box-shadow 0.3s;
        }

        .topic-status-indicator.topic-done {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
        }

        .topic-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
        }

        .topic-count-pill {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid var(--border-subtle);
        }

        .problems-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .text-emerald { color: #10b981; }

        @media (max-width: 640px) {
          .step-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
          .step-progress-wrapper {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
