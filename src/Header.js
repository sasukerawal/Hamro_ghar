// src/Header.js
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useRipple } from "./components/common/Ripple";
import {
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
    tagline: "Where your heart is",
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
    tagline: "जहाँ तपाईंको मन छ",
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
  const location = useLocation();
  const { unitSystem, toggleUnitSystem } = useMeasurement();
  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  const joinRipple = useRipple();

  const t = LANG[lang] || LANG.en;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        drawerRef.current && !drawerRef.current.contains(e.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    // Use a small timeout so the toggle click doesn't immediately re-close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  // Handle window scroll lock when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm shadow-slate-900/5 transition-all duration-300">
      {/* TOP BAR */}
      <div className="max-w-6xl mx-auto h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 max-[425px]:px-3">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 max-[425px]:gap-1.5 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/logo.png"
            alt="Ghar Logo"
            className="h-10 w-10 max-[425px]:h-8 max-[425px]:w-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
          />
          <div className="text-left leading-tight">
            <p className="text-sm max-[425px]:text-xs font-bold text-slate-900 tracking-tight">
              HamroGhar
            </p>
            {/* emerald-600 measured 3.8:1 on white, below the 4.5:1 body-text
                floor; emerald-800 clears it with margin at this small size. */}
            {/* Was max-[425px]:text-[10px] — dropped below the 11px
                functional-text floor at narrow widths. */}
            <p className="text-[11px] text-emerald-800 font-medium">
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
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Ruler className="h-3.5 w-3.5" />
            {unitSystem === "nepali" ? "Aana/Lakh" : "SqFt/M"}
          </button>

          {/* 🌐 Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === "en" ? "Switch to Nepali" : "English मा स्विच गर्नुस्"}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.langToggle}
          </button>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-gold-700"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <LogIn className="h-4 w-4" />
                <span>{t.signIn}</span>
              </Link>
              <Link
                to="/register"
                className="relative overflow-hidden inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-500 to-ember-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-gold-600 hover:to-ember-700 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                onPointerDown={joinRipple.onPointerDown}
              >
                {joinRipple.rippleLayer}
                {t.joinFree}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/listings/new"
                className="inline-flex items-center justify-center rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800 hover:bg-gold-100"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                {t.postRequest}
              </Link>

              <Link
                to="/membership"
                className="inline-flex items-center justify-center rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800 hover:bg-gold-100"
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
        <div className="flex md:hidden items-center gap-2 max-[425px]:gap-1" ref={menuRef}>
          {/* Language toggle (mobile) — visual size unchanged, tap area extended to 44px */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === "en" ? "Switch to Nepali" : "English मा स्विच गर्नुस्"}
            aria-label={lang === "en" ? "Switch to Nepali" : "Switch to English"}
            className="relative inline-flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 h-8 w-8 max-[425px]:h-7 max-[425px]:w-7 before:absolute before:inset-0 before:m-auto before:h-11 before:w-11 before:content-['']"
          >
            <Globe className="h-4 w-4 text-gold-700" />
          </button>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => handleMobileNav("/listings/new")}
              className="relative inline-flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 h-8 w-8 max-[425px]:h-7 max-[425px]:w-7 before:absolute before:inset-0 before:m-auto before:h-11 before:w-11 before:content-['']"
              title={t.postHome}
              aria-label={t.postHome}
            >
              <PlusCircle className="h-4 w-4 text-gold-700" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleMobile}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="relative inline-flex items-center justify-center rounded-full border border-slate-200 p-2 max-[425px]:p-1.5 text-slate-700 bg-white before:absolute before:inset-0 before:m-auto before:h-11 before:w-11 before:content-['']"
          >
            {/* Three bars morph into an X instead of the icon swapping instantly */}
            <span className="relative flex h-4 w-4 max-[425px]:h-3.5 max-[425px]:w-3.5 flex-col items-center justify-center">
              <motion.span
                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 0 : -5 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute h-[1.5px] w-full bg-current rounded-full origin-center"
              />
              <motion.span
                animate={{ opacity: isMobileMenuOpen ? 0 : 1, scale: isMobileMenuOpen ? 0.5 : 1 }}
                transition={{ duration: 0.15 }}
                className="absolute h-[1.5px] w-full bg-current rounded-full"
              />
              <motion.span
                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? 0 : 5 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute h-[1.5px] w-full bg-current rounded-full origin-center"
              />
            </span>
          </button>

          {/* MOBILE DRAWER — Portal rendered to <body> to escape stacking context */}
          {isMobileMenuOpen && ReactDOM.createPortal(
            <>
              {/* Dark backdrop with blur */}
              <div
                className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />
              {/* Sidebar Menu Panel */}
              <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-white z-[120] shadow-2xl border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer Header (Logo + Close) */}
                <div className="flex items-center justify-between p-5 border-b border-slate-50 mb-2">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-7 w-7" />
                    <span className="font-bold text-slate-900 text-sm">HamroGhar</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="relative p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors before:absolute before:inset-0 before:m-auto before:h-11 before:w-11 before:content-['']"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-4 py-2 flex flex-col gap-1.5 flex-1">
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
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors"
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
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={() => handleMobileNav("/register")}
                        className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-ember-600 py-2.5 text-sm font-semibold text-white hover:from-gold-600 hover:to-ember-700 transition-colors"
                      >
                        {t.joinFree}
                      </button>
                    </>
                  )}
                </div>

                {/* Drawer Footer Area (Language, etc) */}
                <div className="p-5 border-t border-slate-50 mt-auto bg-slate-50/30">
                  <button
                    onClick={onToggleLang}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest hover:text-gold-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" /> {lang === "en" ? "नेपाली" : "English"}
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
}

function MobileItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-sm text-slate-700 hover:text-gold-700 py-2 px-1 rounded-lg hover:bg-blue-50 transition-colors font-medium"
    >
      <Icon className="h-4 w-4 text-gold-600" />
      <span>{label}</span>
    </button>
  );
}
