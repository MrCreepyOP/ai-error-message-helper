/**
 * API Service for communication with the local Express backend
 * Uses native Fetch API
 */

// If Vite dev server proxies /api, standard relative path works.
// We also support explicit PORT 5004 fallback if running standalone.
const API_BASE = '/api';

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        online: false,
        geminiConfigured: false,
        error: `Backend responded with HTTP ${response.status}`
      };
    }

    const data = await response.json();
    return {
      online: true,
      geminiConfigured: Boolean(data.geminiConfigured),
      model: data.model,
      uptime: data.uptime
    };
  } catch (err) {
    return {
      online: false,
      geminiConfigured: false,
      error: err.name === 'AbortError' ? 'Health check timed out' : 'Backend is unreachable'
    };
  }
}

/**
 * Send error message and technology to backend for AI analysis
 */
export async function requestErrorAnalysis({ errorMessage, technology, context }) {
  try {
    const controller = new AbortController();
    // 60-second timeout for AI completion
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        errorMessage,
        technology,
        context: context || undefined
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let result;
    try {
      result = await response.json();
    } catch (parseErr) {
      throw new Error(`Invalid server response (HTTP ${response.status})`);
    }

    if (!response.ok || !result.success) {
      const err = new Error(result.error || `Analysis request failed with HTTP ${response.status}`);
      err.code = result.code || 'REQUEST_FAILED';
      err.help = result.help;
      err.status = response.status;
      throw err;
    }

    return result.data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('The request timed out. Gemini took longer than 60 seconds to respond.');
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    // Check if network failed completely (server not running)
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      const networkErr = new Error(
        'Unable to reach local backend server on port 5004. Make sure your Node.js backend is running (cd server && npm start).'
      );
      networkErr.code = 'BACKEND_OFFLINE';
      throw networkErr;
    }
    throw err;
  }
}
