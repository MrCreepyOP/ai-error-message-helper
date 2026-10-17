import React from 'react';

export function Navbar({
  backendStatus,
  historyCount,
  onOpenHistory,
  autoSave,
  onToggleAutoSave
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand & Logo */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
          <div className="brand-text-group">
            <span className="brand-title">
              <span className="brand-gradient">AI Error Message Helper</span>
            </span>
            <span className="brand-subtitle">AI-Powered Debugging Assistant</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="navbar-actions">
          {/* Backend Status Indicator */}
          <div
            className="status-indicator"
            title={
              backendStatus.online
                ? `Backend Online (Model: ${backendStatus.model || 'Gemini'})`
                : 'Backend Offline: Start backend on port 5004'
            }
          >
            <span
              className={`status-dot ${
                backendStatus.online ? 'online' : backendStatus.checking ? 'checking' : 'offline'
              }`}
            />
            <span>
              {backendStatus.online ? 'Backend Connected' : backendStatus.checking ? 'Checking...' : 'Offline'}
            </span>
          </div>

          {/* Auto-save Switch */}
          <button
            type="button"
            className="btn-ghost"
            onClick={onToggleAutoSave}
            title={autoSave ? 'Auto-saving diagnoses to localStorage' : 'Manual save mode'}
            style={{ fontSize: '0.8125rem' }}
          >
            <span style={{ opacity: 0.7 }}>Auto-save:</span>{' '}
            <strong style={{ color: autoSave ? 'var(--color-success)' : 'var(--text-muted)' }}>
              {autoSave ? 'ON' : 'OFF'}
            </strong>
          </button>

          {/* Saved History Trigger */}
          <button
            type="button"
            className="history-toggle-btn"
            onClick={onOpenHistory}
            aria-label="Open saved history drawer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
            <span>History</span>
            <span className="history-count-badge">{historyCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
