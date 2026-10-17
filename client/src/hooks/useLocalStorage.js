import { useState, useEffect, useCallback } from 'react';
import {
  loadHistory,
  saveHistory,
  loadAutoSavePreference,
  saveAutoSavePreference,
  getHistoryStorageSizeKB
} from '../utils/storageUtils';

/**
 * Custom hook for local history management backed by localStorage
 */
export function useHistory() {
  const [history, setHistory] = useState([]);
  const [autoSave, setAutoSave] = useState(true);
  const [storageSizeKB, setStorageSizeKB] = useState('0');

  // Initialize from localStorage on mount
  useEffect(() => {
    const loaded = loadHistory();
    setHistory(loaded);
    setAutoSave(loadAutoSavePreference());
    setStorageSizeKB(getHistoryStorageSizeKB());
  }, []);

  // Sync history state to localStorage whenever history changes
  const updateHistoryAndStorage = useCallback((newItems) => {
    setHistory(newItems);
    saveHistory(newItems);
    setStorageSizeKB(getHistoryStorageSizeKB());
  }, []);

  // Add a new diagnosis entry
  const addDiagnosisToHistory = useCallback((entry) => {
    const id = entry.id || `diag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newEntry = {
      ...entry,
      id,
      timestamp: entry.timestamp || new Date().toISOString(),
      isBookmarked: Boolean(entry.isBookmarked)
    };

    setHistory((prev) => {
      // Avoid duplicate entries if identical error & diagnosis exists
      const existingIndex = prev.findIndex(item => item.id === id);
      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = newEntry;
      } else {
        updated = [newEntry, ...prev];
      }
      saveHistory(updated);
      setStorageSizeKB(getHistoryStorageSizeKB());
      return updated;
    });

    return id;
  }, []);

  // Delete an individual entry
  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveHistory(updated);
      setStorageSizeKB(getHistoryStorageSizeKB());
      return updated;
    });
  }, []);

  // Toggle bookmark flag for an entry
  const toggleBookmark = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, isBookmarked: !item.isBookmarked };
        }
        return item;
      });
      saveHistory(updated);
      return updated;
    });
  }, []);

  // Clear all history entries
  const clearAllHistory = useCallback(() => {
    updateHistoryAndStorage([]);
  }, [updateHistoryAndStorage]);

  // Toggle auto-save preference
  const toggleAutoSave = useCallback(() => {
    setAutoSave((prev) => {
      const next = !prev;
      saveAutoSavePreference(next);
      return next;
    });
  }, []);

  return {
    history,
    autoSave,
    toggleAutoSave,
    addDiagnosisToHistory,
    deleteHistoryItem,
    toggleBookmark,
    clearAllHistory,
    storageSizeKB
  };
}
