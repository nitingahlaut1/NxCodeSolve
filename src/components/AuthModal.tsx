'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export default function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const { login, register, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email.trim(), password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Invalid email or password');
        }
      } else {
        if (!displayName.trim()) {
          setError('Please provide a display name');
          setLoading(false);
          return;
        }
        const res = await register(email.trim(), password, displayName.trim());
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Failed to create account');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    setError('');
    try {
      await loginAsGuest();
      onClose();
    } catch {
      setError('Failed to enter guest mode.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <>
      <div
        className="modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div
          className="modal-panel auth-modal-card glass-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Accent Bar */}
          <div className="card-top-accent" />

          {/* Modal Header */}
          <div className="auth-header">
            <div className="header-text-group">
              <h2 id="auth-modal-title" className="auth-title">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to track your 476 DSA problems & sync streaks'
                  : 'Start your journey to mastering Striver A2Z Sheet'}
              </p>
            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="tab-switcher-wrapper">
            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          {/* Modal Body Form */}
          <div className="auth-body">
            {error && (
              <div className="error-alert animate-fade-in">
                <AlertCircle size={17} className="error-icon" />
                <span className="error-text">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
              {mode === 'register' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label" htmlFor="auth-displayName">
                    Display Name
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">
                      <User size={17} />
                    </span>
                    <input
                      id="auth-displayName"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="form-input"
                      placeholder="e.g. AlgoMaster / Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading || guestLoading}
                      autoFocus={mode === 'register'}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">
                  Email Address
                </label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Mail size={17} />
                  </span>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || guestLoading}
                    autoFocus={mode === 'login'}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="auth-password">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span className="demo-hint">
                      Min. 6 chars
                    </span>
                  )}
                </div>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Lock size={17} />
                  </span>
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="form-input password-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || guestLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || guestLoading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                    <span>{mode === 'login' ? 'Sign In to NxCodeSolve' : 'Create Free Account'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="divider-row">
              <span className="divider-line" />
              <span className="divider-text">OR CONTINUE WITH</span>
              <span className="divider-line" />
            </div>

            {/* 1-Click Guest Button */}
            <button
              type="button"
              className="guest-btn"
              onClick={handleGuest}
              disabled={loading || guestLoading}
            >
              {guestLoading ? (
                <>
                  <Loader2 size={17} className="spinner text-amber" />
                  <span>Entering Guest Mode...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} className="text-amber" />
                  <span>Instant Guest Mode (No sign up needed)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-modal-card {
          width: 100%;
          max-width: 440px;
          background: var(--bg-surface);
          border: 1px solid var(--border-glass);
          border-radius: 22px;
          overflow: hidden;
          position: relative;
        }

        .card-top-accent {
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #6366f1, #06b6d4, #10b981);
        }

        .auth-header {
          padding: 24px 24px 16px 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .header-text-group {
          flex: 1;
        }

        .auth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .auth-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .modal-close-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s var(--ease-smooth);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
          border-color: var(--border-glass);
          transform: rotate(90deg);
        }

        .tab-switcher-wrapper {
          padding: 0 24px;
        }

        .tab-switcher {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 3px;
          gap: 3px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 0.84rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--ease-smooth);
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }

        .auth-body {
          padding: 20px 24px 26px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.35);
          border-radius: 12px;
          color: #fb7185;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .error-icon {
          flex-shrink: 0;
          color: #f43f5e;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
        }

        .demo-hint {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .input-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 3;
          transition: color 0.2s var(--ease-smooth);
        }

        .input-wrap:focus-within .input-icon {
          color: var(--accent-primary);
        }

        .form-input {
          width: 100%;
          height: 44px;
          padding: 0 14px 0 42px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          font-size: 0.9rem;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s var(--ease-smooth);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .form-input.password-input {
          padding-right: 42px;
        }

        .form-input:focus {
          border-color: var(--accent-primary);
          background: var(--bg-card-hover);
          box-shadow: 0 0 0 3px var(--accent-glow), inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* Prevent ugly white autofill */
        .form-input:-webkit-autofill,
        .form-input:-webkit-autofill:hover,
        .form-input:-webkit-autofill:focus,
        .form-input:-webkit-autofill:active {
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: var(--text-primary) !important;
          box-shadow: 0 0 0 1000px var(--bg-card) inset !important;
          -webkit-box-shadow: 0 0 0 1000px var(--bg-card) inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
          caret-color: var(--text-primary) !important;
        }

        .password-toggle-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          z-index: 3;
          transition: color 0.15s, background-color 0.15s;
        }

        .password-toggle-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          font-size: 0.92rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          margin-top: 4px;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
          transition: all 0.2s var(--ease-smooth);
        }

        .submit-btn:hover:not(:disabled) {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          filter: grayscale(0.2);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 2px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .divider-text {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .guest-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.09);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #fbbf24;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s var(--ease-smooth);
        }

        .guest-btn:hover:not(:disabled) {
          background: rgba(245, 158, 11, 0.18);
          border-color: rgba(245, 158, 11, 0.45);
          transform: translateY(-1px);
        }

        .guest-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .text-amber {
          color: #f59e0b;
        }
      `}</style>
    </>
  );
}
