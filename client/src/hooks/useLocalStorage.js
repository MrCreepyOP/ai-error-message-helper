import { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadHistory,
  saveHistory,
  loadAutoSavePreference,
  saveAutoSavePreference,
  getHistoryStorageSizeKB
} from '../utils/storageUtils';
import {
  saveDiagnosisToFirebase,
  deleteDiagnosisFromFirebase,
  toggleBookmarkInFirebase,
  clearAllDiagnosesFromFirebase,
  subscribeToDiagnoses,
  migrateLocalHistoryToFirebase
} from '../services/firebaseService';

/**
 * Custom hook for history management backed by Firebase Firestore
 * with automatic fallback and synchronization with browser localStorage.
 */
export function useHistory() {
  const [history, setHistory] = useState([]);
  const [autoSave, setAutoSave] = useState(true);
  const [storageSizeKB, setStorageSizeKB] = useState('0');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  const hasMigrated = useRef(false);

  // Initialize from localStorage as instant cache, then subscribe to Firebase Firestore
  useEffect(() => {
    // 1. Instant local load
    const localItems = loadHistory();
    setHistory(localItems);
    setAutoSave(loadAutoSavePreference());
    setStorageSizeKB(getHistoryStorageSizeKB());

    // 2. Setup real-time listener to Firebase Firestore
    const unsubscribe = subscribeToDiagnoses(
      (firebaseItems) => {
        setIsFirebaseConnected(true);
        setFirebaseError(null);
        setHistory(firebaseItems);
        // Keep local cache in sync
        saveHistory(firebaseItems);
        setStorageSizeKB(getHistoryStorageSizeKB());

        // Migrate local items to Firebase once if there were local items
        if (!hasMigrated.current && localItems.length > 0) {
          hasMigrated.current = true;
          migrateLocalHistoryToFirebase(localItems).catch((err) => {
            console.warn('Migration note:', err);
          });
        }
      },
      (error) => {
        console.warn('Firebase sync notice:', error.message);
        setIsFirebaseConnected(false);
        setFirebaseError(error.message);
        // Gracefully keep using local cache if Firebase rules or network fail
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Add a new diagnosis entry (saves to Firebase and local backup)
  const addDiagnosisToHistory = useCallback((entry) => {
    const id = entry.id || `diag_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newEntry = {
      ...entry,
      id,
      timestamp: entry.timestamp || new Date().toISOString(),
      isBookmarked: Boolean(entry.isBookmarked)
    };

    // Optimistic local state update
    setHistory((prev) => {
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

    // Save to Firebase Firestore
    saveDiagnosisToFirebase(newEntry).then((res) => {
      if (!res.success) {
        console.warn('Could not save to Firebase Firestore, cached locally:', res.error);
      }
    });

    return id;
  }, []);

  // Delete an individual entry
  const deleteHistoryItem = useCallback((id) => {
    // Optimistic local update
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveHistory(updated);
      setStorageSizeKB(getHistoryStorageSizeKB());
      return updated;
    });

    // Delete in Firebase Firestore
    deleteDiagnosisFromFirebase(id);
  }, []);

  // Toggle bookmark flag for an entry
  const toggleBookmark = useCallback((id) => {
    let currentBookmarked = false;

    // Optimistic local update
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          currentBookmarked = Boolean(item.isBookmarked);
          return { ...item, isBookmarked: !item.isBookmarked };
        }
        return item;
      });
      saveHistory(updated);
      return updated;
    });

    // Update in Firebase Firestore
    toggleBookmarkInFirebase(id, currentBookmarked);
  }, []);

  // Clear all history entries
  const clearAllHistory = useCallback(() => {
    const currentItems = [...history];
    setHistory([]);
    saveHistory([]);
    setStorageSizeKB('0');

    // Clear in Firebase Firestore
    clearAllDiagnosesFromFirebase(currentItems);
  }, [history]);

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
    storageSizeKB,
    isFirebaseConnected,
    firebaseError
  };
}
