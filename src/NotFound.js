// src/NotFound.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { HomeIcon, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="text-center max-w-md">
        {/* Big colorful 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] sm:text-[160px] font-black text-blue-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-white shadow-xl border border-blue-100 flex items-center justify-center">
              <HomeIcon className="h-10 w-10 text-gold-600" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mb-8">
          Looks like this home doesn't exist — or it may have been moved.
          Let's get you back to finding your perfect place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gold-500 text-white text-sm font-semibold hover:bg-gold-600 shadow-sm"
          >
            <Search className="h-4 w-4" />
            Browse homes
          </button>
        </div>
      </div>
    </div>
  );
}
