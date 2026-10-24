import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { QuickSamples } from './components/QuickSamples';
import { ErrorInputForm } from './components/ErrorInputForm';
import { DiagnosisView } from './components/DiagnosisView';
import { SavedHistoryPanel } from './components/SavedHistoryPanel';
import { HistoryDetailModal } from './components/HistoryDetailModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/ToastContainer';
import { SetupNotice } from './components/SetupNotice';

import { useHistory } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import { checkBackendHealth, requestErrorAnalysis } from './services/apiService';

export default function App() {
  // Input Form States
  const [errorMessage, setErrorMessage] = useState('');
  const [technology, setTechnology] = useState('JavaScript');
  const [context, setContext] = useState('');
  const [activeSampleId, setActiveSampleId] = useState(null);

  // Analysis State
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // History & Toast Hooks
  const {
    history,
    autoSave,
    toggleAutoSave,
    addDiagnosisToHistory,
    deleteHistoryItem,
    toggleBookmark,
    clearAllHistory,
    storageSizeKB,
    isFirebaseConnected,
    firebaseError
  } = useHistory();

  const { toasts, addToast, removeToast } = useToast();

  // Drawer and Modal States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Backend Health State
  const [backendStatus, setBackendStatus] = useState({
    online: false,
    checking: true,
    geminiConfigured: false,
    model: 'gemini-2.5-flash'
  });

  // Verify backend health on mount and periodically
  const fetchHealth = useCallback(async () => {
    const status = await checkBackendHealth();
    setBackendStatus({
      online: status.online,
      checking: false,
      geminiConfigured: status.geminiConfigured,
      model: status.model || 'gemini-2.5-flash'
    });
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Handle Quick Sample Selection
  const handleSelectSample = (sample) => {
    setErrorMessage(sample.error);
    setTechnology(sample.technology);
    setContext('');
    setActiveSampleId(sample.id);
    setAnalysisError(null);
    addToast(`Loaded ${sample.label} sample`, 'info', 2000);
  };

  // Clear Form
  const handleClear = () => {
    setErrorMessage('');
    setContext('');
    setActiveSampleId(null);
    setAnalysisError(null);
    setCurrentAnalysis(null);
    addToast('Input cleared', 'info', 1500);
  };

  // Perform Error Analysis
  const handleAnalyze = async () => {
    if (!errorMessage.trim()) {
      addToast('Please paste or type an error message first.', 'warning');
      return;
    }

    setIsLoading(true);
    setAnalysisError(null);

    try {
      const diagnosisData = await requestErrorAnalysis({
        errorMessage,
        technology,
        context
      });

      const entry = {
        id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        errorMessage,
        technology,
        diagnosis: diagnosisData,
        timestamp: new Date().toISOString(),
        isBookmarked: false
      };

      setCurrentAnalysis(entry);

      // Auto-save if enabled
      if (autoSave) {
        addDiagnosisToHistory(entry);
        addToast('Analysis complete and saved to local history!', 'success');
      } else {
        addToast('Analysis complete!', 'success');
      }

      // Smooth scroll to diagnosis results
      setTimeout(() => {
        const el = document.getElementById('diagnosis-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err);
      addToast(err.message || 'Error analysis failed', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if current analysis is saved
  const isCurrentSaved = Boolean(
    currentAnalysis && history.some((item) => item.id === currentAnalysis.id)
  );

  // Check if current analysis is bookmarked
  const isCurrentBookmarked = Boolean(
    currentAnalysis && history.some((item) => item.id === currentAnalysis.id && item.isBookmarked)
  );

  // Toggle Bookmark for current analysis
  const handleToggleCurrentBookmark = () => {
    if (!currentAnalysis) return;

    if (!isCurrentSaved) {
      // If not yet saved, save it with bookmark enabled
      addDiagnosisToHistory({ ...currentAnalysis, isBookmarked: true });
      addToast('Diagnosis saved and bookmarked!', 'success');
    } else {
      toggleBookmark(currentAnalysis.id);
      addToast(
        isCurrentBookmarked ? 'Bookmark removed' : 'Diagnosis bookmarked!',
        'info'
      );
    }
  };

  // Manual save for current analysis
  const handleManualSave = () => {
    if (!currentAnalysis) return;
    addDiagnosisToHistory(currentAnalysis);
    addToast('Diagnosis saved to local history!', 'success');
  };

  // Load a saved history item into the editor and view
  const handleLoadHistoryItem = (item) => {
    setErrorMessage(item.errorMessage);
    setTechnology(item.technology);
    setCurrentAnalysis(item);
    setActiveSampleId(null);
    setAnalysisError(null);
    addToast(`Loaded analysis from ${item.technology}`, 'info');

    setTimeout(() => {
      const el = document.getElementById('diagnosis-results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Clear all history
  const handleConfirmClearAll = () => {
    clearAllHistory();
    setConfirmClearOpen(false);
    addToast('All local history entries cleared', 'info');
  };

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        autoSave={autoSave}
        onToggleAutoSave={() => {
          toggleAutoSave();
          addToast(`Auto-save ${!autoSave ? 'Enabled' : 'Disabled'}`, 'info', 1800);
        }}
        isFirebaseConnected={isFirebaseConnected}
      />

      <main className="main-content">
        {/* Setup Banner if Gemini Key is Missing */}
        <SetupNotice
          backendStatus={backendStatus}
          onRefreshStatus={fetchHealth}
        />

        {/* Hero Section */}
        <Hero />

        {/* Quick Demo Examples */}
        <QuickSamples
          onSelectSample={handleSelectSample}
          activeSampleId={activeSampleId}
        />

        {/* Error Input Form */}
        <ErrorInputForm
          errorMessage={errorMessage}
          setErrorMessage={(val) => {
            setErrorMessage(val);
            if (activeSampleId) setActiveSampleId(null);
          }}
          technology={technology}
          setTechnology={setTechnology}
          context={context}
          setContext={setContext}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          isLoading={isLoading}
        />

        {/* Analysis Error Message Display */}
        {analysisError && (
          <div className="error-banner" role="alert">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div className="error-banner-content">
              <div className="error-banner-title">
                {analysisError.code === 'API_KEY_NOT_CONFIGURED'
                  ? 'Gemini API Key Required'
                  : analysisError.code === 'BACKEND_OFFLINE'
                  ? 'Backend Server Unreachable'
                  : 'Analysis Error'}
              </div>
              <p>{analysisError.message}</p>
              {analysisError.help && (
                <p style={{ marginTop: '0.4rem', fontSize: '0.8125rem', opacity: 0.9 }}>
                  💡 {analysisError.help}
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setAnalysisError(null)}
              style={{ color: '#fca5a5' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Five-Part Diagnosis Section */}
        {currentAnalysis && (
          <DiagnosisView
            currentAnalysis={currentAnalysis}
            isBookmarked={isCurrentBookmarked}
            onToggleBookmark={handleToggleCurrentBookmark}
            onSaveManual={handleManualSave}
            isSaved={isCurrentSaved}
            onToast={addToast}
          />
        )}
      </main>

      {/* Saved History Drawer */}
      <SavedHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setInspectingItem(item);
        }}
        onDeleteItem={(id) => {
          deleteHistoryItem(id);
          addToast('Diagnosis removed from history', 'info', 2000);
        }}
        onToggleBookmark={toggleBookmark}
        onClearAllPrompt={() => setConfirmClearOpen(true)}
        storageSizeKB={storageSizeKB}
        isFirebaseConnected={isFirebaseConnected}
        firebaseError={firebaseError}
      />

      {/* Inspect Item Details Modal */}
      {inspectingItem && (
        <HistoryDetailModal
          item={inspectingItem}
          onClose={() => setInspectingItem(null)}
          onLoadIntoEditor={(item) => {
            handleLoadHistoryItem(item);
            setIsHistoryOpen(false);
          }}
          onToggleBookmark={(id) => {
            toggleBookmark(id);
            setInspectingItem((prev) =>
              prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null
            );
          }}
          onDelete={(id) => {
            deleteHistoryItem(id);
            setInspectingItem(null);
            addToast('Diagnosis deleted', 'info');
          }}
          onToast={addToast}
        />
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear All Saved Diagnoses?"
        message="This action will permanently delete all saved analyses and bookmarks from your browser's localStorage. This cannot be undone."
        confirmLabel="Yes, Clear All"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleConfirmClearAll}
        onCancel={() => setConfirmClearOpen(false)}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
