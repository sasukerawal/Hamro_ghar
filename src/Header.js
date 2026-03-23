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
  Ruler
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
    <header className="fixed top-0 inset-x-0 z-40 bg-white/85 backdrop-blur-xl border-b border-blue-100/60 shadow-sm shadow-blue-500/5">
      {/* TOP BAR */}
      <div className="max-w-6xl mx-auto h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 max-[425px]:px-3">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 max-[425px]:gap-1 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="relative h-9 w-9 max-[425px]:h-8 max-[425px]:w-8 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
            HG
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm max-[425px]:text-xs font-bold text-slate-900 tracking-tight">
              HamroGhar
            </p>
            <p className="text-[11px] max-[425px]:text-[10px] text-blue-500 font-medium">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV (empty — future links go here) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" />

        {/* DESKTOP RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {/* 📏 Unit System Toggle */}
          <button
            type="button"
            onClick={toggleUnitSystem}
            title={unitSystem === "nepali" ? "Switch to International (M/SqFt)" : "Switch to Nepali (Cr/Aana)"}
            className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Ruler className="h-3.5 w-3.5" />
            {unitSystem === "nepali" ? "Aana/Lakh" : "SqFt/M"}
          </button>

          {/* 🌐 Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === "en" ? "Switch to Nepali" : "English मा स्विच गर्नुस्"}
            className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.langToggle}
          </button>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-700"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <LogIn className="h-4 w-4" />
                <span>{t.signIn}</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t.joinFree}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/listings/new"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                {t.postRequest}
              </Link>

              <Link
                to="/membership"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Crown className="h-3.5 w-3.5 mr-1" />
                {t.membership}
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <User className="h-3.5 w-3.5 mr-1" />
                {t.profile}
              </Link>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="text-sm text-slate-500 hover:text-red-500"
              >
                {t.logout}
              </button>
            </>
          )}
        </div>

        {/* MOBILE RIGHT SIDE */}
        <div className="flex md:hidden items-center gap-2 max-[425px]:gap-1">
          {/* Language toggle (mobile) */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === "en" ? "Switch to Nepali" : "English मा स्विच गर्नुस्"}
            className="inline-flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 h-8 w-8 max-[425px]:h-7 max-[425px]:w-7"
          >
            <Globe className="h-4 w-4 text-blue-600" />
          </button>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => handleMobileNav("/listings/new")}
              className="inline-flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 h-8 w-8 max-[425px]:h-7 max-[425px]:w-7"
              title={t.postHome}
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
            {isLoggedIn ? (
              <>
                <MobileItem
                  icon={PlusCircle}
                  label={t.postRequest}
                  onClick={() => handleMobileNav("/listings/new")}
                />
                <MobileItem
                  icon={Crown}
                  label={t.membership}
                  onClick={() => handleMobileNav("/membership")}
                />
                <MobileItem
                  icon={User}
                  label={t.profile}
                  onClick={() => handleMobileNav("/profile")}
                />
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full rounded-full border border-slate-200 py-2 text-sm text-slate-700 mt-2 hover:bg-slate-50"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <MobileItem
                  icon={LogIn}
                  label={t.signIn}
                  onClick={() => handleMobileNav("/login")}
                />
                <button
                  type="button"
                  onClick={() => handleMobileNav("/register")}
                  className="w-full rounded-full bg-blue-600 py-2 text-sm font-semibold text-white mt-2"
                >
                  {t.joinFree}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-700 py-1"
    >
      <Icon className="h-4 w-4 text-blue-500" />
      <span>{label}</span>
    </button>
  );
}
