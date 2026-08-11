// src/Login.js
import React, { useState } from 'react';
import { LogIn, Mail, Lock, CheckCircle } from 'lucide-react';
import { toast } from "react-toastify";
import { apiFetch } from "./api";

const AuthInput = ({ id, type, label, placeholder, Icon, value, onChange }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-xs font-medium text-slate-700">{label}</label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required
        className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>
  </div>
);

export default function Login({ onLogin, onGoRegister, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Unverified-account recovery — reached when /login 403s with
  // requiresVerification. Previously this just showed the error text with
  // no way forward: no email delivery on the free Render tier, and no route
  // back to a code-entry step. Mirrors the inline-code pattern already used
  // by Register.js / ForgotPassword.js.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [displayedCode, setDisplayedCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const requestFreshCode = async (targetEmail) => {
    try {
      const res = await apiFetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      setDisplayedCode(res.code || '');
    } catch (err) {
      toast.error(err.message || 'Failed to generate a verification code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }
      toast.success("Login successful!");
      onLogin();
    } catch (err) {
      if (err.status === 403 && err.data?.requiresVerification) {
        setNeedsVerification(true);
        requestFreshCode(err.data.email || email);
        return;
      }
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const data = await apiFetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verifyCode }),
      });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }
      toast.success('Email verified! Logging you in...');
      onLogin();
    } catch (err) {
      toast.error(err.message || 'Verification failed. Check the code.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    await requestFreshCode(email);
    toast.success('New code generated!');
    setResending(false);
  };

  if (needsVerification) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-lg px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-5 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-white mb-2">
              <CheckCircle className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Verify Email</h1>
            <p className="mt-1 text-xs text-slate-500">
              This account isn't verified yet. Enter the 6-digit code below.
            </p>
          </div>

          {displayedCode && (
            <div className="mb-5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-center">
              <p className="text-xs text-slate-600">Your verification code</p>
              <p className="text-2xl font-bold tracking-widest text-gold-700">{displayedCode}</p>
              <p className="mt-2 text-[11px] text-slate-400">
                We're showing your code here instead of emailing it while we finish setting up email delivery.
              </p>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Verification Code</label>
              <input
                type="text"
                maxLength="6"
                placeholder="123456"
                className="block w-full text-center text-2xl tracking-widest rounded-xl border border-slate-200 bg-slate-50/60 py-3 text-slate-900 placeholder:text-slate-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="mt-1 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gold-600 disabled:opacity-70"
            >
              {verifying ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              disabled={resending}
              onClick={handleResendCode}
              className="w-full text-xs text-gold-700 font-semibold hover:underline mt-4"
            >
              {resending ? 'Sending...' : "Didn't get it? Resend code"}
            </button>

            <button
              type="button"
              onClick={() => setNeedsVerification(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 mt-2"
            >
              Back to sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-lg px-6 py-7 sm:px-8 sm:py-8">
        <div className="mb-5 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-white mb-2">
            <LogIn className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-xs text-slate-500">Sign in to open your HamroGhar membership dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput id="login-email" type="email" label="Email" placeholder="user@example.com" Icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <AuthInput id="login-password" type="password" label="Password" placeholder="password123" Icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
            {onForgotPassword && (
              <div className="text-right mt-1">
                <button type="button" onClick={onForgotPassword} className="text-[11px] text-gold-700 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" className="mt-1 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gold-600">
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          Don&apos;t have an account yet?{' '}
          <button type="button" onClick={onGoRegister} className="font-semibold text-gold-700 hover:text-gold-800 underline-offset-2 hover:underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}