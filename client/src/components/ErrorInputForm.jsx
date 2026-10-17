import React, { useState } from 'react';
import { SUPPORTED_TECHNOLOGIES, MAX_ERROR_CHARACTERS } from '../utils/constants';

export function ErrorInputForm({
  errorMessage,
  setErrorMessage,
  technology,
  setTechnology,
  context,
  setContext,
  onAnalyze,
  onClear,
  isLoading
}) {
  const [showContext, setShowContext] = useState(false);

  const charCount = errorMessage.length;
  const isOverLimit = charCount > MAX_ERROR_CHARACTERS;
  const isNearLimit = charCount > 4500 && !isOverLimit;
  const isEmpty = errorMessage.trim().length === 0;
  const isAnalyzeDisabled = isLoading || isEmpty || isOverLimit;

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!isAnalyzeDisabled) {
        e.preventDefault();
        onAnalyze();
      }
    }
  };

  return (
    <form
      className="input-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isAnalyzeDisabled) onAnalyze();
      }}
    >
      {/* Top Bar: Technology Selector & Context Toggle */}
      <div className="form-row-top">
        <div className="tech-select-wrapper">
          <label htmlFor="technology-select" className="select-label">
            Technology / Language:
          </label>
          <select
            id="technology-select"
            className="tech-select"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            disabled={isLoading}
          >
            {SUPPORTED_TECHNOLOGIES.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        <div className="input-options-group">
          <button
            type="button"
            className="toggle-context-btn"
            onClick={() => setShowContext(!showContext)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showContext ? <line x1="5" y1="12" x2="19" y2="12" /> : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </>
              )}
            </svg>
            <span>{showContext ? 'Hide Code Context' : '+ Add Code Context (Optional)'}</span>
          </button>
        </div>
      </div>

      {/* Main Error Message Input */}
      <div className="textarea-container">
        <textarea
          id="error-textarea"
          className="error-textarea"
          placeholder="Paste your error message, exception traceback, or compiler diagnostics here... (e.g., TypeError: Cannot read properties of undefined)"
          value={errorMessage}
          onChange={(e) => setErrorMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Error message or stack trace"
          rows={7}
        />

        {/* Optional Code Context Textarea */}
        {showContext && (
          <textarea
            className="error-textarea context-textarea"
            placeholder="Optional: Paste the relevant code snippet, function, or file contents where the error happens..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Surrounding code context"
            rows={4}
          />
        )}

        {/* Footer with Character Counter & Shortcut Hint */}
        <div className="textarea-footer">
          <span className="input-hint">
            Tip: Press <kbd style={{ background: 'var(--bg-subtle)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}>Ctrl + Enter</kbd> to analyze
          </span>

          <span
            className={`char-counter ${
              isOverLimit ? 'danger' : isNearLimit ? 'warning' : ''
            }`}
          >
            {charCount.toLocaleString()} / {MAX_ERROR_CHARACTERS.toLocaleString()} characters
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="form-actions-bar">
        <div className="left-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClear}
            disabled={isLoading || (isEmpty && !context)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>Clear</span>
          </button>
        </div>

        <div className="right-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isAnalyzeDisabled}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Analyzing Error with Gemini...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <span>Analyze Error</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
