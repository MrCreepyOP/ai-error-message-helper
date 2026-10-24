import React from 'react';

export function SetupNotice({ backendStatus, onRefreshStatus }) {
  // Show if backend is online but API key is missing or default placeholder
  if (!backendStatus.online || backendStatus.geminiConfigured) {
    return null;
  }

  return (
    <div className="setup-banner">
      <div className="setup-banner-header">
        <span className="setup-banner-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Google Gemini API Key Required for Real-Time Analysis
        </span>

        <button
          type="button"
          className="btn-secondary"
          onClick={onRefreshStatus}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          Check Again
        </button>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        The local Express backend is running, but needs your Gemini API key to query Google's AI models.
      </p>

      <ol className="setup-steps-list">
        <li>
          Get a free Gemini API key from Google AI Studio at{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600 }}
          >
            aistudio.google.com/app/apikey
          </a>
        </li>
        <li>
          Open the <span className="setup-code-snippet">server/.env</span> file in this project.
        </li>
        <li>
          Set <span className="setup-code-snippet">GEMINI_API_KEY=your_key_here</span> and save the file.
        </li>
      </ol>
    </div>
  );
}
