// src/App.js
import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import HomePage from "./HomePage";
import Login from "./Login";
import Register from "./Register";
import Membership from "./Membership";
import Footer from "./Footer";
import UserProfile from "./UserProfile";



function App() {
  const [currentPage, setCurrentPage] = useState("home"); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // -----------------------------
  // CHECK IF USER IS LOGGED IN
  // -----------------------------
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        if (data.user) setIsLoggedIn(true);
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };

    checkUser();
  }, []);

  // -----------------------------
  // NAVIGATION
  // -----------------------------
  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -----------------------------
  // LOGIN SUCCESS
  // -----------------------------
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate("membership");
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    setIsLoggedIn(false);
    navigate("home");
  };

  // -----------------------------
  // PAGE RENDERER
  // -----------------------------
  const renderPage = () => {
    if (isLoggedIn && currentPage === "membership") {
      return (
        <Membership
          onLogout={handleLogout}
          onGoHome={() => navigate("home")}
        />
      );
    }

    switch (currentPage) {
      case "login":
        return (
          <Login
            onLogin={handleLoginSuccess}
            onGoRegister={() => navigate("register")}
          />
        );

      case "register":
        return <Register onGoLogin={() => navigate("login")} />;

      case "profile":
        return <UserProfile onGoHome={() => navigate("home")} />;

      case "home":
      default:
        return (
          <HomePage
            onGoLogin={() => navigate("login")}
            onGoRegister={() => navigate("register")}
            onGoMembership={() =>
              isLoggedIn ? navigate("membership") : navigate("login")
            }
          />
        );
    }
  };

  // -----------------------------
  // UI LAYOUT
  // -----------------------------
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">

      {/* HEADER */}
      <Header
        isLoggedIn={isLoggedIn}
        onGoHome={() => navigate("home")}
        onGoLogin={() => navigate("login")}
        onGoRegister={() => navigate("register")}
        onGoProfile={() => navigate("profile")}
        onGoMembership={() =>
          isLoggedIn ? navigate("membership") : navigate("login")
        }
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-24 lg:pt-28">{renderPage()}</main>

      {/* FOOTER */}
      <Footer onNav={navigate} />

      {/* GLOBAL TOASTS */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        pauseOnHover={false}
        theme="light"
      />
    </div>
  );
}

export default App;
