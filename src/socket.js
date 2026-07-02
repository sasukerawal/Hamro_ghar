import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";
    socket = io(API_BASE, { withCredentials: true });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
