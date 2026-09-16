'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { Search, X, CheckCircle, Clock, Bookmark, Target, Layers, Table as TableIcon, LayoutGrid, ChevronsUpDown } from 'lucide-react';
import dsaQuestions from '@/data/dsaQuestions.json';

interface FilterToolbarProps {
  onToggleExpandAll?: () => void;
  allExpanded?: boolean;
}

export default function FilterToolbar({ onToggleExpandAll, allExpanded }: FilterToolbarProps) {
  const {
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
    stats
  } = useProgress();

  // Unique steps for the dropdown
  const uniqueSteps = Array.from(new Set(dsaQuestions.map(q => q.step)));

  const statusCounts = {
    All: stats?.totalQuestions || 476,
    completed: stats?.completedQuestions || 0,
    in_progress: stats?.inProgressQuestions || 0,
    revision: stats?.revisionQuestions || 0,
    bookmarked: stats?.bookmarkedQuestions || 0,
    todo: Math.max(0, (stats?.totalQuestions || 476) - (stats?.completedQuestions || 0) - (stats?.inProgressQuestions || 0) - (stats?.revisionQuestions || 0))
  };

  return (
    <div className="filter-toolbar-root glass-panel">
      {/* Top row: Search and View Mode */}
      <div className="toolbar-top-row">
        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search 476 problems by title, topic, or concept (e.g. 2 Sum, DP, Trie)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Step Selector Dropdown */}
        <div className="step-select-wrapper">
          <select
            className="step-select"
            value={stepFilter}
            onChange={e => setStepFilter(e.target.value)}
          >
            <option value="All">All 18 Steps</option>
            {uniqueSteps.map(step => (
              <option key={step} value={step}>
                {step}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="view-mode-group">
          <button
            className={`view-mode-btn ${viewMode === 'accordion' ? 'active' : ''}`}
            onClick={() => setViewMode('accordion')}
            title="Systematic Tree / Accordion View"
          >
            <Layers size={16} />
            <span className="view-label">Steps</span>
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Flat Table View"
          >
            <TableIcon size={16} />
            <span className="view-label">Table</span>
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Kanban Board View"
          >
            <LayoutGrid size={16} />
            <span className="view-label">Board</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filter Chips & Status Tabs */}
      <div className="toolbar-bottom-row">
        {/* Status Tabs */}
        <div className="status-tabs-container">
          <button
            className={`tab-btn ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            <span>All</span>
            <span className="tab-count">{statusCounts.All}</span>
          </button>

          <button
            className={`tab-btn tab-completed ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <CheckCircle size={14} />
            <span>Completed</span>
            <span className="tab-count">{statusCounts.completed}</span>
          </button>

          <button
            className={`tab-btn tab-in_progress ${statusFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in_progress')}
          >
            <Clock size={14} />
            <span>In Progress</span>
            <span className="tab-count">{statusCounts.in_progress}</span>
          </button>

          <button
            className={`tab-btn tab-bookmarked ${statusFilter === 'bookmarked' ? 'active' : ''}`}
            onClick={() => setStatusFilter('bookmarked')}
          >
            <Bookmark size={14} />
            <span>Starred</span>
            <span className="tab-count">{statusCounts.bookmarked}</span>
          </button>

          <button
            className={`tab-btn tab-revision ${statusFilter === 'revision' ? 'active' : ''}`}
            onClick={() => setStatusFilter('revision')}
          >
            <Target size={14} />
            <span>Revision</span>
            <span className="tab-count">{statusCounts.revision}</span>
          </button>

          <button
            className={`tab-btn tab-todo ${statusFilter === 'todo' ? 'active' : ''}`}
            onClick={() => setStatusFilter('todo')}
          >
            <span>Todo</span>
            <span className="tab-count">{statusCounts.todo}</span>
          </button>
        </div>

        {/* Right side: Difficulty pills + Expand All toggle */}
        <div className="diff-pills-row">
          <div className="diff-pills-group">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                className={`diff-pill-btn diff-${diff.toLowerCase()} ${difficultyFilter === diff ? 'active' : ''}`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff}
              </button>
            ))}
          </div>

          {viewMode === 'accordion' && onToggleExpandAll && (
            <button
              className="expand-all-btn"
              onClick={onToggleExpandAll}
              title={allExpanded ? 'Collapse all steps' : 'Expand all steps'}
            >
              <ChevronsUpDown size={15} />
              <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .filter-toolbar-root {
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeIn 0.35s 0.15s var(--ease-out) both;
        }

        .toolbar-top-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 280px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          transition: color 0.2s;
        }

        .search-input-wrapper:focus-within .search-icon {
          color: var(--accent-primary);
        }

        .search-input {
          width: 100%;
          padding: 11px 40px 11px 42px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          font-size: 0.88rem;
          color: var(--text-primary);
          outline: none;
        }

        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .search-input::placeholder {
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .search-input:focus::placeholder {
          color: var(--text-subtle);
        }

        .clear-search-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 6px;
        }

        .clear-search-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .step-select-wrapper {
          min-width: 200px;
        }

        .step-select {
          width: 100%;
          padding: 11px 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
        }

        .step-select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .view-mode-group {
          display: flex;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 3px;
          gap: 2px;
        }

        .view-mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 9px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .view-mode-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .view-mode-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
        }

        .toolbar-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
        }

        .status-tabs-container {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          white-space: nowrap;
        }

        .tab-btn:hover {
          border-color: var(--border-glass);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .tab-btn.active {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--accent-primary);
        }

        .tab-btn.tab-completed.active {
          border-color: #10b981;
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }

        .tab-btn.tab-in_progress.active {
          border-color: #3b82f6;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.15);
        }

        .tab-btn.tab-bookmarked.active {
          border-color: #eab308;
          color: #eab308;
          background: rgba(234, 179, 8, 0.15);
        }

        .tab-btn.tab-revision.active {
          border-color: #a855f7;
          color: #a855f7;
          background: rgba(168, 85, 247, 0.15);
        }

        .tab-count {
          font-size: 0.72rem;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          color: inherit;
        }

        [data-theme='light'] .tab-count {
          background: rgba(0, 0, 0, 0.06);
        }

        .diff-pills-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .diff-pills-group {
          display: flex;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 9999px;
          padding: 3px;
          gap: 2px;
        }

        .diff-pill-btn {
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 700;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .diff-pill-btn:hover {
          color: var(--text-primary);
        }

        .diff-pill-btn.active {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .diff-pill-btn.diff-easy.active {
          background: var(--color-easy);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .diff-pill-btn.diff-medium.active {
          background: var(--color-medium);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .diff-pill-btn.diff-hard.active {
          background: var(--color-hard);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.3);
        }

        .expand-all-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .expand-all-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .view-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
