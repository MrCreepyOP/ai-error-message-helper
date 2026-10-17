import React, { useState } from 'react';
import { getTechBadgeClass, formatDateTime, formatDiagnosisToMarkdown } from '../utils/formatters';

export function DiagnosisView({
  currentAnalysis,
  isBookmarked,
  onToggleBookmark,
  onSaveManual,
  isSaved,
  onToast
}) {
  const [copiedCodeType, setCopiedCodeType] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!currentAnalysis || !currentAnalysis.diagnosis) {
    return null;
  }

  const { technology, errorMessage, diagnosis, timestamp } = currentAnalysis;
  const { summary, possibleCauses, recommendedFix, codeExample, preventionTip } = diagnosis;

  // Copy individual code snippet
  const handleCopyCode = async (codeText, type) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeType(type);
      if (onToast) onToast(`${type === 'original' ? 'Problematic' : 'Corrected'} code copied!`, 'success');
      setTimeout(() => setCopiedCodeType(null), 2000);
    } catch (err) {
      if (onToast) onToast('Failed to copy code to clipboard', 'error');
    }
  };

  // Copy full diagnosis as Markdown
  const handleCopyFullDiagnosis = async () => {
    try {
      const markdown = formatDiagnosisToMarkdown(currentAnalysis);
      await navigator.clipboard.writeText(markdown);
      setCopiedFull(true);
      if (onToast) onToast('Full 5-part diagnosis copied as Markdown!', 'success');
      setTimeout(() => setCopiedFull(false), 2500);
    } catch (err) {
      if (onToast) onToast('Failed to copy diagnosis to clipboard', 'error');
    }
  };

  return (
    <div className="diagnosis-container" id="diagnosis-results">
      {/* Top Toolbar */}
      <div className="diagnosis-toolbar">
        <div className="diagnosis-meta">
          <span className="diagnosis-title-tag">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            AI Diagnosis
          </span>

          <span className={`tech-badge ${getTechBadgeClass(technology)}`}>
            {technology || 'General'}
          </span>

          {timestamp && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {formatDateTime(timestamp)}
            </span>
          )}
        </div>

        <div className="diagnosis-actions">
          {/* Bookmark Toggle */}
          <button
            type="button"
            className="btn-secondary"
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this diagnosis'}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={isBookmarked ? 'var(--color-warning)' : 'none'}
              stroke={isBookmarked ? 'var(--color-warning)' : 'currentColor'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Manual Save if not already saved */}
          {!isSaved && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onSaveManual}
              title="Save this diagnosis to local history"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <span>Save</span>
            </button>
          )}

          {/* Copy Full Report */}
          <button
            type="button"
            className="btn-primary"
            onClick={handleCopyFullDiagnosis}
            title="Copy full diagnosis report in Markdown format"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            {copiedFull ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>Copy Full Diagnosis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 1: What Happened? */}
      <div className="diag-card">
        <div className="diag-card-header">
          <div className="diag-card-title">
            <span className="diag-card-icon icon-blue">1</span>
            <span>What Happened?</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plain-English Summary</span>
        </div>
        <div className="diag-card-body">
          <p className="summary-text">{summary}</p>
        </div>
      </div>

      {/* Section 2: Possible Causes */}
      <div className="diag-card">
        <div className="diag-card-header">
          <div className="diag-card-title">
            <span className="diag-card-icon icon-amber">2</span>
            <span>Possible Causes</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ordered by Likelihood</span>
        </div>
        <div className="diag-card-body">
          <ul className="causes-list">
            {(possibleCauses || []).map((cause, idx) => (
              <li key={idx} className="cause-item">
                <span className="cause-index">#{idx + 1}</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 3: Recommended Fix */}
      <div className="diag-card">
        <div className="diag-card-header">
          <div className="diag-card-title">
            <span className="diag-card-icon icon-green">3</span>
            <span>Recommended Fix</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actionable Resolution Steps</span>
        </div>
        <div className="diag-card-body">
          <ol className="fixes-list">
            {(recommendedFix || []).map((fixStep, idx) => (
              <li key={idx} className="fix-item">
                <span className="fix-step-num">Step {idx + 1}:</span>
                <span>{fixStep}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Section 4: Code Example */}
      {codeExample && (codeExample.originalCode || codeExample.correctedCode) && (
        <div className="diag-card">
          <div className="diag-card-header">
            <div className="diag-card-title">
              <span className="diag-card-icon icon-purple">4</span>
              <span>Code Example</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Before & After Comparison
            </span>
          </div>
          <div className="diag-card-body">
            <div className="code-example-container">
              <div className="code-boxes-grid">
                {/* Problematic Code Box */}
                {codeExample.originalCode && (
                  <div className="code-box problematic">
                    <div className="code-box-header">
                      <span className="code-box-label label-red">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Problematic Code
                      </span>
                      <button
                        type="button"
                        className="copy-code-btn"
                        onClick={() => handleCopyCode(codeExample.originalCode, 'original')}
                      >
                        {copiedCodeType === 'original' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="code-content">
                      <code>{codeExample.originalCode}</code>
                    </pre>
                  </div>
                )}

                {/* Corrected Code Box */}
                {codeExample.correctedCode && (
                  <div className="code-box corrected">
                    <div className="code-box-header">
                      <span className="code-box-label label-green">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Corrected Code
                      </span>
                      <button
                        type="button"
                        className="copy-code-btn"
                        onClick={() => handleCopyCode(codeExample.correctedCode, 'corrected')}
                      >
                        {copiedCodeType === 'corrected' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="code-content">
                      <code>{codeExample.correctedCode}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Code Change Explanation */}
              {codeExample.explanation && (
                <div className="code-explanation">
                  <strong style={{ color: 'var(--text-primary)' }}>Why this works: </strong>
                  {codeExample.explanation}
                </div>
              )}

              {!codeExample.applicable && (
                <p className="illustrative-notice">
                  * Note: This is an illustrative standard example because no surrounding application code was provided.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Prevention Tip */}
      <div className="diag-card">
        <div className="diag-card-header">
          <div className="diag-card-title">
            <span className="diag-card-icon icon-teal">5</span>
            <span>Prevention Tip</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Defensive Practice</span>
        </div>
        <div className="diag-card-body">
          <div className="prevention-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="prevention-text">{preventionTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
