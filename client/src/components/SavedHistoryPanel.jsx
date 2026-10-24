import React, { useState, useMemo } from 'react';
import { SUPPORTED_TECHNOLOGIES } from '../utils/constants';
import { getTechBadgeClass, formatRelativeTime, truncate } from '../utils/formatters';

export function SavedHistoryPanel({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onToggleBookmark,
  onClearAllPrompt,
  storageSizeKB,
  isFirebaseConnected,
  firebaseError
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Filter history items by search query, technology, and bookmarked status
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Technology filter
      if (selectedTech !== 'ALL' && (item.technology || '').toLowerCase() !== selectedTech.toLowerCase()) {
        return false;
      }

      // Bookmark filter
      if (onlyBookmarked && !item.isBookmarked) {
        return false;
      }

      // Search query filter (matches error message, technology, summary, causes, or fix)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const errorMatch = (item.errorMessage || '').toLowerCase().includes(query);
        const techMatch = (item.technology || '').toLowerCase().includes(query);
        const summaryMatch = (item.diagnosis?.summary || '').toLowerCase().includes(query);
        const causesMatch = (item.diagnosis?.possibleCauses || []).some(c => c.toLowerCase().includes(query));
        const fixMatch = (item.diagnosis?.recommendedFix || []).some(f => f.toLowerCase().includes(query));

        return errorMatch || techMatch || summaryMatch || causesMatch || fixMatch;
      }

      return true;
    });
  }, [history, searchQuery, selectedTech, onlyBookmarked]);

  if (!isOpen) return null;

  return (
    <div className="history-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="history-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="history-drawer-header">
          <div className="drawer-title-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
            <h2 className="drawer-title">Saved Diagnoses</h2>
            <span className="history-count-badge">{history.length}</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
                background: isFirebaseConnected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                color: isFirebaseConnected ? '#fbbf24' : 'var(--text-muted)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Cloud storage powered by Firebase Firestore"
            >
              ☁️ {isFirebaseConnected ? 'Firebase Synced' : 'Syncing...'}
            </span>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close history drawer"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="drawer-controls">
          <input
            type="search"
            className="history-search-input"
            placeholder="Search saved errors, fixes, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="history-filter-row">
            <select
              className="history-tech-filter"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              aria-label="Filter by technology"
            >
              <option value="ALL">All Technologies</option>
              {SUPPORTED_TECHNOLOGIES.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={`btn-bookmark-filter ${onlyBookmarked ? 'active' : ''}`}
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              title="Show only bookmarked diagnoses"
            >
              ★ Bookmarks
            </button>
          </div>
        </div>

        {/* Firebase Warning if Permissions are locked */}
        {firebaseError && (
          <div style={{ margin: '0 1.25rem', padding: '0.6rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', fontSize: '0.75rem', color: '#fca5a5' }}>
            <strong>Firebase Sync Note:</strong> {firebaseError}. Local cache is currently preserving your diagnoses.
          </div>
        )}

        {/* History Items List */}
        <div className="history-list">
          {filteredHistory.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">☁️</span>
              <span className="empty-state-title">
                {history.length === 0 ? 'No Saved History Yet' : 'No Matching Diagnoses'}
              </span>
              <p className="empty-state-desc">
                {history.length === 0
                  ? 'Diagnoses are automatically saved in Google Firebase Firestore and cached locally for offline recall.'
                  : 'Try adjusting your search query or technology filter.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isMarked = Boolean(item.isBookmarked);
              return (
                <div
                  key={item.id}
                  className="history-item-card"
                  onClick={() => onSelectHistoryItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectHistoryItem(item);
                  }}
                >
                  <div className="history-item-header">
                    <span className={`tech-badge ${getTechBadgeClass(item.technology)}`}>
                      {item.technology || 'General'}
                    </span>
                    <span className="history-item-time">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <div className="history-item-error" title={item.errorMessage}>
                    {truncate(item.errorMessage, 70)}
                  </div>

                  <p className="history-item-summary">
                    {truncate(item.diagnosis?.summary, 110)}
                  </p>

                  <div className="history-item-footer" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => onToggleBookmark(item.id)}
                      title={isMarked ? 'Remove bookmark' : 'Bookmark diagnosis'}
                      style={{ padding: '0.2rem 0.4rem', color: isMarked ? 'var(--color-warning)' : 'var(--text-muted)' }}
                    >
                      ★ {isMarked ? 'Bookmarked' : 'Bookmark'}
                    </button>

                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete this diagnosis"
                      style={{ padding: '0.2rem 0.4rem', color: 'var(--color-error)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Storage Usage & Clear All */}
        <div className="drawer-footer">
          <div className="storage-info-row">
            <span>
              Cloud: <strong>Firebase Firestore</strong> ({history.length} records)
            </span>
            {history.length > 0 && (
              <button
                type="button"
                className="btn-ghost"
                onClick={onClearAllPrompt}
                style={{ color: 'var(--color-error)', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
              >
                Clear All History
              </button>
            )}
          </div>

          <p className="storage-notice-text">
            ☁️ <strong>Firebase Cloud Persistence:</strong> Saved diagnoses are persisted in your Firebase project (<code>craftora-prototype</code>) and synced in real time across browser tabs and devices, backed with local offline storage.
          </p>
        </div>
      </div>
    </div>
  );
}
