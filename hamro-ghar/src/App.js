// src/App.js
import React, { useState, useEffect } from "react";
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

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [homeMode, setHomeMode] = useState("all"); // all, buy, rent
  const [editId, setEditId] = useState(null); // 🆕 Stores ID of listing being edited

  // Check Login Status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (data && data.user) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkUser();
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    // If navigating away from postListing, clear edit mode
    if (page !== "postListing") {
        setEditId(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🆕 Navigation helper for Editing
  const goEditListing = (listingId) => {
    setEditId(listingId);
    navigate("postListing");
  };

  // Navigation for Header
  const goBuy = () => { setHomeMode("buy"); navigate("home"); };
  const goRent = () => { setHomeMode("rent"); navigate("home"); };
  const goHome = () => { setHomeMode("all"); navigate("home"); };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate("membership");
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed", err);
    }
    setIsLoggedIn(false);
    navigate("home");
  };

  const renderPage = () => {
    if (isLoggedIn && currentPage === "membership") {
      return (
        <Membership
          onLogout={handleLogout}
          onGoHome={goHome}
          onEditListing={goEditListing} // 🆕 Pass edit handler
        />
      );
    }

    switch (currentPage) {
      case "login":
        return <Login onLogin={handleLoginSuccess} onGoRegister={() => navigate("register")} />;
      case "register":
        return <Register onGoLogin={() => navigate("login")} />;
      case "profile":
        return <UserProfile onGoHome={goHome} onLogout={handleLogout} />;
      case "postListing":
        // 🆕 Pass editId to enable edit mode in PostListing
        return <PostListing onGoHome={goHome} editId={editId} />;
      case "home":
      default:
        return (
          <HomePage
            mode={homeMode}
            onGoLogin={() => navigate("login")}
            onGoRegister={() => navigate("register")}
            onGoMembership={() => isLoggedIn ? navigate("membership") : navigate("login")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header
        isLoggedIn={isLoggedIn}
        onGoHome={goHome}
        onGoBuy={goBuy}
        onGoRent={goRent}
        onGoLogin={() => navigate("login")}
        onGoRegister={() => navigate("register")}
        onGoProfile={() => navigate("profile")}
        onGoMembership={() => isLoggedIn ? navigate("membership") : navigate("login")}
        onGoPostListing={() => { setEditId(null); navigate("postListing"); }} // Ensure clean state for new post
        onLogout={handleLogout}
      />
      <main className="flex-1 pt-24 lg:pt-28">{renderPage()}</main>
      <Footer onNav={navigate} />
      <ToastContainer position="top-center" autoClose={2000} pauseOnHover={false} theme="light" />
    </div>
  );
}

export default App;