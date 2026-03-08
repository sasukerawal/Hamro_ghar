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
import { Loader } from "lucide-react";

import { apiFetch } from "./api";

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

// Loading fallback for suspended routes
const FallbackSpinner = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <Loader className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [lang, setLang] = useState("en"); // 🌐 "en" | "ne" — global language toggle

  const navigate = useNavigate();

  // Check Login Status once on load — also silently refresh the JWT so it stays valid
  useEffect(() => {
    const checkUser = async () => {
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
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate("/membership");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
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
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Header appears on all pages */}
      <Header
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        lang={lang}
        onToggleLang={() => setLang((p) => (p === "en" ? "ne" : "en"))}
      />

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
                  <Membership onLogout={handleLogout} />
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
