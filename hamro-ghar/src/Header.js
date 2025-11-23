// src/Header.js
import React, { useState } from "react";
import {
  Menu,
  X,
  User,
  LogIn,
  Home as HomeIcon,
  Crown,
  PlusCircle,
} from "lucide-react";

export default function Header({
  isLoggedIn,
  onGoHome,
  onGoBuy,
  onGoRent,
  onGoLogin,
  onGoRegister,
  onGoProfile,
  onGoMembership,
  onGoPostListing,
  onLogout,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobile = () => setIsMobileMenuOpen((prev) => !prev);

  const handleNav = (fn) => {
    if (typeof fn === "function") fn();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100">
      {/* TOP BAR */}
      <div className="max-w-6xl mx-auto h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 max-[425px]:px-3">
        
        {/* LEFT: LOGO */}
        <button
          type="button"
          onClick={() => handleNav(onGoHome)}
          className="flex items-center gap-2 max-[425px]:gap-1 cursor-pointer"
        >
          <div className="h-9 w-9 max-[425px]:h-8 max-[425px]:w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            HG
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm max-[425px]:text-xs font-semibold text-slate-900">
              HamroGhar
            </p>
            <p className="text-[11px] max-[425px]:text-[10px] text-blue-500">
              Blue &amp; White Homes
            </p>
          </div>
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink label="Home" onClick={() => handleNav(onGoHome)} />
          <NavLink label="Buy" onClick={() => handleNav(onGoBuy)} />
          <NavLink label="Rent" onClick={() => handleNav(onGoRent)} />
        </nav>

        {/* DESKTOP RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => handleNav(onGoLogin)}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-700"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav(onGoRegister)}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Join free
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNav(onGoPostListing)}
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Post a home
              </button>

              <button
                type="button"
                onClick={() => handleNav(onGoMembership)}
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Crown className="h-3.5 w-3.5 mr-1" />
                Membership
              </button>

              <button
                type="button"
                onClick={() => handleNav(onGoProfile)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                Profile
              </button>

              <button
                type="button"
                onClick={() => handleNav(onLogout)}
                className="text-sm text-slate-500 hover:text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE RIGHT SIDE */}
        <div className="flex md:hidden items-center gap-2 max-[425px]:gap-1">
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => handleNav(onGoPostListing)}
              className="inline-flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 h-8 w-8 max-[425px]:h-7 max-[425px]:w-7"
              title="Post a home"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleMobile}
            className="inline-flex items-center justify-center rounded-full border border-blue-100 p-2 max-[425px]:p-1.5 text-slate-700 bg-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 max-[425px]:h-4 max-[425px]:w-4" />
            ) : (
              <Menu className="h-5 w-5 max-[425px]:h-4 max-[425px]:w-4" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-blue-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 text-sm max-[425px]:px-3">

            <MobileItem
              icon={HomeIcon}
              label="Home"
              onClick={() => handleNav(onGoHome)}
            />
            <MobileItem
              icon={HomeIcon}
              label="Buy"
              onClick={() => handleNav(onGoBuy)}
            />
            <MobileItem
              icon={HomeIcon}
              label="Rent"
              onClick={() => handleNav(onGoRent)}
            />

            {isLoggedIn && (
              <>
                <MobileItem
                  icon={PlusCircle}
                  label="Post a home"
                  onClick={() => handleNav(onGoPostListing)}
                />
                <MobileItem
                  icon={Crown}
                  label="Membership"
                  onClick={() => handleNav(onGoMembership)}
                />
                <MobileItem
                  icon={User}
                  label="Profile"
                  onClick={() => handleNav(onGoProfile)}
                />
              </>
            )}

            {!isLoggedIn ? (
              <>
                <MobileItem
                  icon={LogIn}
                  label="Sign in"
                  onClick={() => handleNav(onGoLogin)}
                />
                <button
                  type="button"
                  onClick={() => handleNav(onGoRegister)}
                  className="w-full rounded-full bg-blue-600 py-2 text-sm font-semibold text-white mt-2"
                >
                  Join free
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleNav(onLogout)}
                className="w-full rounded-full border border-slate-200 py-2 text-sm text-slate-700 mt-2 hover:bg-slate-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative px-1 py-0.5 text-sm text-slate-600 hover:text-blue-700"
    >
      {label}
    </button>
  );
}

function MobileItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-700"
    >
      <Icon className="h-4 w-4 text-blue-500" />
      <span>{label}</span>
    </button>
  );
}
