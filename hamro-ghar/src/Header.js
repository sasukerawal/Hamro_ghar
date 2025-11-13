// src/Header.js
import React from 'react';
import { Menu, X, LogIn } from 'lucide-react';

const Header = ({
  currentPage,
  isLoggedIn,
  onNav,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => (
  <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100">
    <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onNav('home')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          HG
        </div>
        <div className="text-left leading-tight">
          <p className="text-sm font-semibold text-slate-900">HamroGhar</p>
          <p className="text-[11px] text-blue-500">Blue &amp; White Homes</p>
        </div>
      </button>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <NavButton
          label="Home"
          active={currentPage === 'home'}
          onClick={() => onNav('home')}
        />
        <NavButton label="Buy" onClick={() => onNav('home')} />
        <NavButton label="Rent" onClick={() => onNav('home')} />
        <NavButton label="Agents" onClick={() => onNav('home')} />
      </nav>

      <div className="hidden md:flex items-center gap-3">
        {!isLoggedIn && (
          <>
            <button
              type="button"
              onClick={() => onNav('login')}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onNav('register')}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Join free
            </button>
          </>
        )}
        {isLoggedIn && (
          <>
            <button
              type="button"
              onClick={() => onNav('membership')}
              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Membership
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-sm text-slate-600 hover:text-red-500"
            >
              Logout
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden inline-flex items-center justify-center rounded-full border border-blue-100 p-2 text-slate-700"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>

    {isMobileMenuOpen && (
      <div className="md:hidden border-t border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => onNav('home')}
            className="text-sm text-slate-700 text-left"
          >
            Agents
          </button>

          <div className="pt-3 mt-2 border-t border-blue-50 flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => onNav('login')}
                  className="w-full rounded-full border border-blue-200 py-2 text-sm font-medium text-blue-700"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => onNav('register')}
                  className="w-full rounded-full bg-blue-600 py-2 text-sm font-semibold text-white"
                >
                  Join free
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNav('membership')}
                  className="w-full rounded-full bg-blue-50 py-2 text-sm font-semibold text-blue-700"
                >
                  Membership
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-full border border-slate-200 py-2 text-sm text-slate-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </header>
);

const NavButton = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-1 py-0.5 text-sm ${
      active ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'
    }`}
  >
    {label}
    {active && (
      <span className="absolute left-0 -bottom-1 h-[2px] w-full rounded-full bg-blue-500" />
    )}
  </button>
);

export default Header;
