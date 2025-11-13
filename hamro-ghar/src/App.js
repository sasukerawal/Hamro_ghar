// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import HomePage from './HomePage';
import Login from './Login';
import Register from './Register';
import Membership from './Membership';
import Footer from './Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'login' | 'register' | 'membership'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/me', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.user) setIsLoggedIn(true);
      } catch (err) {
        console.error('Auth check failed', err);
      }
    };

    checkUser();
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('membership');
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed', err);
    }
    setIsLoggedIn(false);
    navigate('home');
  };

  const renderPage = () => {
    if (isLoggedIn && currentPage === 'membership') {
      return (
        <Membership
          onLogout={handleLogout}
          onGoHome={() => navigate('home')}
        />
      );
    }

    switch (currentPage) {
      case 'login':
        return (
          <Login
            onLogin={handleLoginSuccess}
            onGoRegister={() => navigate('register')}
          />
        );
      case 'register':
        return <Register onGoLogin={() => navigate('login')} />;
      case 'home':
      default:
        return (
          <HomePage
            onGoLogin={() => navigate('login')}
            onGoRegister={() => navigate('register')}
            onGoMembership={() =>
              isLoggedIn ? navigate('membership') : navigate('login')
            }
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header
        currentPage={currentPage}
        isLoggedIn={isLoggedIn}
        onNav={navigate}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 pt-16 lg:pt-20">
        {renderPage()}
      </main>
      <Footer onNav={navigate} />
    </div>
  );
}

export default App;
