'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import ProgressDashboard from '@/components/ProgressDashboard';
import FilterToolbar from '@/components/FilterToolbar';
import StepAccordion from '@/components/StepAccordion';
import TableView from '@/components/TableView';
import KanbanView from '@/components/KanbanView';
import ProblemDrawer from '@/components/ProblemDrawer';
import { useProgress } from '@/context/ProgressContext';
import { Problem } from '@/types';
import dsaQuestions from '@/data/dsaQuestions.json';
import { SearchX, Sparkles, CheckCheck } from 'lucide-react';

export default function Home() {
  const {
    progress,
    searchQuery,
    difficultyFilter,
    statusFilter,
    stepFilter,
    viewMode
  } = useProgress();

  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);

  // Filter problems based on search, difficulty, status, and step
  const filteredProblems = useMemo(() => {
    return (dsaQuestions as Problem[]).filter(prob => {
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = prob.title.toLowerCase().includes(q);
        const matchTopic = prob.topic.toLowerCase().includes(q);
        const matchStep = prob.step.toLowerCase().includes(q);
        const matchId = String(prob.id) === q || `#${prob.id}` === q;
        if (!matchTitle && !matchTopic && !matchStep && !matchId) {
          return false;
        }
      }

      // Difficulty filter
      if (difficultyFilter !== 'All' && prob.difficulty !== difficultyFilter) {
        return false;
      }

      // Step filter
      if (stepFilter !== 'All' && prob.step !== stepFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        const pProg = progress[prob.id];
        const status = pProg?.status || 'todo';
        if (statusFilter === 'bookmarked') {
          if (!pProg?.bookmarked) return false;
        } else if (status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, difficultyFilter, statusFilter, stepFilter, progress]);

  // Group filtered problems by Step
  const stepGroups = useMemo(() => {
    // Preserve full 18 steps order
    const stepOrder = Array.from(new Set(dsaQuestions.map(q => q.step)));
    const groups: { stepName: string; problems: Problem[] }[] = [];

    for (const stepName of stepOrder) {
      const stepProbs = filteredProblems.filter(p => p.step === stepName);
      if (stepProbs.length > 0) {
        groups.push({ stepName, problems: stepProbs });
      }
    }

    return groups;
  }, [filteredProblems]);

  // Accordion expanded states (default: first 3 steps open)
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const stepOrder = Array.from(new Set(dsaQuestions.map(q => q.step)));
    stepOrder.slice(0, 3).forEach(s => {
      initial[s] = true;
    });
    return initial;
  });

  const toggleStep = (stepName: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepName]: !prev[stepName]
    }));
  };

  const allExpanded = useMemo(() => {
    if (stepGroups.length === 0) return false;
    return stepGroups.every(g => expandedSteps[g.stepName]);
  }, [stepGroups, expandedSteps]);

  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    const updated: Record<string, boolean> = {};
    stepGroups.forEach(g => {
      updated[g.stepName] = nextState;
    });
    setExpandedSteps(updated);
  };

  return (
    <div className="app-root">
      <Header />

      <main className="main-content">
        {/* Top Progress Dashboard */}
        <ProgressDashboard />

        {/* Filters and Controls */}
        <FilterToolbar
          onToggleExpandAll={toggleExpandAll}
          allExpanded={allExpanded}
        />

        {/* Content Views */}
        {filteredProblems.length === 0 ? (
          <div className="no-results-box glass-panel animate-fade-in">
            <SearchX size={44} className="no-results-icon" />
            <h3 className="no-results-title">No Matching Problems Found</h3>
            <p className="no-results-desc">
              Try adjusting your search terms, changing the difficulty filter, or resetting status filters.
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'accordion' && (
              <div className="step-accordions-container">
                {stepGroups.map(group => (
                  <StepAccordion
                    key={group.stepName}
                    stepName={group.stepName}
                    problems={group.problems}
                    isOpen={Boolean(expandedSteps[group.stepName])}
                    onToggle={() => toggleStep(group.stepName)}
                    onOpenDrawer={problem => setActiveProblem(problem)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <TableView
                problems={filteredProblems}
                onOpenDrawer={problem => setActiveProblem(problem)}
              />
            )}

            {viewMode === 'cards' && (
              <KanbanView
                problems={filteredProblems}
                onOpenDrawer={problem => setActiveProblem(problem)}
              />
            )}
          </>
        )}
      </main>

      {/* Slide-over / Modal Drawer for problem notes & code */}
      <ProblemDrawer
        problem={activeProblem}
        onClose={() => setActiveProblem(null)}
      />

      {/* Footer */}
      <footer className="footer-root">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">NxCodeSolve</span>
            <span className="footer-tagline">Built for aspiring top-tier software engineers.</span>
          </div>
          <div className="footer-right">
            <span>476 Handcrafted Problems • Striver A2Z DSA Complete Sheet</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-base);
        }

        .main-content {
          flex: 1;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 24px 60px;
        }

        .step-accordions-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-results-box {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border-radius: 16px;
        }

        .no-results-icon {
          color: var(--text-muted);
          opacity: 0.7;
        }

        .no-results-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .no-results-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          max-width: 460px;
          line-height: 1.5;
        }

        .footer-root {
          border-top: 1px solid var(--border-glass);
          background: var(--bg-surface);
          padding: 24px 0;
          margin-top: auto;
          animation: fadeIn 0.4s 0.2s var(--ease-out) both;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-brand {
          font-weight: 800;
          color: var(--text-primary);
        }

        .footer-right {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
