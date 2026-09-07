const API_BASE = '/api';

export async function apiPost(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Network error: could not reach the server.' };
  }
}

export async function apiGet(endpoint, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}${endpoint}?${query}`);
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Network error: could not reach the server.' };
  }
}
