'use client';

import React, { useState, useEffect } from 'react';
import { Problem } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import { X, Shuffle, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';
import dsaQuestions from '@/data/dsaQuestions.json';

interface RandomProblemModalProps {
  onClose: () => void;
}

export default function RandomProblemModal({ onClose }: RandomProblemModalProps) {
  const { progress, updateStatus } = useProgress();

  const [difficulty, setDifficulty] = useState<string>('All');
  const [unsolvedOnly, setUnsolvedOnly] = useState<boolean>(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

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

  const handlePickRandom = () => {
    let pool = dsaQuestions as Problem[];

    if (unsolvedOnly) {
      pool = pool.filter(p => progress[p.id]?.status !== 'completed');
    }

    if (difficulty !== 'All') {
      pool = pool.filter(p => p.difficulty === difficulty);
    }

    if (pool.length === 0) {
      alert('No questions match these random pick criteria!');
      return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    setSelectedProblem(pool[randomIndex]);
  };

  const isCompleted = selectedProblem ? progress[selectedProblem.id]?.status === 'completed' : false;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <Shuffle size={20} className="text-cyan" />
              <h2 className="modal-title">Pick a Random Problem</h2>
            </div>
            <button className="modal-close-btn" onClick={onClose} title="Close modal (Esc)">
              <X size={18} />
            </button>
          </div>

          {/* Filter Selection Controls */}
          <div className="modal-body">
            <div className="controls-row">
              <div className="filter-field">
                <label className="field-label">Difficulty</label>
                <div className="diff-buttons">
                  {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={unsolvedOnly}
                  onChange={e => setUnsolvedOnly(e.target.checked)}
                />
                <span>Unsolved Only</span>
              </label>
            </div>

            <button className="spin-btn" onClick={handlePickRandom}>
              <Sparkles size={18} />
              <span>Generate Random Challenge</span>
            </button>

            {/* Display picked problem */}
            {selectedProblem && (
              <div className="picked-card glass-panel animate-fade-in">
                <div className="picked-top">
                  <span className="picked-id">#{selectedProblem.id}</span>
                  <span className={`badge badge-${selectedProblem.difficulty.toLowerCase()}`}>
                    {selectedProblem.difficulty}
                  </span>
                  <span className="picked-step">{selectedProblem.step}</span>
                </div>

                <h3 className="picked-title">{selectedProblem.title}</h3>
                <p className="picked-topic">Topic: {selectedProblem.topic}</p>

                <div className="picked-actions">
                  {selectedProblem.leetcodeUrl && (
                    <a
                      href={selectedProblem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link lc-link"
                    >
                      <ExternalLink size={15} /> Solve on LeetCode
                    </a>
                  )}

                  {selectedProblem.youtubeUrl && (
                    <a
                      href={selectedProblem.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link yt-link"
                    >
                      <YouTubeIcon size={16} /> Video Solution
                    </a>
                  )}

                  <button
                    className={`mark-done-btn ${isCompleted ? 'is-done' : ''}`}
                    onClick={() => updateStatus(selectedProblem.id, isCompleted ? 'todo' : 'completed')}
                  >
                    <CheckCircle2 size={16} />
                    <span>{isCompleted ? 'Completed!' : 'Mark Completed'}</span>
                  </button>
                </div>
              </div>
            )}
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
          max-width: 560px;
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
          font-size: 1.15rem;
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
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .controls-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .diff-buttons {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
        }

        .diff-btn {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }

        .diff-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .spin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px;
          border-radius: 12px;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
          transition: transform 0.15s, filter 0.15s;
        }

        .spin-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .picked-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: 16px;
        }

        .picked-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .picked-id {
          font-family: var(--font-code);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .picked-step {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-left: auto;
        }

        .picked-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .picked-topic {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .picked-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .action-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s;
        }

        .action-link:hover {
          transform: translateY(-1px);
        }

        .lc-link {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .yt-link {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.35);
        }

        .mark-done-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .mark-done-btn.is-done {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.35);
        }

        .text-cyan { color: var(--accent-cyan); }
      `}</style>
    </>
  );
}
