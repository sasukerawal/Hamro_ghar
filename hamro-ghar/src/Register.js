// src/Register.js
import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';

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
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      alert('Account created! Please sign in.');
      onGoLogin();
    } catch (err) {
      setError('Server error. Is your backend running?');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-lg px-6 py-7 sm:px-8 sm:py-8">
        <div className="mb-5 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white mb-2">
            <User className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Create an account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign up to save homes, set alerts, and access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="mt-1 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Continue
          </button>
        </form>

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
      </div>
    </div>
  );
}
