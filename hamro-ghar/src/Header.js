// src/Header.js
import React from "react";
import { Home, User } from "lucide-react";

export default function Header({
  isLoggedIn,
  onGoHome,
  onGoLogin,
  onGoRegister,
  onGoProfile,
  onGoMembership,
  onLogout,
}) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <button onClick={onGoHome} className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">HamroGhar</span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm font-medium">

          {!isLoggedIn && (
            <>
              <button onClick={onGoLogin} className="text-blue-600">
                Sign In
              </button>
              <button
                onClick={onGoRegister}
                className="bg-blue-600 px-4 py-1.5 rounded-full text-white"
              >
                Join Free
              </button>
            </>
          )}

          {isLoggedIn && (
            <>
              <button
                onClick={onGoMembership}
                className="text-blue-600 hover:underline"
              >
                Membership
              </button>

              <button
                onClick={onGoProfile}
                className="flex items-center gap-1 text-blue-600"
              >
                <User className="h-4 w-4" /> Profile
              </button>

              <button
                onClick={onLogout}
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
