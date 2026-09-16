'use client';

import React from 'react';
import { Problem, ProblemStatus } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import { Circle, Clock, CheckCircle2, Target, ExternalLink, FileText, Star } from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

interface KanbanViewProps {
  problems: Problem[];
  onOpenDrawer: (problem: Problem) => void;
}

export default function KanbanView({ problems, onOpenDrawer }: KanbanViewProps) {
  const { progress, updateStatus, toggleProblemBookmark } = useProgress();

  const columns: { id: ProblemStatus; title: string; icon: React.ReactNode; color: string }[] = [
    { id: 'todo', title: 'To Do', icon: <Circle size={16} />, color: 'var(--text-muted)' },
    { id: 'in_progress', title: 'In Progress', icon: <Clock size={16} />, color: '#3b82f6' },
    { id: 'completed', title: 'Completed', icon: <CheckCircle2 size={16} />, color: '#10b981' },
    { id: 'revision', title: 'For Revision', icon: <Target size={16} />, color: '#a855f7' }
  ];

  // Group problems by status
  const grouped: Record<ProblemStatus, Problem[]> = {
    todo: [],
    in_progress: [],
    completed: [],
    revision: []
  };

  for (const p of problems) {
    const st: ProblemStatus = progress[p.id]?.status || 'todo';
    if (grouped[st]) {
      grouped[st].push(p);
    } else {
      grouped.todo.push(p);
    }
  }

  return (
    <div className="kanban-grid">
      {columns.map(col => {
        const colProblems = grouped[col.id] || [];

        return (
          <div key={col.id} className="kanban-column glass-panel">
            {/* Column Header */}
            <div className="kanban-col-header">
              <div className="col-header-left" style={{ color: col.color }}>
                {col.icon}
                <span className="col-title">{col.title}</span>
              </div>
              <span className="col-badge">{colProblems.length}</span>
            </div>

            {/* Column Cards */}
            <div className="kanban-cards-scroll">
              {colProblems.length === 0 ? (
                <div className="empty-col">No problems here</div>
              ) : (
                colProblems.map(p => {
                  const pProg = progress[p.id] || { status: 'todo', bookmarked: false };
                  const isBookmarked = pProg.bookmarked || false;

                  return (
                    <div
                      key={p.id}
                      className="kanban-card"
                      onClick={() => onOpenDrawer(p)}
                    >
                      <div className="card-top">
                        <span className="card-id">#{p.id}</span>
                        <span className={`badge badge-${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </div>

                      <h4 className="card-title">{p.title}</h4>
                      <span className="card-topic">{p.topic}</span>

                      <div className="card-footer" onClick={e => e.stopPropagation()}>
                        <div className="card-links">
                          {p.leetcodeUrl && (
                            <a
                              href={p.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="card-link"
                              title="LeetCode"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          {p.youtubeUrl && (
                            <a
                              href={p.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="card-link text-yt"
                              title="YouTube"
                            >
                              <YouTubeIcon size={14} />
                            </a>
                          )}
                          <button
                            className="card-link"
                            onClick={() => onOpenDrawer(p)}
                            title="Notes"
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            className={`card-link ${isBookmarked ? 'text-star' : ''}`}
                            onClick={() => toggleProblemBookmark(p.id)}
                            title="Bookmark"
                          >
                            <Star size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Quick Move Next Status */}
                        <div className="card-move-actions">
                          {col.id !== 'in_progress' && (
                            <button
                              className="move-btn"
                              onClick={() => updateStatus(p.id, 'in_progress')}
                              title="Move to In Progress"
                            >
                              <Clock size={12} />
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              className="move-btn move-done"
                              onClick={() => updateStatus(p.id, 'completed')}
                              title="Mark Completed"
                            >
                              <CheckCircle2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .kanban-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          align-items: flex-start;
          animation: fadeIn 0.35s var(--ease-out) forwards;
        }

        .kanban-column {
          padding: 16px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          max-height: 80vh;
          animation: slideUp 0.4s var(--ease-out) both;
        }

        .kanban-column:nth-child(1) { animation-delay: 0ms; }
        .kanban-column:nth-child(2) { animation-delay: 80ms; }
        .kanban-column:nth-child(3) { animation-delay: 160ms; }
        .kanban-column:nth-child(4) { animation-delay: 240ms; }

        .kanban-col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 12px;
        }

        .col-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .col-badge {
          font-size: 0.75rem;
          font-weight: 700;
          background: var(--bg-card);
          padding: 2px 8px;
          border-radius: 9999px;
          color: var(--text-secondary);
        }

        .kanban-cards-scroll {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .kanban-card {
          padding: 12px 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s var(--ease-smooth);
          display: flex;
          flex-direction: column;
          gap: 6px;
          will-change: transform;
        }

        .kanban-card:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-glass);
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-id {
          font-family: var(--font-code);
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .card-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          transition: color 0.2s;
        }

        .kanban-card:hover .card-title {
          color: var(--accent-cyan);
        }

        .card-topic {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
          margin-top: 4px;
        }

        .card-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .card-link:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .text-yt { color: #f87171; }
        .text-star { color: #eab308; }

        .card-move-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .move-btn {
          padding: 4px;
          border-radius: 4px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .move-btn:hover {
          color: #3b82f6;
          border-color: #3b82f6;
          transform: scale(1.1);
        }

        .move-done:hover {
          color: #10b981;
          border-color: #10b981;
        }

        .empty-col {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .kanban-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .kanban-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
