// src/App.js
import React, { useState, useEffect, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MotionConfig } from "framer-motion";

import { apiFetch } from "./api";
import { MeasurementProvider } from "./contexts/MeasurementContext";
import LoadingState from "./components/common/LoadingState";
import ScrollProgressBar from "./components/common/ScrollProgressBar";

// Core components needed immediately
import Header from "./Header";
import HomePage from "./HomePage";
import Footer from "./Footer";
import "leaflet/dist/leaflet.css";

// Lazy-loaded pages (code-split)
const Login = lazy(() => import("./Login"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const Register = lazy(() => import("./Register"));
const Membership = lazy(() => import("./Membership"));
const UserProfile = lazy(() => import("./UserProfile"));
const PostListing = lazy(() => import("./PostListing"));
const NotFound = lazy(() => import("./NotFound"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const PropertyDetail = lazy(() => import("./PropertyDetail"));
const SafetyTips = lazy(() => import("./SafetyTips"));
const OurStory = lazy(() => import("./OurStory"));

// Loading fallback for suspended routes
const FallbackSpinner = () => <LoadingState />;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [lang, setLang] = useState("en"); // 🌐 "en" | "ne" — global language toggle

  const navigate = useNavigate();

  // Check Login Status once on load — also silently refresh the JWT so it stays valid
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setAuthChecked(true);
        return;
      }

      try {
        // 1. Verify we have a session
        const data = await apiFetch("/api/auth/me");
        if (data && data.user) {
          setIsLoggedIn(true);
          // 2. Silently refresh the cookie to extend the 7-day window
          try {
            await apiFetch("/api/auth/refresh", { method: "POST" });
          } catch (_) {
            // Refresh failing is non-fatal — user is still logged in for now
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkUser();

    // Token Auto-Refresh on focus
    const onFocus = async () => {
      if (localStorage.getItem("token")) {
        try {
          await apiFetch("/api/auth/refresh", { method: "POST" });
        } catch (_) { }
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    window.location.href = "/membership";
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    }
    setIsLoggedIn(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // still used for UserProfile
  const goHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // reducedMotion="user" makes every framer-motion animation in the app
    // (this component and any descendant) automatically honor
    // prefers-reduced-motion — one switch instead of checking it per animation.
    <MotionConfig reducedMotion="user">
    <MeasurementProvider>
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        {/* Header + scroll progress appear on all pages */}
        <Header
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          lang={lang}
          onToggleLang={() => setLang((p) => (p === "en" ? "ne" : "en"))}
        />
        <ScrollProgressBar />

        <main className="flex-1 pt-24 lg:pt-28 flex flex-col">
          <Suspense fallback={<FallbackSpinner />}>
            <Routes>
              {/* Home */}
              <Route
                path="/"
                element={
                  <HomePage
                    onGoLogin={() => navigate("/login")}
                    onGoRegister={() => navigate("/register")}
                    onGoMembership={() =>
                      navigate(isLoggedIn ? "/membership" : "/login")
                    }
                    lang={lang}
                  />
                }
              />

              {/* Auth */}
              <Route
                path="/login"
                element={
                  <Login
                    onLogin={handleLoginSuccess}
                    onGoRegister={() => navigate("/register")}
                    onForgotPassword={() => navigate("/forgot-password")}
                  />
                }
              />
              <Route
                path="/forgot-password"
                element={<ForgotPassword onGoLogin={() => navigate("/login")} />}
              />
              <Route
                path="/register"
                element={<Register onGoLogin={() => navigate("/login")} />}
              />

              {/* Profile (protected) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    isLoggedIn={isLoggedIn}
                    authChecked={authChecked}
                  >
                    <UserProfile
                      onGoHome={goHome}
                      onLogout={handleLogout}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Membership dashboard (protected) */}
              <Route
                path="/membership"
                element={
                  <ProtectedRoute
                    isLoggedIn={isLoggedIn}
                    authChecked={authChecked}
                  >
                    <Membership
                      onLogout={handleLogout}
                      onGoHome={goHome}
                    />
                  </ProtectedRoute>
                }
              />

              {/* New listing (protected) */}
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute
                    isLoggedIn={isLoggedIn}
                    authChecked={authChecked}
                  >
                    <PostListing />
                  </ProtectedRoute>
                }
              />

              {/* Edit listing (protected) */}
              <Route
                path="/listings/:id/edit"
                element={
                  <ProtectedRoute
                    isLoggedIn={isLoggedIn}
                    authChecked={authChecked}
                  >
                    <PostListing />
                  </ProtectedRoute>
                }
              />

              {/* Main Property Detail Page */}
              <Route path="/property/:id" element={<PropertyDetail />} />

              {/* Safety Tips */}
              <Route path="/safety" element={<SafetyTips />} />

              {/* Our Story — immersive brand intro */}
              <Route path="/our-story" element={<OurStory />} />

              {/* Fallback: proper 404 page */}
              <Route path="*" element={<NotFound />} />

              {/* Admin dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} authChecked={authChecked}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>

        {/* New Footer (no props) */}
        <Footer />

        <ToastContainer
          position="top-center"
          autoClose={2000}
          pauseOnHover={false}
          theme="light"
        />
      </div>
    </MeasurementProvider>
    </MotionConfig>
  );
}

/* Simple ProtectedRoute wrapper */
function ProtectedRoute({ isLoggedIn, authChecked, children }) {
  if (!authChecked) {
    // Optional: return a loading spinner instead of null
    return null;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;
