import { API_BASE_URL } from './config';

// Robust to accidentally pasting /api in the config. All route paths include /api.
const SERVER_ROOT = API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');

export async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${SERVER_ROOT}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
    return body;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Server timeout. Check the API address and Wi-Fi.');
    if (error.message === 'Network request failed') throw new Error('Cannot reach server. Check src/config.js, Wi-Fi, and Windows Firewall.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export const getProblems = () => api('/api/problems');
export const getProblem = (id) => api(`/api/problems/${encodeURIComponent(id)}`);
export const startSession = (sessionId) => api('/api/sessions', { method: 'POST', body: JSON.stringify({ sessionId }) });
export const getResults = (sessionId) => api(`/api/results/${encodeURIComponent(sessionId)}`);
export const submitAttempt = (payload) => api('/api/attempts', { method: 'POST', body: JSON.stringify(payload) });
export const recordEvent = (payload) => api('/api/events', { method: 'POST', body: JSON.stringify(payload) });

export const getFoundations = (sessionId) => api(`/api/foundations/${encodeURIComponent(sessionId)}`);
export const completeFoundation = (payload) => api('/api/foundations/completions', { method: 'POST', body: JSON.stringify(payload) });
export const submitChallenge = (payload) => api('/api/challenges/attempts', { method: 'POST', body: JSON.stringify(payload) });
