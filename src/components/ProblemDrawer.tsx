'use client';

import React, { useState, useEffect } from 'react';
import { Problem, ProblemStatus } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import {
  X,
  ExternalLink,
  Star,
  CheckCircle2,
  Clock,
  Target,
  Circle,
  Code,
  FileText,
  Save,
  Check
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

interface ProblemDrawerProps {
  problem: Problem | null;
  onClose: () => void;
}

export default function ProblemDrawer({ problem, onClose }: ProblemDrawerProps) {
  const { progress, updateStatus, updateProblemDetails, toggleProblemBookmark } = useProgress();

  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (problem) {
      const prog = progress[problem.id];
      setNotes(prog?.notes || '');
      setCode(prog?.code || '');
      setLanguage(prog?.language || 'cpp');
    }
  }, [problem, progress]);

  if (!problem) return null;

  const prog = progress[problem.id] || { status: 'todo', bookmarked: false };
  const currentStatus = prog.status || 'todo';
  const isBookmarked = prog.bookmarked || false;

  const handleSave = async () => {
    await updateProblemDetails(problem.id, {
      notes,
      code,
      language
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleStatusChange = (status: ProblemStatus) => {
    updateStatus(problem.id, status);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-area">
            <div className="drawer-tags-row">
              <span className="problem-num-pill">#{problem.id}</span>
              <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <span className="step-pill-tag">{problem.step}</span>
            </div>
            <h2 className="drawer-problem-title">{problem.title}</h2>
            <span className="drawer-topic-subtitle">{problem.topic}</span>
          </div>

          <button className="drawer-close-btn" onClick={onClose} title="Close drawer">
            <X size={20} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="drawer-toolbar">
          {/* Status Buttons */}
          <div className="status-selector-group">
            <button
              className={`status-btn ${currentStatus === 'todo' ? 'active todo-active' : ''}`}
              onClick={() => handleStatusChange('todo')}
            >
              <Circle size={15} /> Todo
            </button>
            <button
              className={`status-btn ${currentStatus === 'in_progress' ? 'active prog-active' : ''}`}
              onClick={() => handleStatusChange('in_progress')}
            >
              <Clock size={15} /> In Progress
            </button>
            <button
              className={`status-btn ${currentStatus === 'completed' ? 'active comp-active' : ''}`}
              onClick={() => handleStatusChange('completed')}
            >
              <CheckCircle2 size={15} /> Completed
            </button>
            <button
              className={`status-btn ${currentStatus === 'revision' ? 'active rev-active' : ''}`}
              onClick={() => handleStatusChange('revision')}
            >
              <Target size={15} /> Revision
            </button>
          </div>

          {/* Quick Links & Bookmark */}
          <div className="toolbar-right-links">
            <button
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={() => toggleProblemBookmark(problem.id)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark problem'}
            >
              <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? 'Starred' : 'Star'}</span>
            </button>

            {problem.leetcodeUrl && (
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button lc-button"
                title="Open LeetCode Practice"
              >
                <ExternalLink size={14} /> LeetCode
              </a>
            )}

            {problem.gfgUrl && (
              <a
                href={problem.gfgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button gfg-button"
                title="Practice on GeeksforGeeks"
              >
                <Code size={14} /> GFG
              </a>
            )}

            {problem.tufUrl && (
              <a
                href={problem.tufUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button tuf-button"
                title="Read takeUforward Article & Editorial"
              >
                <FileText size={14} /> TUF Article
              </a>
            )}

            {problem.youtubeUrl && (
              <a
                href={problem.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button yt-button"
                title="Watch Video Tutorial"
              >
                <YouTubeIcon size={15} /> Video
              </a>
            )}
          </div>
        </div>

        {/* Main Body */}
        <div className="drawer-body">
          {/* Notes Section */}
          <div className="form-section">
            <div className="section-title-row">
              <FileText size={16} className="section-icon text-cyan" />
              <label className="section-label">Approach & Complexity Notes</label>
            </div>
            <textarea
              className="notes-textarea"
              placeholder="Write your intuition, Time Complexity (e.g. O(N)), Space Complexity (e.g. O(1)), edge cases, and key takeaways..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
            />
          </div>

          {/* Code Section */}
          <div className="form-section">
            <div className="section-title-row code-title-row">
              <div className="code-title-left">
                <Code size={16} className="section-icon text-indigo" />
                <label className="section-label">Solution Snippet</label>
              </div>

              <select
                className="lang-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
              </select>
            </div>

            <textarea
              className="code-textarea"
              placeholder="// Paste your clean code implementation here..."
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={9}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="save-notes-btn" onClick={handleSave}>
            {savedFeedback ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              <>
                <Save size={16} /> Save Notes & Code
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          justify-content: flex-end;
          animation: overlayReveal 0.3s var(--ease-out) forwards;
        }

        @keyframes overlayReveal {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(6px); }
        }

        .drawer-panel {
          width: 100%;
          max-width: 680px;
          height: 100vh;
          background: var(--bg-surface);
          border-left: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 40px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          animation: drawerSlideIn 0.35s var(--ease-spring) forwards;
          will-change: transform;
        }

        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          padding: 24px 28px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          gap: 16px;
          animation: fadeIn 0.3s 0.15s var(--ease-out) both;
        }

        .drawer-title-area {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .drawer-tags-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .problem-num-pill {
          font-family: var(--font-code);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.12);
          padding: 2px 8px;
          border-radius: 6px;
          transition: background var(--transition-fast);
        }

        .step-pill-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--bg-card);
          padding: 2px 8px;
          border-radius: 6px;
          transition: background var(--transition-fast);
        }

        .drawer-problem-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .drawer-topic-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .drawer-close-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .drawer-close-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-glass);
          background: var(--bg-card-hover);
          transform: rotate(90deg);
        }

        .drawer-toolbar {
          padding: 16px 28px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          animation: fadeIn 0.3s 0.2s var(--ease-out) both;
        }

        .status-selector-group {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .status-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .status-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: currentColor;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .status-btn:hover {
          border-color: var(--border-glass);
          color: var(--text-primary);
        }

        .status-btn:hover::after {
          opacity: 0.04;
        }

        .status-btn.todo-active {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--border-glass);
        }

        .status-btn.prog-active {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.15);
        }

        .status-btn.comp-active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
        }

        .status-btn.rev-active {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
          border-color: rgba(168, 85, 247, 0.4);
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.15);
        }

        .toolbar-right-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .bookmark-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
        }

        .bookmark-btn:hover {
          border-color: rgba(234, 179, 8, 0.4);
          color: #eab308;
        }

        .bookmark-btn.bookmarked {
          color: #eab308;
          border-color: rgba(234, 179, 8, 0.4);
          background: rgba(234, 179, 8, 0.1);
        }

        .link-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
        }

        .link-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.15);
        }

        .lc-button {
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .lc-button:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }

        .gfg-button {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .gfg-button:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .tuf-button {
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .tuf-button:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .yt-button {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .yt-button:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeIn 0.35s 0.25s var(--ease-out) both;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .code-title-row {
          justify-content: space-between;
        }

        .code-title-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .lang-select {
          padding: 4px 10px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
        }

        .lang-select:hover {
          border-color: var(--accent-primary);
        }

        .notes-textarea {
          width: 100%;
          padding: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .notes-textarea:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15);
        }

        .code-textarea {
          width: 100%;
          padding: 14px;
          background: #080b11;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          font-family: var(--font-code);
          font-size: 0.85rem;
          color: #38bdf8;
          line-height: 1.5;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .code-textarea:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .drawer-footer {
          padding: 18px 28px;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-card);
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s 0.3s var(--ease-out) both;
        }

        .save-notes-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        }

        .save-notes-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .save-notes-btn:active {
          transform: translateY(0);
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-indigo { color: var(--accent-primary); }
      `}</style>
    </div>
  );
}
