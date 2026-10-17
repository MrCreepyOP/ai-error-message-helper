import React, { useState } from 'react';
import { getTechBadgeClass, formatDateTime, formatDiagnosisToMarkdown } from '../utils/formatters';

export function HistoryDetailModal({
  item,
  onClose,
  onLoadIntoEditor,
  onToggleBookmark,
  onDelete,
  onToast
}) {
  const [copiedCodeType, setCopiedCodeType] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!item || !item.diagnosis) return null;

  const { technology, errorMessage, diagnosis, timestamp, isBookmarked } = item;
  const { summary, possibleCauses, recommendedFix, codeExample, preventionTip } = diagnosis;

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

  const handleCopyFullDiagnosis = async () => {
    try {
      const markdown = formatDiagnosisToMarkdown(item);
      await navigator.clipboard.writeText(markdown);
      setCopiedFull(true);
      if (onToast) onToast('Full diagnosis copied as Markdown!', 'success');
      setTimeout(() => setCopiedFull(false), 2500);
    } catch (err) {
      if (onToast) onToast('Failed to copy diagnosis to clipboard', 'error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 className="modal-title">Saved Diagnosis Details</h3>
            <span className={`tech-badge ${getTechBadgeClass(technology)}`}>
              {technology || 'General'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatDateTime(timestamp)}
            </span>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Error Message Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Original Error Message
            </span>
            <pre style={{
              backgroundColor: 'var(--bg-code)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              color: '#fca5a5',
              fontSize: '0.8125rem',
              maxHeight: '140px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <code>{errorMessage}</code>
            </pre>
          </div>

          {/* Section 1: What Happened? */}
          <div className="diag-card">
            <div className="diag-card-header">
              <div className="diag-card-title">
                <span className="diag-card-icon icon-blue">1</span>
                <span>What Happened?</span>
              </div>
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
              </div>
              <div className="diag-card-body">
                <div className="code-example-container">
                  <div className="code-boxes-grid">
                    {codeExample.originalCode && (
                      <div className="code-box problematic">
                        <div className="code-box-header">
                          <span className="code-box-label label-red">Problematic Code</span>
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

                    {codeExample.correctedCode && (
                      <div className="code-box corrected">
                        <div className="code-box-header">
                          <span className="code-box-label label-green">Corrected Code</span>
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

                  {codeExample.explanation && (
                    <div className="code-explanation">
                      <strong>Why this works: </strong>
                      {codeExample.explanation}
                    </div>
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
            </div>
            <div className="diag-card-body">
              <div className="prevention-box">
                <p className="prevention-text">{preventionTip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            style={{ color: 'var(--color-error)', marginRight: 'auto' }}
          >
            Delete Item
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => onToggleBookmark(item.id)}
          >
            {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyFullDiagnosis}
          >
            {copiedFull ? '✓ Copied Markdown' : 'Copy Markdown'}
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onLoadIntoEditor(item);
              onClose();
            }}
          >
            Load in Main View
          </button>
        </div>
      </div>
    </div>
  );
}
