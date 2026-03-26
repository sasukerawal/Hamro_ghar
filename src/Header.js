// src/Header.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogIn,
  Crown,
  PlusCircle,
  Globe,
  Ruler,
  ArrowRight
} from "lucide-react";

import { useMeasurement } from "./contexts/MeasurementContext";

// ---------------------------------------------------------------------------
// 🌐 Translation map — English ↔ Nepali
// ---------------------------------------------------------------------------
const LANG = {
  en: {
    tagline: "Blue & White Homes",
    signIn: "Sign in",
    joinFree: "Join free",
    postRequest: "Post / Request",
    membership: "Membership",
    profile: "Profile",
    logout: "Logout",
    postHome: "Post a home",
    langToggle: "नेपाली",
  },
  ne: {
    tagline: "नीलो र सेतो घर",
    signIn: "साइन इन",
    joinFree: "निःशुल्क जोडिनुस्",
    postRequest: "पोस्ट / अनुरोध",
    membership: "सदस्यता",
    profile: "प्रोफाइल",
    logout: "लगआउट",
    postHome: "घर पोस्ट गर्नुस्",
    langToggle: "English",
  },
};

export default function Header({ isLoggedIn, onLogout, lang = "en", onToggleLang }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { unitSystem, toggleUnitSystem } = useMeasurement();

  const t = LANG[lang] || LANG.en;

  const toggleMobile = () => setIsMobileMenuOpen((prev) => !prev);

  const handleMobileNav = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoutClick = () => {
    if (typeof onLogout === "function") {
      onLogout();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-[100] glass border-b border-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
        {/* LOGO - Premium Look */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
            HG
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
              HamroGhar
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-600 mt-0.5">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV & ACTIONS */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            {/* 📏 Unit System Toggle */}
            <button
              type="button"
              onClick={toggleUnitSystem}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:bg-white hover:shadow-sm text-slate-700"
            >
              <Ruler className="h-4 w-4 text-blue-600" />
              {unitSystem === "nepali" ? "Aana" : "SqFt"}
            </button>

            {/* 🌐 Language Toggle */}
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all hover:bg-white hover:shadow-sm text-slate-700"
            >
              <Globe className="h-4 w-4 text-blue-600" />
              {t.langToggle}
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t.signIn}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95 translate-y-[-1px]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t.joinFree}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/listings/new"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:translate-y-[-1px]"
              >
                <PlusCircle className="h-4 w-4" />
                {t.postRequest}
              </Link>

              <Link
                to="/membership"
                className="h-10 w-10 flex items-center justify-center rounded-2xl glass border border-slate-200 text-slate-700 hover:bg-white transition-all"
                title={t.membership}
              >
                <Crown className="h-5 w-5 text-amber-500" />
              </Link>

              <Link
                to="/profile"
                className="h-10 w-10 flex items-center justify-center rounded-2xl glass border border-slate-200 text-slate-700 hover:bg-white transition-all"
                title={t.profile}
              >
                <User className="h-5 w-5 text-blue-600" />
              </Link>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            type="button"
            onClick={toggleUnitSystem}
            className="flex items-center justify-center h-10 w-10 rounded-2xl glass border border-slate-200"
          >
            <Ruler className="h-5 w-5 text-blue-600" />
          </button>
          <button
            type="button"
            onClick={toggleMobile}
            className={`flex items-center justify-center h-11 w-11 rounded-2xl transition-all ${isMobileMenuOpen ? 'bg-slate-900 text-white shadow-xl' : 'glass border border-slate-200 text-slate-900'}`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU - Premium Expansion */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass border-t border-white/50 animate-in slide-in-from-top duration-300">
          <div className="p-6 flex flex-col gap-4">
            {!isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => handleMobileNav("/login")}
                  className="w-full rounded-2xl border border-slate-200 py-4 text-center text-sm font-black uppercase tracking-widest text-slate-700"
                >
                  {t.signIn}
                </button>
                <button
                  type="button"
                  onClick={() => handleMobileNav("/register")}
                  className="w-full rounded-2xl bg-blue-600 py-4 text-center text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/30"
                >
                  {t.joinFree}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <MobileActionItem
                  icon={PlusCircle}
                  label={t.postRequest}
                  onClick={() => handleMobileNav("/listings/new")}
                  primary
                />
                <MobileActionItem
                  icon={User}
                  label={t.profile}
                  onClick={() => handleMobileNav("/profile")}
                />
                <MobileActionItem
                  icon={Crown}
                  label={t.membership}
                  onClick={() => handleMobileNav("/membership")}
                />
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="rounded-2xl border border-red-100 bg-red-50/50 py-4 text-center text-[10px] font-black uppercase tracking-widest text-red-600"
                >
                  {t.logout}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/30">
              <button
                type="button"
                onClick={onToggleLang}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600"
              >
                <Globe className="h-4 w-4" />
                {t.langToggle}
              </button>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © 2026 HamroGhar
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileActionItem({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-3xl border transition-all active:scale-95 ${primary ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'glass border-white/50 text-slate-700'}`}
    >
      <Icon className={`h-6 w-6 ${primary ? 'text-white' : 'text-blue-600'}`} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
