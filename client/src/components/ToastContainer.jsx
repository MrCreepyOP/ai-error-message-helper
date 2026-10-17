import React from 'react';

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let icon = 'ℹ️';
        if (toast.type === 'success') icon = '✓';
        if (toast.type === 'error') icon = '⚠️';
        if (toast.type === 'warning') icon = '⚡';

        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{icon}</span>
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onRemove(toast.id)}
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
