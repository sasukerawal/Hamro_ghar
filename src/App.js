// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { apiFetch } from "./api";

import Header from "./Header";
import HomePage from "./HomePage";
import Login from "./Login";
import Register from "./Register";
import Membership from "./Membership";
import Footer from "./Footer";
import UserProfile from "./UserProfile";
import PostListing from "./PostListing";
import ChatWidget from "./ChatWidget"; // ✅ NEW
import "leaflet/dist/leaflet.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // to prevent flicker

  const [currentUser, setCurrentUser] = useState(null); // ✅ store user object
  const [activeChat, setActiveChat] = useState(null); // ✅ { id, name }

  const navigate = useNavigate();

  // Check Login Status once on load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (data && data.user) {
          setIsLoggedIn(true);
          setCurrentUser(data.user); // ✅ save user
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkUser();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // refresh user data after login
    (async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to refresh user after login", err);
      }
    })();

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
    setCurrentUser(null);
    setActiveChat(null);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // still used for UserProfile
  const goHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ open chat with another user
  const handleChatWithUser = (userInfo) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    // userInfo: { id, name }
    setActiveChat(userInfo);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Header appears on all pages */}
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <main className="flex-1 pt-24 lg:pt-28">
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
                // you can later use this on the home page too
                // onChatWithUser={handleChatWithUser}
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
              />
            }
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
                <UserProfile onGoHome={goHome} onLogout={handleLogout} />
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
                  // ✅ pass callback to membership so it can open chat
                  onChatWithUser={handleChatWithUser}
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

          {/* Fallback: anything unknown -> home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* New Footer (no props) */}
      <Footer />

      {/* ✅ Global Chat Widget */}
      <ChatWidget
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        currentUser={currentUser}
        receiver={activeChat}
      />

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
    // Optional: you can return a spinner here
    return null;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;
