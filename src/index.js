import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import './index.css';
import "./output.css";
import App from './App';

// Dev safeguard: if a Service Worker was previously registered on localhost:3000
// (from an older build/template), it can serve stale cached bundles and cause
// confusing runtime errors. We don't use a SW in this app, so unregister in dev.
if (process.env.NODE_ENV !== "production") {
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
    }
    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  } catch (_) {
    // ignore
  }
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
