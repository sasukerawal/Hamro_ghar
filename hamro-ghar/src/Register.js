// src/Register.js
import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { apiFetch } from "./api";
import { toast } from 'react-toastify';

// Simple component for input fields
const AuthInput = ({ id, type, label, placeholder, Icon, value, onChange }) => (
  <div className="space-y-1">
    <label
      htmlFor={id}
      className="block text-xs font-medium text-slate-700"
    >
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>
  </div>
);

export default function Register({ onGoLogin }) {
  const [step, setStep] = useState(1); // 1 = Register, 2 = Verify
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  
  // Verification Form State
  const [verificationCode, setVerificationCode] = useState('');
  
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // --- STEP 1: Submit Registration ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      // If success, backend should return requiresVerification: true
      if (res.requiresVerification) {
        toast.success('Account created! Code sent to your email.');
        setStep(2); // Move to verification step
      } else {
        // Fallback if backend doesn't use verification logic yet
        toast.success('Account created! Please sign in.');
        onGoLogin();
      }

    } catch (err) {
      // Handle specific error status codes if possible
      if (err.status === 409) {
        setError('Email is already registered. Please sign in.');
        toast.error('Email already in use.');
      } else if (err.status === 500) {
         setError('Server error. Please try again later.');
      } else {
         setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Submit Verification Code ---
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiFetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, // pass email from state
          code: verificationCode
        }),
      });

      toast.success('Email verified! Logging you in...');
      // The backend sets the auth cookie on success, so we can just go to login/dashboard
      // Ideally, onGoLogin() might just redirect to login, but if we are already logged in via cookie
      // the user might need to click 'Login' again or we can reload.
      // For smooth UX, let's send them to the login screen (or app could check auth status).
      onGoLogin(); 

    } catch (err) {
      setError(err.message || 'Verification failed. Check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-lg px-6 py-7 sm:px-8 sm:py-8">
        
        {/* HEADER */}
        <div className="mb-5 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white mb-2">
            {step === 1 ? <User className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            {step === 1 ? 'Create an account' : 'Verify Email'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {step === 1 
              ? 'Sign up to save homes, set alerts, and access your dashboard.' 
              : `We sent a 6-digit code to ${email}. Enter it below.`}
          </p>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <AuthInput
              id="reg-name"
              type="text"
              label="Full name"
              placeholder="Your name"
              Icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <AuthInput
              id="reg-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              Icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthInput
              id="reg-password"
              type="password"
              label="Password"
              placeholder="Create a strong password"
              Icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFICATION FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
             <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="123456"
                  className="block w-full text-center text-2xl tracking-widest rounded-xl border border-slate-200 bg-slate-50/60 py-3 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
             </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 mt-2"
            >
              Wrong email? Go back
            </button>
          </form>
        )}

        {/* FOOTER LINKS */}
        {step === 1 && (
          <p className="mt-4 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoLogin}
              className="font-semibold text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}