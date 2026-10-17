import React from 'react';

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>Google Gemini AI Structured Diagnosis</span>
      </div>

      <h1 className="hero-heading">
        Understand errors. <span className="brand-gradient">Fix bugs faster.</span>
      </h1>

      <p className="hero-subheading">
        Paste any compiler output, runtime exception, or stack trace below. Get plain-language explanations, plausible root causes, step-by-step fixes, and before/after code examples tailored to your stack.
      </p>
    </section>
  );
}
