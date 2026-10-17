import React from 'react';
import { EXAMPLE_ERRORS } from '../utils/constants';

export function QuickSamples({ onSelectSample, activeSampleId }) {
  return (
    <div className="samples-wrapper">
      <div className="samples-header">
        <span className="samples-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          Quick Demo Examples
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click an example to test instant diagnosis
        </span>
      </div>

      <div className="samples-grid">
        {EXAMPLE_ERRORS.map((sample) => {
          const isActive = activeSampleId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              className={`sample-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSample(sample)}
              title={sample.description}
            >
              <span>{sample.icon}</span>
              <span>{sample.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
