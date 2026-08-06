import { io } from "socket.io-client";

// Same base URL convention as src/api.js's apiFetch, so the socket always
// points at the same backend the REST calls go to.
const API_BASE =
  (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim()) ||
  "http://localhost:4000";

let socket = null;

/**
 * Returns a shared socket.io connection, authenticated with the same JWT
 * used by apiFetch. Returns null for anonymous visitors — we never open a
 * socket for someone who isn't logged in.
 */
export function getSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(API_BASE, {
      withCredentials: true,
      auth: { token },
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
