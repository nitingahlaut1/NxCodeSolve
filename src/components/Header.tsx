'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Flame,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  BarChart3,
  Shuffle,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Code2,
  LogIn,
  UserPlus
} from 'lucide-react';
import AuthModal from './AuthModal';
import AnalyticsModal from './AnalyticsModal';
import RandomProblemModal from './RandomProblemModal';

export default function Header() {
  const { user, logout, loginAsGuest } = useAuth();
  const { stats, exportProgress, importProgress, resetAll } = useProgress();
  const { theme, toggleTheme } = useTheme();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isGuest = user ? (user.id === 'guest_demo_user' || user.email?.includes('guest')) : false;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const ok = await importProgress(e.target.files[0]);
      if (ok) {
        alert('Progress backup successfully restored!');
      } else {
        alert('Failed to import backup file. Please check file format.');
      }
    }
  };

  const handleResetConfirm = async () => {
    if (confirm('Are you sure you want to reset all your problem progress? This action cannot be undone.')) {
      await resetAll();
      setProfileDropdownOpen(false);
    }
  };

  const streakCount = stats?.streak?.currentStreak || 0;
  const completedCount = stats?.completedQuestions || 0;
  const totalCount = stats?.totalQuestions || 476;
  const completionPercentage = stats?.completionPercentage || 0;

  return (
    <>
      <header className="header-root">
        <div className="header-container">
          {/* Brand */}
          <div className="brand-section">
            <div className="logo-icon-wrapper">
              <Code2 className="logo-icon" size={24} />
            </div>
            <div>
              <div className="brand-title-row">
                <h1 className="brand-title">NxCodeSolve</h1>
                <span className="brand-badge">A2Z DSA</span>
              </div>
              <p className="brand-subtitle">Striver&apos;s 476 Problem Master Tracker</p>
            </div>
          </div>

          {/* Center Quick Stats */}
          <div className="center-stats-bar">
            {/* Streak */}
            <div
              className={`stat-pill streak-pill ${streakCount > 0 ? 'streak-active' : ''}`}
              title={`${streakCount} Days Streak`}
            >
              <Flame size={18} className={streakCount > 0 ? 'flame-animated' : 'flame-dim'} />
              <span className="streak-text">{streakCount} Day{streakCount === 1 ? '' : 's'}</span>
            </div>

            {/* Quick Progress */}
            <div
              className="stat-pill progress-mini-pill"
              onClick={() => setAnalyticsOpen(true)}
              title="Click to view analytics"
            >
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{ width: `${Math.min(100, completionPercentage)}%` }}
                />
              </div>
              <span className="progress-mini-text">{completedCount} / {totalCount} ({completionPercentage}%)</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="header-actions">
            {/* Pick Random */}
            <button
              className="action-btn btn-secondary"
              onClick={() => setRandomModalOpen(true)}
              title="Pick a random problem to solve"
            >
              <Shuffle size={16} />
              <span className="btn-label">Random</span>
            </button>

            {/* Analytics */}
            <button
              className="action-btn btn-secondary"
              onClick={() => setAnalyticsOpen(true)}
              title="View Solved Analytics & Heatmap"
            >
              <BarChart3 size={16} />
              <span className="btn-label">Analytics</span>
            </button>

            {/* Theme Toggle */}
            <button
              className="action-btn icon-only"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="user-profile-menu">
                <button
                  className="avatar-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  title={user.displayName || user.email}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt="Avatar"
                    className="avatar-img"
                  />
                  <span className="avatar-name">{user.displayName || user.email.split('@')[0]}</span>
                  {isGuest && <span className="guest-badge">Guest</span>}
                </button>

                {profileDropdownOpen && (
                  <div className="dropdown-menu glass-panel animate-fade-in">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.displayName}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>

                    <div className="dropdown-divider" />

                    {/* If guest, give direct Sign In / Register button */}
                    {isGuest ? (
                      <>
                        <button
                          className="dropdown-item dropdown-item-primary"
                          onClick={() => {
                            setAuthMode('login');
                            setAuthModalOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <LogIn size={16} className="text-primary-accent" />
                          <span>Sign In / Sync Account</span>
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setAuthMode('register');
                            setAuthModalOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                        >
                          <UserPlus size={16} />
                          <span>Create Free Account</span>
                        </button>
                        <div className="dropdown-divider" />
                      </>
                    ) : (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setAuthMode('login');
                          setAuthModalOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                      >
                        <LogIn size={16} />
                        <span>Switch Account</span>
                      </button>
                    )}

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        exportProgress();
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <Download size={16} /> Export Progress (JSON)
                    </button>

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <Upload size={16} /> Import Progress
                    </button>

                    <button
                      className="dropdown-item text-danger"
                      onClick={handleResetConfirm}
                    >
                      <RotateCcw size={16} /> Reset All Progress
                    </button>

                    <div className="dropdown-divider" />

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <button
                  className="action-btn btn-ghost"
                  onClick={async () => {
                    await loginAsGuest();
                  }}
                  title="Explore immediately as Guest"
                >
                  <Sparkles size={16} className="text-amber" />
                  <span>Guest Mode</span>
                </button>

                <button
                  className="action-btn btn-primary"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                >
                  <UserIcon size={16} />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json"
          style={{ display: 'none' }}
        />
      </header>

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {analyticsOpen && (
        <AnalyticsModal onClose={() => setAnalyticsOpen(false)} />
      )}

      {randomModalOpen && (
        <RandomProblemModal onClose={() => setRandomModalOpen(false)} />
      )}

      <style jsx>{`
        .header-root {
          position: sticky;
          top: 0;
          z-index: 40;
          background: var(--bg-glass-strong);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-glass);
          padding: 12px 0;
          animation: fadeIn 0.3s var(--ease-out) forwards;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          transition: transform 0.25s var(--ease-spring), box-shadow 0.25s;
        }

        .brand-section:hover .logo-icon-wrapper {
          transform: scale(1.05) rotate(-3deg);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }

        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-title {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        [data-theme='light'] .brand-title {
          background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-badge {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.4);
          padding: 2px 7px;
          border-radius: 6px;
        }

        .brand-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .center-stats-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .streak-pill {
          color: var(--text-secondary);
        }

        .streak-active {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.35);
          color: #f59e0b;
        }

        .flame-animated {
          color: #f59e0b;
          animation: pulseGlow 1.8s infinite;
        }

        .flame-dim {
          color: var(--text-muted);
        }

        .progress-mini-pill {
          cursor: pointer;
        }

        .progress-mini-pill:hover {
          border-color: var(--border-highlight);
          transform: translateY(-2px);
          box-shadow: 0 2px 12px var(--accent-glow);
        }

        .mini-progress-track {
          width: 80px;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }

        [data-theme='light'] .mini-progress-track {
          background: rgba(0, 0, 0, 0.08);
        }

        .mini-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #06b6d4);
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .progress-mini-text {
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .action-btn:active {
          transform: scale(0.96);
        }

        .action-btn.icon-only {
          padding: 8px;
          border-radius: 10px;
          background: var(--bg-card);
          border-color: var(--border-subtle);
          color: var(--text-secondary);
        }

        .action-btn.icon-only:hover {
          color: var(--text-primary);
          border-color: var(--border-glass);
          background: var(--bg-card-hover);
        }

        .btn-secondary {
          background: var(--bg-card);
          border-color: var(--border-glass);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--border-highlight);
        }

        .btn-ghost {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .btn-ghost:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .auth-buttons-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-profile-menu {
          position: relative;
        }

        .avatar-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 12px 4px 4px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .avatar-btn:hover {
          border-color: var(--accent-primary);
        }

        .avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          object-fit: cover;
        }

        .avatar-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 220px;
          padding: 8px;
          z-index: 50;
          box-shadow: var(--shadow-lg);
        }

        .dropdown-header {
          padding: 8px 10px;
        }

        .dropdown-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 6px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .dropdown-item:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .guest-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .dropdown-item-primary {
          color: #818cf8 !important;
          font-weight: 600 !important;
        }

        .dropdown-item-primary:hover {
          background: rgba(99, 102, 241, 0.15) !important;
          color: #a5b4fc !important;
        }

        .text-primary-accent {
          color: #818cf8;
        }

        .text-amber {
          color: #f59e0b;
        }

        @media (max-width: 900px) {
          .center-stats-bar {
            display: none;
          }
          .btn-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
