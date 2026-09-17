'use client';

import React, { useState } from 'react';
import { Problem, ProblemStatus } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Star,
  ExternalLink,
  FileText,
  ChevronDown,
  Code2
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

interface ProblemRowProps {
  problem: Problem;
  onOpenDrawer: (problem: Problem) => void;
  showStepContext?: boolean;
}

export default function ProblemRow({ problem, onOpenDrawer, showStepContext = false }: ProblemRowProps) {
  const { progress, updateStatus, toggleProblemBookmark } = useProgress();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const prog = progress[problem.id] || {
    status: 'todo',
    bookmarked: false
  };

  const currentStatus = prog.status || 'todo';
  const isBookmarked = !!prog.bookmarked;
  const hasNotesOrCode = !!(prog.notes?.trim() || prog.code?.trim());

  const handleToggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: ProblemStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    updateStatus(problem.id, nextStatus);
  };

  const handleSelectStatus = (e: React.MouseEvent, status: ProblemStatus) => {
    e.stopPropagation();
    updateStatus(problem.id, status);
    setDropdownOpen(false);
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleProblemBookmark(problem.id);
  };

  return (
    <div className={`problem-row ${currentStatus === 'completed' ? 'row-completed' : ''}`}>
      {/* Left: Status Toggle Checkbox */}
      <div className="status-cell">
        <button
          className={`status-circle-btn status-${currentStatus}`}
          onClick={handleToggleCompleted}
          title={`Mark as ${currentStatus === 'completed' ? 'Todo' : 'Completed'}`}
        >
          {currentStatus === 'completed' && <CheckCircle2 size={19} className="icon-completed" />}
          {currentStatus === 'in_progress' && <Clock size={19} className="icon-in_progress" />}
          {currentStatus === 'revision' && <Target size={19} className="icon-revision" />}
          {currentStatus === 'todo' && <Circle size={19} className="icon-todo" />}
        </button>

        {/* Dropdown status selector */}
        <div className="status-dropdown-wrapper">
          <button
            className="status-dropdown-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            title="Change problem status"
          >
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className="status-dropdown-menu glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
              <button
                className={`status-opt-btn ${currentStatus === 'todo' ? 'active' : ''}`}
                onClick={(e) => handleSelectStatus(e, 'todo')}
              >
                <Circle size={15} /> Todo
              </button>
              <button
                className={`status-opt-btn opt-in_progress ${currentStatus === 'in_progress' ? 'active' : ''}`}
                onClick={(e) => handleSelectStatus(e, 'in_progress')}
              >
                <Clock size={15} /> In Progress
              </button>
              <button
                className={`status-opt-btn opt-completed ${currentStatus === 'completed' ? 'active' : ''}`}
                onClick={(e) => handleSelectStatus(e, 'completed')}
              >
                <CheckCircle2 size={15} /> Completed
              </button>
              <button
                className={`status-opt-btn opt-revision ${currentStatus === 'revision' ? 'active' : ''}`}
                onClick={(e) => handleSelectStatus(e, 'revision')}
              >
                <Target size={15} /> For Revision
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ID & Title */}
      <div className="title-cell" onClick={() => onOpenDrawer(problem)}>
        <span className="problem-id">#{problem.id}</span>
        <div className="title-and-topic">
          <span className="problem-title">{problem.title}</span>
          {showStepContext && (
            <span className="step-context-label">
              {problem.step} • {problem.topic}
            </span>
          )}
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="difficulty-cell">
        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
          {problem.difficulty}
        </span>
      </div>

      {/* Resource Links: Solve in Workspace, LeetCode & YouTube */}
      <div className="links-cell">
        {/* Solve Link */}
        <Link
          href={`/solve/${problem.id}`}
          className="resource-link solve-link"
          title="Open in interactive coding workspace & compiler"
          onClick={e => e.stopPropagation()}
        >
          <Code2 size={14} />
          <span className="link-label">Solve</span>
        </Link>

        {problem.leetcodeUrl ? (
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-link leetcode-link"
            title="Practice on LeetCode"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={14} />
            <span className="link-label">LeetCode</span>
          </a>
        ) : (
          <span className="no-link">-</span>
        )}

        {problem.youtubeUrl ? (
          <a
            href={problem.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-link youtube-link"
            title="Watch Video Tutorial on YouTube"
            onClick={e => e.stopPropagation()}
          >
            <YouTubeIcon size={14} />
            <span className="link-label">Video</span>
          </a>
        ) : null}
      </div>

      {/* Actions: Notes & Bookmark */}
      <div className="actions-cell">
        {/* Notes Button */}
        <button
          className={`action-icon-btn ${hasNotesOrCode ? 'has-notes' : ''}`}
          onClick={() => onOpenDrawer(problem)}
          title={hasNotesOrCode ? 'View / Edit saved notes & code' : 'Add personal notes & code solution'}
        >
          <FileText size={16} />
          {hasNotesOrCode && <span className="notes-dot" />}
        </button>

        {/* Bookmark Star */}
        <button
          className={`action-icon-btn star-btn ${isBookmarked ? 'is-starred' : ''}`}
          onClick={handleBookmarkToggle}
          title={isBookmarked ? 'Remove from Bookmarks' : 'Bookmark this problem'}
        >
          <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <style jsx>{`
        .problem-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          transition: all 0.25s var(--ease-smooth);
          position: relative;
          will-change: transform, background-color;
        }

        .problem-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, var(--accent-primary), var(--accent-cyan));
          border-radius: 0 4px 4px 0;
          transition: height 0.25s var(--ease-spring);
        }

        .problem-row:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-glass);
          transform: translateX(4px);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }

        .problem-row:hover::before {
          height: 60%;
        }

        .row-completed {
          background: rgba(16, 185, 129, 0.04);
        }

        .row-completed::before {
          background: linear-gradient(180deg, #10b981, #34d399);
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 2px;
          position: relative;
        }

        .status-circle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .status-circle-btn:hover {
          transform: scale(1.2);
        }

        .status-circle-btn:active {
          transform: scale(0.95);
        }

        .icon-completed { color: var(--color-completed); }
        .icon-in_progress { color: var(--color-in-progress); }
        .icon-revision { color: var(--color-revision); }
        .icon-todo { color: var(--text-muted); opacity: 0.5; transition: opacity 0.2s; }
        .problem-row:hover .icon-todo { opacity: 0.8; }

        .status-dropdown-wrapper {
          position: relative;
        }

        .status-dropdown-trigger {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 3px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .problem-row:hover .status-dropdown-trigger {
          opacity: 1;
        }

        .status-dropdown-trigger:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .status-dropdown-menu {
          position: absolute;
          left: 0;
          top: calc(100% + 4px);
          width: 150px;
          padding: 6px;
          z-index: 30;
          box-shadow: var(--shadow-md);
        }

        .status-opt-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 10px;
          font-size: 0.8rem;
          font-weight: 500;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
        }

        .status-opt-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .status-opt-btn.opt-in_progress:hover { color: #3b82f6; }
        .status-opt-btn.opt-completed:hover { color: #10b981; }
        .status-opt-btn.opt-revision:hover { color: #a855f7; }
        .status-opt-btn.active {
          font-weight: 700;
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .title-cell {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          min-width: 0;
        }

        .problem-id {
          font-size: 0.76rem;
          font-family: var(--font-code);
          font-weight: 600;
          color: var(--text-muted);
          min-width: 38px;
        }

        .title-and-topic {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .problem-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .title-cell:hover .problem-title {
          color: var(--accent-cyan);
        }

        .row-completed .problem-title {
          color: var(--text-secondary);
        }

        .step-context-label {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .difficulty-cell {
          min-width: 70px;
          display: flex;
          justify-content: center;
        }

        .links-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .resource-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .resource-link:hover {
          transform: translateY(-2px);
        }

        .solve-link {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.35);
        }

        .solve-link:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
          border-color: rgba(99, 102, 241, 0.6);
          color: #ffffff;
          box-shadow: 0 3px 12px rgba(99, 102, 241, 0.25);
        }

        .leetcode-link {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .leetcode-link:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 3px 10px rgba(245, 158, 11, 0.12);
        }

        .youtube-link {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .youtube-link:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 3px 10px rgba(239, 68, 68, 0.12);
        }

        .no-link {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .action-icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .action-icon-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .action-icon-btn:active {
          transform: scale(0.9);
        }

        .action-icon-btn.has-notes {
          color: var(--accent-cyan);
        }

        .notes-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          background: var(--accent-cyan);
          border-radius: 9999px;
          box-shadow: 0 0 6px var(--accent-cyan-glow);
        }

        .star-btn:hover {
          color: #eab308;
        }

        .star-btn.is-starred {
          color: #eab308;
        }

        .star-btn.is-starred:hover {
          transform: scale(1.15);
        }

        @media (max-width: 768px) {
          .link-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
