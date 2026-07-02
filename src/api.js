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
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // important for cookie-based auth
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g., 204)
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}
