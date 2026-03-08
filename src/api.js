// src/api.js

// For Create React App, env vars must start with REACT_APP_*
const API_BASE =
  (process.env.REACT_APP_API_BASE &&
    process.env.REACT_APP_API_BASE.trim()) ||
  "http://localhost:4000";

/**
 * Centralized API helper using fetch.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g., 204)
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
    }

    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}
