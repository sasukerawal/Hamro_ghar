// src/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { Home, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-blue-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-blue-500" />
          <span>
            © {new Date().getFullYear()} HamroGhar. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hover:text-blue-700"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="hover:text-blue-700"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Register
          </Link>
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center gap-1 hover:text-blue-700"
          >
            <Mail className="h-3.5 w-3.5" />
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
