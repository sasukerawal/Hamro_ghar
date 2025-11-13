// src/Membership.js
import React, { useEffect } from 'react';
import { Home, ArrowLeft, LogIn } from 'lucide-react';

export default function Membership({ onLogout, onGoHome }) {
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/membership', {
          credentials: 'include',
        });

        if (res.status === 401) {
          onGoHome(); // not logged in → back to home
        }
      } catch (e) {
        // if server is down, just keep user on page
        console.error('Membership check failed', e);
      }
    };

    check();
  }, [onGoHome]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9 text-center">
        <Home className="h-10 w-10 mx-auto text-blue-600 mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Membership dashboard
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          You are logged in. Here you can manage saved homes, alerts, and profile details.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 text-left text-xs text-slate-600 mb-7">
          <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
            <p className="font-semibold text-slate-900 mb-1">Saved homes</p>
            <p>Keep track of favourites in one place.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
            <p className="font-semibold text-slate-900 mb-1">Instant alerts</p>
            <p>Get a ping when new homes match your search.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
            <p className="font-semibold text-slate-900 mb-1">Support</p>
            <p>Talk to a real person when you need help.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to home
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
          >
            <LogIn className="mr-1.5 h-4 w-4 rotate-180" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
