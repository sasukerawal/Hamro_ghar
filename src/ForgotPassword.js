// src/ForgotPassword.js
import React, { useState } from "react";
import { Mail, Lock, KeyRound, ArrowLeft, Loader, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "./api";

export default function ForgotPassword({ onGoLogin }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = code + new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email address"); return; }
    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success("If an account exists, a reset code was sent to your email.");
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim()) { toast.error("Enter the 6-digit code from your email"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      setDone(true);
    } catch (err) {
      toast.error(err.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white border border-green-100 shadow-lg px-6 py-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Password reset!</h1>
          <p className="text-sm text-slate-500 mb-6">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <button
            onClick={onGoLogin}
            className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-blue-100 shadow-lg px-6 py-8">
        {/* Back button */}
        <button
          onClick={onGoLogin}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </button>

        {/* Icon + Title */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-3 shadow-md">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {step === 1 ? "Forgot your password?" : "Check your email"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto">
            {step === 1
              ? "Enter your email and we'll send you a 6-digit reset code."
              : `We sent a code to ${email}. Enter it below to create a new password.`}
          </p>
        </div>

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={sendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              Send reset code
            </button>
          </form>
        )}

        {/* Step 2 — Code + New Password */}
        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">6-digit code</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 tracking-widest font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm new password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              Reset password
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-500 hover:text-blue-600"
            >
              Resend code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
