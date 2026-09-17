'use client';

import React, { useState } from 'react';
import { Problem } from '@/types';
import ProblemRow from './ProblemRow';
import { ArrowUpDown } from 'lucide-react';

interface TableViewProps {
  problems: Problem[];
  onOpenDrawer: (problem: Problem) => void;
}

export default function TableView({ problems, onOpenDrawer }: TableViewProps) {
  const [sortField, setSortField] = useState<'id' | 'title' | 'difficulty' | 'step'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'id' | 'title' | 'difficulty' | 'step') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const difficultyWeight = { Easy: 1, Medium: 2, Hard: 3 };

  const sortedProblems = [...problems].sort((a, b) => {
    let result = 0;
    if (sortField === 'id') {
      result = a.id - b.id;
    } else if (sortField === 'title') {
      result = a.title.localeCompare(b.title);
    } else if (sortField === 'difficulty') {
      result = (difficultyWeight[a.difficulty] || 0) - (difficultyWeight[b.difficulty] || 0);
    } else if (sortField === 'step') {
      result = a.step.localeCompare(b.step);
    }
    return sortOrder === 'asc' ? result : -result;
  });

  return (
    <div className="table-view-root glass-panel">
      {/* Table Header Controls */}
      <div className="table-header-row">
        <div className="th-cell th-status">Status</div>
        <div className="th-cell th-title" onClick={() => handleSort('title')}>
          <span>Problem Title & Topic</span>
          <ArrowUpDown size={14} className="sort-icon" />
        </div>
        <div className="th-cell th-diff" onClick={() => handleSort('difficulty')}>
          <span>Difficulty</span>
          <ArrowUpDown size={14} className="sort-icon" />
        </div>
        <div className="th-cell th-links">Practice Links</div>
        <div className="th-cell th-actions">Notes / Star</div>
      </div>

      {/* Problems Rows List */}
      <div className="table-body-rows">
        {sortedProblems.length === 0 ? (
          <div className="empty-state">
            <p>No questions match your current search and filter criteria.</p>
          </div>
        ) : (
          sortedProblems.map(p => (
            <ProblemRow
              key={p.id}
              problem={p}
              onOpenDrawer={onOpenDrawer}
              showStepContext={true}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .table-view-root {
          padding: 16px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .table-header-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          background: var(--bg-card);
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .th-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .th-cell.th-title, .th-cell.th-diff {
          cursor: pointer;
          user-select: none;
        }

        .th-cell.th-title:hover, .th-cell.th-diff:hover {
          color: var(--text-primary);
        }

        .th-status { width: 50px; }
        .th-title { flex: 1; }
        .th-diff { min-width: 90px; justify-content: center; }
        .th-links { min-width: 220px; }
        .th-actions { width: 70px; justify-content: flex-end; }

        .sort-icon {
          opacity: 0.6;
        }

        .table-body-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
