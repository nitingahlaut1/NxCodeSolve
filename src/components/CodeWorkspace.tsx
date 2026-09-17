'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { useTheme } from '@/context/ThemeContext';
import {
  ProblemDetail,
  SupportedLanguage,
  ExecutionResult,
  SubmissionResult
} from '@/types';
import { getProblemDetailById } from '@/data/problemDetails';
import dsaQuestions from '@/data/dsaQuestions.json';
import { executeTestCases, executeCustomTestCase, evaluateSubmission } from '@/lib/codeRunner';
import CodeEditor from './CodeEditor';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCheck,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  FileText,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Code2,
  Flame
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

function formatInlineText(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-xs text-sky-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedDescription(desc: string) {
  if (!desc) return null;
  const blocks = desc.split(/(```[\s\S]*?```|!\[.*?\]\(.*?\)|###\s+[^\n]+)/g).filter(Boolean);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Code blocks
    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      const lines = trimmed.slice(3, -3).trim().split('\n');
      const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
      const codeContent = lang ? lines.slice(1).join('\n') : lines.join('\n');
      return (
        <div key={idx} className="my-3 overflow-x-auto rounded-lg bg-slate-900/90 p-3 border border-slate-800/80 font-mono text-xs sm:text-sm text-sky-300 shadow-inner">
          <pre className="whitespace-pre leading-relaxed">{codeContent}</pre>
        </div>
      );
    }

    // Markdown Images ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      return (
        <div key={idx} className="my-4 overflow-hidden rounded-xl border border-sky-500/20 bg-slate-950/80 p-3 shadow-lg flex flex-col items-center justify-center">
          <img src={src} alt={alt || 'Problem Diagram'} className="max-h-80 w-auto rounded-lg object-contain shadow-md" />
        </div>
      );
    }

    // Headings ###
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="mt-5 mb-2 text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }

    // Paragraph
    return (
      <div key={idx} className="my-2 leading-relaxed text-slate-300 text-sm">
        {trimmed.split('\n').map((line, lIdx) => {
          if (!line.trim()) return null;
          if (line.trim().startsWith('- ')) {
            return (
              <li key={lIdx} className="ml-4 list-disc text-slate-300 my-1">
                {formatInlineText(line.trim().slice(2))}
              </li>
            );
          }
          return (
            <p key={lIdx} className="mb-2">
              {formatInlineText(line)}
            </p>
          );
        })}
      </div>
    );
  });
}

interface CodeWorkspaceProps {
  problemId: number;
}

export default function CodeWorkspace({ problemId }: CodeWorkspaceProps) {
  const router = useRouter();
  const { progress, updateStatus, updateProblemDetails, stats } = useProgress();
  const { theme, toggleTheme } = useTheme();

  const problem: ProblemDetail = useMemo(() => {
    return getProblemDetailById(problemId);
  }, [problemId]);

  // All problems list for prev/next navigation
  const allProblems = dsaQuestions;
  const currentIdx = allProblems.findIndex(p => p.id === problemId);
  const prevProblem = currentIdx > 0 ? allProblems[currentIdx - 1] : null;
  const nextProblem = currentIdx < allProblems.length - 1 ? allProblems[currentIdx + 1] : null;

  // Workspace state
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('javascript');
  const [code, setCode] = useState<string>(() => {
    return progress[problemId]?.code || problem.starterCodes.javascript;
  });

  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'editorial' | 'notes'>('description');
  const [activeBottomTab, setActiveBottomTab] = useState<'testcase' | 'testresult'>('testcase');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [isCustomTestCase, setIsCustomTestCase] = useState<boolean>(false);
  const [customInputStr, setCustomInputStr] = useState<string>(() => {
    return problem.testCases[0]?.rawInputDisplay || '12';
  });

  // Runner state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[] | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Notes state
  const [notesText, setNotesText] = useState<string>(() => progress[problemId]?.notes || '');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  // Synchronize when problem changes
  useEffect(() => {
    const savedCode = progress[problemId]?.code;
    const savedLang = progress[problemId]?.language as SupportedLanguage;
    const langToUse = (savedLang && ['javascript', 'typescript', 'python', 'cpp', 'java'].includes(savedLang))
      ? savedLang
      : selectedLanguage;

    if (savedLang && savedLang !== selectedLanguage) {
      setSelectedLanguage(savedLang);
    }

    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(problem.starterCodes[langToUse] || problem.starterCodes.javascript);
    }
    setNotesText(progress[problemId]?.notes || '');
    setExecutionResults(null);
    setSubmissionResult(null);
    setSelectedTestCaseIdx(0);
    setIsCustomTestCase(false);
    if (problem.testCases[0]) {
      setCustomInputStr(problem.testCases[0].rawInputDisplay || '');
    }
  }, [problemId]); // Only trigger when the actual problem changes

  // Change Language template
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);
    setCode(problem.starterCodes[newLang] || problem.starterCodes.javascript);
  };

  const handleResetCode = () => {
    if (confirm('Reset code to default starter template?')) {
      const defaultTemplate = problem.starterCodes[selectedLanguage] || problem.starterCodes.javascript;
      setCode(defaultTemplate);
      updateProblemDetails(problemId, { code: defaultTemplate, language: selectedLanguage });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run Code against sample test cases
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveBottomTab('testresult');
    setSubmissionResult(null);

    try {
      if (isCustomTestCase) {
        const result = await executeCustomTestCase(code, problem.fnName, customInputStr, selectedLanguage);
        setExecutionResults([result]);
      } else {
        const results = await executeTestCases(code, problem.fnName, problem.testCases, selectedLanguage);
        setExecutionResults(results);
      }
    } catch (err) {
      console.error('Execution error', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code against full suite (including hidden edge cases)
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveBottomTab('testresult');
    setExecutionResults(null);

    try {
      const result = await evaluateSubmission(code, problem, selectedLanguage);
      setSubmissionResult(result);

      // Save user code
      await updateProblemDetails(problemId, { code, language: selectedLanguage });

      if (result.status === 'ACCEPTED') {
        // Mark completed in user progress
        await updateStatus(problemId, 'completed');

        // Trigger confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Submission evaluation error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-save notes with debounce
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNotesText(text);
    setNotesSaved(false);
  };

  const handleSaveNotes = async () => {
    await updateProblemDetails(problemId, { notes: notesText });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitCode();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, selectedLanguage, problem, isCustomTestCase, customInputStr]);

  const isCurrentProblemCompleted = progress[problemId]?.status === 'completed';

  return (
    <div className="workspace-root">
      {/* ============================================================
          TOP NAVIGATION BAR
          ============================================================ */}
      <header className="workspace-header glass-panel">
        <div className="header-left">
          <Link href="/" className="nav-btn back-btn" title="Back to All 476 Problems">
            <ArrowLeft size={16} />
            <span className="brand-badge-name">NxCodeSolve</span>
          </Link>

          <div className="problem-nav-pill">
            <button
              className="arrow-nav-btn"
              disabled={!prevProblem}
              onClick={() => prevProblem && router.push(`/solve/${prevProblem.id}`)}
              title={prevProblem ? `Previous: #${prevProblem.id} ${prevProblem.title}` : 'No previous problem'}
            >
              <ChevronLeft size={17} />
            </button>
            <span className="problem-pill-title">
              #{problem.id}. {problem.title}
            </span>
            <button
              className="arrow-nav-btn"
              disabled={!nextProblem}
              onClick={() => nextProblem && router.push(`/solve/${nextProblem.id}`)}
              title={nextProblem ? `Next: #${nextProblem.id} ${nextProblem.title}` : 'No next problem'}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>

          {isCurrentProblemCompleted && (
            <span className="status-badge-solved">
              <CheckCircle2 size={14} /> Solved
            </span>
          )}
        </div>

        {/* Center/Right Action Buttons */}
        <div className="header-right">
          <button
            className="action-btn btn-run"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            title="Run code against sample test cases (Ctrl + Enter)"
          >
            <Play size={15} className={isRunning ? 'animate-pulse' : ''} fill="currentColor" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          <button
            className="action-btn btn-submit"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            title="Submit solution for full grading (Ctrl + Shift + Enter)"
          >
            <CheckCheck size={16} />
            <span>{isSubmitting ? 'Grading...' : 'Submit'}</span>
          </button>

          <button
            className="action-btn icon-only-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* ============================================================
          MAIN DUAL-PANE WORKSPACE BODY
          ============================================================ */}
      <div className="workspace-body">
        {/* LEFT PANE: Problem Info / Editorial / Notes */}
        <div className="left-pane glass-panel">
          <div className="pane-tabs-header">
            <button
              className={`pane-tab-btn ${activeLeftTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('description')}
            >
              <FileText size={15} />
              <span>Description</span>
            </button>
            <button
              className={`pane-tab-btn ${activeLeftTab === 'editorial' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('editorial')}
            >
              <Lightbulb size={15} />
              <span>Editorial</span>
            </button>
            <button
              className={`pane-tab-btn ${activeLeftTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('notes')}
            >
              <BookOpen size={15} />
              <span>Notes {notesText && '•'}</span>
            </button>
          </div>

          <div className="pane-content custom-scrollbar">
            {/* TAB 1: DESCRIPTION */}
            {activeLeftTab === 'description' && (
              <div className="description-view animate-fade-in">
                <div className="problem-title-block">
                  <h1 className="problem-heading">
                    {problem.id}. {problem.title}
                  </h1>
                  <div className="problem-meta-row">
                    <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                    <span className="meta-tag">{problem.step}</span>
                    <span className="meta-tag topic-tag">{problem.topic}</span>
                  </div>
                </div>

                {/* External links */}
                <div className="resource-links-row">
                  {problem.leetcodeUrl && (
                    <a
                      href={problem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="res-link lc-res"
                    >
                      <ExternalLink size={13} /> LeetCode
                    </a>
                  )}
                  {problem.youtubeUrl && (
                    <a
                      href={problem.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="res-link yt-res"
                    >
                      <YouTubeIcon size={14} /> Video Solution
                    </a>
                  )}
                  {problem.tufUrl && (
                    <a
                      href={problem.tufUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="res-link tuf-res"
                    >
                      <BookOpen size={13} /> takeUforward
                    </a>
                  )}
                </div>

                {/* Pattern Visual Card for Pattern Questions (IDs 417-438) */}
                {417 <= problem.id && problem.id <= 438 && (
                  <div className="pattern-visual-card mb-6 overflow-hidden rounded-xl border border-sky-500/25 bg-slate-900/90 p-4 shadow-xl backdrop-blur-sm">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                        <Sparkles size={14} className="text-amber-400" /> Pattern #{problem.id - 416} Visual Blueprint (N = 4)
                      </span>
                      <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                        Star & Number Matrix
                      </span>
                    </div>
                    <div className="flex items-center justify-center rounded-lg bg-slate-950/70 p-2 border border-slate-800/50">
                      <img
                        src={`/patterns/pattern-${problem.id - 416}.svg`}
                        alt={`Pattern ${problem.id - 416} Diagram`}
                        className="max-h-72 w-full object-contain rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Markdown Description */}
                <div className="problem-description-text">
                  {renderFormattedDescription(problem.description)}
                </div>

                {/* Examples */}
                <div className="examples-section">
                  <h3 className="section-title">Examples</h3>
                  {problem.examples.map((eg, idx) => (
                    <div key={eg.id || idx} className="example-card">
                      <div className="example-header">Example {idx + 1}:</div>
                      <div className="example-row">
                        <span className="example-label">Input:</span>
                        <code className="example-code">{eg.input}</code>
                      </div>
                      <div className="example-row">
                        <span className="example-label">Output:</span>
                        <code className="example-code output-code">{eg.output}</code>
                      </div>
                      {eg.explanation && (
                        <div className="example-row">
                          <span className="example-label">Explanation:</span>
                          <span className="example-explanation">{eg.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="constraints-section">
                    <h3 className="section-title">Constraints</h3>
                    <ul className="constraints-list">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>
                          <code>{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hints */}
                {problem.hints && problem.hints.length > 0 && (
                  <div className="hints-section">
                    <h3 className="section-title">Hints & Tips</h3>
                    <div className="hints-list">
                      {problem.hints.map((h, i) => (
                        <div key={i} className="hint-box">
                          <Lightbulb size={15} className="hint-icon" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EDITORIAL */}
            {activeLeftTab === 'editorial' && (
              <div className="editorial-view animate-fade-in">
                {problem.editorial ? (
                  <>
                    <div className="editorial-card">
                      <h3 className="editorial-section-title">Intuition</h3>
                      <p className="editorial-text">{problem.editorial.intuition}</p>
                    </div>

                    <div className="editorial-card">
                      <h3 className="editorial-section-title">Optimal Approach</h3>
                      <p className="editorial-text">{problem.editorial.approach}</p>
                    </div>

                    <div className="complexity-grid">
                      <div className="complexity-item">
                        <span className="complexity-label">Time Complexity</span>
                        <code className="complexity-val">{problem.editorial.timeComplexity}</code>
                      </div>
                      <div className="complexity-item">
                        <span className="complexity-label">Space Complexity</span>
                        <code className="complexity-val">{problem.editorial.spaceComplexity}</code>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-editorial">
                    <Lightbulb size={28} className="text-amber" />
                    <p>Review standard Striver A2Z DSA optimal approach for #{problem.id}.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: NOTES */}
            {activeLeftTab === 'notes' && (
              <div className="notes-view animate-fade-in">
                <div className="notes-header">
                  <div>
                    <h3 className="notes-title">Personal Problem Notes</h3>
                    <p className="notes-subtitle">Notes are saved to your account automatically</p>
                  </div>
                  <button className="save-notes-btn" onClick={handleSaveNotes}>
                    {notesSaved ? (
                      <>
                        <Check size={14} /> Saved!
                      </>
                    ) : (
                      'Save Notes'
                    )}
                  </button>
                </div>
                <textarea
                  className="notes-textarea"
                  placeholder="Record your key takeaways, tricky edge cases, or complexity notes here..."
                  value={notesText}
                  onChange={handleNotesChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Code Editor (Top) & Test Runner / Console (Bottom) */}
        <div className="right-pane">
          {/* Top Half: Code Editor */}
          <div className="editor-container glass-panel">
            {/* Editor Toolbar */}
            <div className="editor-toolbar">
              <div className="lang-select-group">
                <Code2 size={16} className="text-primary-accent" />
                <select
                  className="lang-select"
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                >
                  <option value="javascript">JavaScript (ES6+)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC 11)</option>
                  <option value="java">Java (OpenJDK 17)</option>
                </select>
              </div>

              <div className="editor-actions">
                <button
                  className="editor-tool-btn"
                  onClick={handleResetCode}
                  title="Reset to starter code"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
                <button
                  className="editor-tool-btn"
                  onClick={handleCopyCode}
                  title="Copy code to clipboard"
                >
                  {copiedCode ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Code Editor with Autocomplete & Auto-closing Brackets */}
            <div className="editor-wrapper">
              <CodeEditor
                code={code}
                onChange={setCode}
                language={selectedLanguage}
                theme={theme}
                onRunCode={handleRunCode}
                onSubmitCode={handleSubmitCode}
              />
            </div>
          </div>

          {/* Bottom Half: Test Cases & Console Runner */}
          <div className="runner-container glass-panel">
            <div className="runner-tabs-header">
              <div className="tab-buttons-left">
                <button
                  className={`runner-tab-btn ${activeBottomTab === 'testcase' ? 'active' : ''}`}
                  onClick={() => setActiveBottomTab('testcase')}
                >
                  <Terminal size={14} />
                  <span>Testcase</span>
                </button>
                <button
                  className={`runner-tab-btn ${activeBottomTab === 'testresult' ? 'active' : ''}`}
                  onClick={() => setActiveBottomTab('testresult')}
                >
                  <Clock size={14} />
                  <span>Test Result</span>
                  {submissionResult && (
                    <span
                      className={`result-dot ${
                        submissionResult.status === 'ACCEPTED' ? 'dot-success' : 'dot-danger'
                      }`}
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="runner-body custom-scrollbar">
              {/* TAB 1: TEST CASES INPUT */}
              {activeBottomTab === 'testcase' && (
                <div className="testcase-view animate-fade-in">
                  <div className="testcase-pills-row">
                    {problem.testCases.map((tc, idx) => (
                      <button
                        key={tc.id || idx}
                        className={`case-pill ${
                          !isCustomTestCase && selectedTestCaseIdx === idx ? 'active' : ''
                        }`}
                        onClick={() => {
                          setIsCustomTestCase(false);
                          setSelectedTestCaseIdx(idx);
                        }}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      className={`case-pill custom-pill ${isCustomTestCase ? 'active' : ''}`}
                      onClick={() => setIsCustomTestCase(true)}
                    >
                      + Custom Testcase
                    </button>
                  </div>

                  {!isCustomTestCase ? (
                    <div className="testcase-input-display">
                      <div className="field-label">Arguments:</div>
                      <div className="case-args-box">
                        <code>{problem.testCases[selectedTestCaseIdx]?.rawInputDisplay || JSON.stringify(problem.testCases[selectedTestCaseIdx]?.args)}</code>
                      </div>
                      <div className="field-label mt-2">Expected Output:</div>
                      <div className="case-expected-box">
                        <code>{JSON.stringify(problem.testCases[selectedTestCaseIdx]?.expected)}</code>
                      </div>
                    </div>
                  ) : (
                    <div className="custom-input-editor">
                      <label className="field-label">Custom Function Input (JSON or comma-separated):</label>
                      <input
                        type="text"
                        className="custom-input-field"
                        value={customInputStr}
                        onChange={(e) => setCustomInputStr(e.target.value)}
                        placeholder="e.g. 153 or 20, 40"
                      />
                      <span className="custom-input-tip">
                        Click <strong>Run</strong> to test your code against this custom argument.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TEST RESULTS / OUTPUT */}
              {activeBottomTab === 'testresult' && (
                <div className="testresult-view animate-fade-in">
                  {isRunning || isSubmitting ? (
                    <div className="running-loader">
                      <div className="spinner-glow" />
                      <span>Evaluating your algorithm...</span>
                    </div>
                  ) : submissionResult ? (
                    /* SUBMISSION EVALUATION BANNER */
                    <div className="submission-outcome">
                      <div
                        className={`outcome-banner ${
                          submissionResult.status === 'ACCEPTED'
                            ? 'banner-success'
                            : 'banner-failure'
                        }`}
                      >
                        <div className="banner-icon-wrap">
                          {submissionResult.status === 'ACCEPTED' ? (
                            <CheckCircle2 size={24} />
                          ) : (
                            <XCircle size={24} />
                          )}
                        </div>
                        <div>
                          <div className="outcome-title">
                            {submissionResult.status === 'ACCEPTED'
                              ? 'Accepted!'
                              : submissionResult.status === 'WRONG_ANSWER'
                              ? 'Wrong Answer'
                              : 'Runtime Error'}
                          </div>
                          <div className="outcome-stats">
                            Passed {submissionResult.totalPassed} / {submissionResult.totalTests} test cases • Runtime: {submissionResult.runtimeMs} ms
                          </div>
                        </div>

                        {submissionResult.status === 'ACCEPTED' && (
                          <div className="celebrate-chip">
                            <Sparkles size={15} /> All Tests Passed
                          </div>
                        )}
                      </div>

                      {submissionResult.failedCase && (
                        <div className="failed-case-card">
                          <div className="failed-card-header">
                            <AlertTriangle size={15} /> Failed Testcase Detail:
                          </div>
                          <div className="diff-row">
                            <span className="diff-label">Input:</span>
                            <code>{JSON.stringify(submissionResult.failedCase.args)}</code>
                          </div>
                          <div className="diff-row">
                            <span className="diff-label text-emerald">Expected Output:</span>
                            <code className="text-emerald">
                              {JSON.stringify(submissionResult.failedCase.expected)}
                            </code>
                          </div>
                          <div className="diff-row">
                            <span className="diff-label text-rose">Your Output:</span>
                            <code className="text-rose">
                              {JSON.stringify(submissionResult.failedCase.actual)}
                            </code>
                          </div>
                          {submissionResult.failedCase.error && (
                            <div className="diff-row">
                              <span className="diff-label text-rose">Error Log:</span>
                              <pre className="error-pre">{submissionResult.failedCase.error}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : executionResults && executionResults.length > 0 ? (
                    /* SAMPLE RUN RESULTS */
                    <div className="run-results-block">
                      <div className="testcase-pills-row">
                        {executionResults.map((r, idx) => (
                          <button
                            key={r.testCaseId || idx}
                            className={`case-pill ${selectedTestCaseIdx === idx ? 'active' : ''} ${
                              r.passed ? 'pill-passed' : 'pill-failed'
                            }`}
                            onClick={() => setSelectedTestCaseIdx(idx)}
                          >
                            <span className="status-dot" /> Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {executionResults[selectedTestCaseIdx] && (
                        <div className="case-result-detail">
                          <div
                            className={`status-pill-line ${
                              executionResults[selectedTestCaseIdx].passed
                                ? 'text-emerald'
                                : 'text-rose'
                            }`}
                          >
                            {executionResults[selectedTestCaseIdx].passed ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            <span className="font-bold">
                              {executionResults[selectedTestCaseIdx].passed
                                ? 'Passed'
                                : 'Wrong Answer'}
                            </span>
                            <span className="runtime-label">
                              ({executionResults[selectedTestCaseIdx].executionTimeMs} ms)
                            </span>
                          </div>

                          <div className="result-field">
                            <span className="field-label">Input:</span>
                            <div className="result-code-box">
                              <code>
                                {JSON.stringify(executionResults[selectedTestCaseIdx].args)}
                              </code>
                            </div>
                          </div>

                          <div className="result-field">
                            <span className="field-label">Output:</span>
                            <div className="result-code-box">
                              <code
                                className={
                                  executionResults[selectedTestCaseIdx].passed
                                    ? 'text-emerald'
                                    : 'text-rose'
                                }
                              >
                                {JSON.stringify(executionResults[selectedTestCaseIdx].actual)}
                              </code>
                            </div>
                          </div>

                          {executionResults[selectedTestCaseIdx].expected !== null && (
                            <div className="result-field">
                              <span className="field-label">Expected:</span>
                              <div className="result-code-box">
                                <code className="text-emerald">
                                  {JSON.stringify(executionResults[selectedTestCaseIdx].expected)}
                                </code>
                              </div>
                            </div>
                          )}

                          {executionResults[selectedTestCaseIdx].stdout &&
                            executionResults[selectedTestCaseIdx].stdout.length > 0 && (
                              <div className="result-field">
                                <span className="field-label">Stdout (console.log):</span>
                                <div className="stdout-box">
                                  {executionResults[selectedTestCaseIdx].stdout.map((log, lIdx) => (
                                    <div key={lIdx} className="stdout-line">
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {executionResults[selectedTestCaseIdx].error && (
                            <div className="result-field">
                              <span className="field-label text-rose">Runtime Error:</span>
                              <pre className="error-pre">
                                {executionResults[selectedTestCaseIdx].error}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-results-prompt">
                      <Terminal size={32} className="text-muted" />
                      <p>You must run your code first.</p>
                      <span>Click <strong>Run</strong> for sample cases or <strong>Submit</strong> for full verification.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .workspace-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background: var(--bg-base);
          color: var(--text-primary);
          overflow: hidden;
        }

        /* HEADER */
        .workspace-header {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid var(--border-glass);
          background: var(--bg-glass-strong);
          z-index: 20;
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 9px;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-primary);
        }

        .brand-badge-name {
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .problem-nav-pill {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 9px;
          padding: 2px 4px;
        }

        .arrow-nav-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 4px 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }

        .arrow-nav-btn:hover:not(:disabled) {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        .arrow-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .problem-pill-title {
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0 10px;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge-solved {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.35);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 9px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .btn-run {
          background: var(--bg-card);
          border-color: var(--border-glass);
          color: var(--text-primary);
        }

        .btn-run:hover:not(:disabled) {
          background: var(--bg-card-hover);
          border-color: var(--border-highlight);
          transform: translateY(-1px);
        }

        .btn-submit {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
        }

        .btn-submit:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);
        }

        .icon-only-btn {
          padding: 7px;
          border-radius: 9px;
          background: var(--bg-card);
          border-color: var(--border-subtle);
          color: var(--text-secondary);
        }

        .icon-only-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        /* BODY LAYOUT */
        .workspace-body {
          flex: 1;
          display: grid;
          grid-template-columns: 45% 55%;
          gap: 8px;
          padding: 8px;
          overflow: hidden;
        }

        /* LEFT PANE */
        .left-pane {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 14px;
          overflow: hidden;
        }

        .pane-tabs-header {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          gap: 4px;
        }

        .pane-tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }

        .pane-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .pane-tab-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .pane-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .problem-title-block {
          margin-bottom: 16px;
        }

        .problem-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .problem-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meta-tag {
          font-size: 0.75rem;
          padding: 3px 8px;
          border-radius: 6px;
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
        }

        .topic-tag {
          color: #818cf8;
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(99, 102, 241, 0.1);
        }

        .resource-links-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .res-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 7px;
          font-size: 0.76rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s;
        }

        .res-link:hover {
          transform: translateY(-1px);
        }

        .lc-res {
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .yt-res {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .tuf-res {
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .problem-description-text {
          font-size: 0.92rem;
          line-height: 1.65;
          color: var(--text-primary);
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .example-card {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .example-header {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .example-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 0.85rem;
        }

        .example-label {
          color: var(--text-muted);
          font-weight: 600;
          min-width: 85px;
        }

        .example-code {
          font-family: var(--font-code);
          background: var(--bg-surface);
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
        }

        .output-code {
          color: #38bdf8;
          font-weight: 600;
        }

        .example-explanation {
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .constraints-section {
          margin-top: 24px;
        }

        .constraints-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .hints-section {
          margin-top: 24px;
        }

        .hints-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hint-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 10px;
          font-size: 0.84rem;
          color: var(--text-primary);
          line-height: 1.45;
        }

        .hint-icon {
          color: #f59e0b;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .editorial-view {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .editorial-card {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 16px;
        }

        .editorial-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .editorial-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .complexity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .complexity-item {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .complexity-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .complexity-val {
          font-family: var(--font-code);
          font-size: 0.95rem;
          color: #818cf8;
          font-weight: 700;
        }

        .notes-view {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 12px;
        }

        .notes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notes-title {
          font-size: 1rem;
          font-weight: 700;
        }

        .notes-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .save-notes-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          background: var(--accent-primary);
          color: #ffffff;
          border: none;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .notes-textarea {
          flex: 1;
          min-height: 320px;
          padding: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.88rem;
          line-height: 1.5;
          resize: none;
          outline: none;
        }

        .notes-textarea:focus {
          border-color: var(--accent-primary);
        }

        /* RIGHT PANE */
        .right-pane {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
        }

        .editor-container {
          flex: 6;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 14px;
          overflow: hidden;
        }

        .editor-toolbar {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .lang-select-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lang-select {
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-glass);
          border-radius: 7px;
          padding: 4px 10px;
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .editor-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .editor-tool-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 6px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .editor-tool-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
          border-color: var(--border-subtle);
        }

        .editor-wrapper {
          flex: 1;
          display: flex;
          background: #090d16;
          position: relative;
          overflow: hidden;
          min-height: 260px;
          height: 100%;
        }

        [data-theme='light'] .editor-wrapper {
          background: #f8fafc;
        }

        .monaco-editor-shell {
          width: 100%;
          height: 100%;
          min-height: 260px;
        }

        /* RUNNER / CONSOLE */
        .runner-container {
          flex: 4;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 14px;
          overflow: hidden;
        }

        .runner-tabs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 10px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .tab-buttons-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .runner-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 600;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }

        .runner-tab-btn:hover {
          color: var(--text-primary);
        }

        .runner-tab-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .result-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
        }

        .dot-success {
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .dot-danger {
          background: #f43f5e;
          box-shadow: 0 0 6px #f43f5e;
        }

        .runner-body {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
        }

        .testcase-pills-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .case-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .case-pill:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        .case-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
        }

        .case-pill.pill-passed {
          border-color: rgba(16, 185, 129, 0.4);
        }

        .case-pill.pill-failed {
          border-color: rgba(244, 63, 94, 0.4);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: currentColor;
        }

        .field-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .case-args-box,
        .case-expected-box,
        .result-code-box {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: var(--font-code);
          font-size: 0.85rem;
        }

        .custom-input-field {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-code);
          font-size: 0.85rem;
          outline: none;
        }

        .custom-input-tip {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 6px;
          display: block;
        }

        .running-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .spinner-glow {
          width: 28px;
          height: 28px;
          border: 3px solid rgba(99, 102, 241, 0.2);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .submission-outcome {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .outcome-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          position: relative;
        }

        .banner-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
        }

        .banner-failure {
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.35);
          color: #f43f5e;
        }

        .outcome-title {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .outcome-stats {
          font-size: 0.8rem;
          color: var(--text-primary);
          opacity: 0.9;
        }

        .celebrate-chip {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.25);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .failed-case-card {
          background: var(--bg-card);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .failed-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #f43f5e;
        }

        .diff-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 0.84rem;
        }

        .diff-label {
          min-width: 110px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .error-pre {
          background: rgba(0, 0, 0, 0.4);
          padding: 8px;
          border-radius: 6px;
          color: #f87171;
          font-size: 0.78rem;
          overflow-x: auto;
          font-family: var(--font-code);
        }

        .status-pill-line {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.95rem;
          margin-bottom: 12px;
        }

        .runtime-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .result-field {
          margin-bottom: 10px;
        }

        .stdout-box {
          background: #000000;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: var(--font-code);
          font-size: 0.82rem;
          color: #a3e635;
          max-height: 120px;
          overflow-y: auto;
        }

        .stdout-line {
          line-height: 1.4;
        }

        .empty-results-prompt,
        .empty-editorial {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 180px;
          gap: 8px;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-results-prompt p {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-results-prompt span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .text-emerald {
          color: #10b981;
        }

        .text-rose {
          color: #f43f5e;
        }

        .text-primary-accent {
          color: var(--accent-primary);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-glass);
          border-radius: 4px;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .workspace-body {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }
          .problem-pill-title {
            max-width: 140px;
          }
        }
      `}</style>
    </div>
  );
}
