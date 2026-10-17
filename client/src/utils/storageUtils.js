import { STORAGE_KEYS } from './constants';

/**
 * Load history safely from browser localStorage
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('History in localStorage is not an array, resetting to empty array.');
      return [];
    }
    // Filter and sanitize entries
    return parsed.filter(item => item && typeof item === 'object' && item.id && item.diagnosis);
  } catch (err) {
    console.error('Failed to parse history from localStorage. Data may be corrupted:', err);
    return [];
  }
}

/**
 * Save history safely to browser localStorage
 */
export function saveHistory(items) {
  try {
    if (!Array.isArray(items)) return false;
    // Keep the most recent 100 analyses to prevent hitting browser storage quotas
    const truncated = items.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(truncated));
    return true;
  } catch (err) {
    console.error('Failed to write history to localStorage:', err);
    return false;
  }
}

/**
 * Estimate size of stored history in kilobytes
 */
export function getHistoryStorageSizeKB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return 0;
    // Calculate size in UTF-16 characters (~2 bytes each)
    const bytes = raw.length * 2;
    return (bytes / 1024).toFixed(1);
  } catch (err) {
    return 0;
  }
}

/**
 * Load auto-save setting
 */
export function loadAutoSavePreference() {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
    return val !== null ? val === 'true' : true; // Default to true
  } catch (err) {
    return true;
  }
}

/**
 * Save auto-save setting
 */
export function saveAutoSavePreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, String(enabled));
  } catch (err) {
    console.error('Failed to save auto-save preference:', err);
  }
}
