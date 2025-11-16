// src/Membership.js
import React, { useEffect, useState } from "react";
import { Home, ArrowLeft, LogIn, Heart, MapPin } from "lucide-react";
import { toast } from "react-toastify";

export default function Membership({ onLogout, onGoHome }) {
  const [savedHomes, setSavedHomes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check membership / login
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/membership", {
          credentials: "include",
        });

        if (res.status === 401) {
          onGoHome(); // not logged in → back to home
        }
      } catch (e) {
        console.error("Membership check failed", e);
      }
    };

    check();
  }, [onGoHome]);

  // Load saved homes
  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoadingSaved(true);
        const res = await fetch(
          "http://localhost:4000/api/listings/saved/me",
          { credentials: "include" }
        );

        if (res.status === 401) {
          // not logged in, home redirect already handled above
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Could not load saved homes");
          return;
        }

        setSavedHomes(Array.isArray(data.saved) ? data.saved : []);
      } catch (err) {
        console.error(err);
        toast.error("Server error while loading saved homes");
      } finally {
        setLoadingSaved(false);
      }
    };

    loadSaved();
  }, []);

  const openHomeModal = (home) => {
    setSelectedHome(home);
    setIsModalOpen(true);
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
          <Home className="h-8 w-8 text-blue-600" />
        </div>

        {/* Title / Intro */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Membership dashboard
          </h1>
          <p className="text-sm text-slate-600">
            You are logged in. Manage saved homes, alerts and profile details
            here.
          </p>
        </div>

        {/* Three feature cards */}
        <div className="grid gap-3 sm:grid-cols-3 text-left text-xs text-slate-600 mb-8">
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
            <p>Chat with our team when you need help.</p>
          </div>
        </div>

        {/* Saved Homes Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Your saved homes
              </h2>
            </div>
            {savedHomes.length > 0 && (
              <p className="text-[11px] text-slate-500">
                {savedHomes.length} home
                {savedHomes.length > 1 ? "s" : ""} saved
              </p>
            )}
          </div>

          {loadingSaved ? (
            <p className="text-xs text-slate-500">Loading saved homes…</p>
          ) : savedHomes.length === 0 ? (
            <p className="text-xs text-slate-500">
              You haven&apos;t saved any homes yet. Tap the heart icon on a
              listing to add it here.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {savedHomes.map((home) => (
                <div
                  key={home._id}
                  className="flex gap-3 rounded-2xl border border-blue-50 bg-slate-50 p-3 cursor-pointer"
                  onClick={() => openHomeModal(home)}
                >
                  <div className="h-16 w-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={
                        home.images?.[0] ||
                        home.image ||
                        "https://placehold.co/200x150/eff6ff/0f172a?text=Home"
                      }
                      alt={home.title || home.address}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/200x150/eff6ff/0f172a?text=Home";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {home.title || home.address}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      {home.city}
                    </p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      {home.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom buttons */}
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

      {isModalOpen && (
        <ListingModal home={selectedHome} onClose={closeHomeModal} />
      )}
    </div>
  );
}

const ListingModal = ({ home, onClose }) => {
  if (!home) return null;

  const imageSrc =
    home?.images?.[0] ||
    home?.image ||
    "https://placehold.co/800x500/eff6ff/0f172a?text=Home";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg.white shadow-xl overflow-hidden bg-white">
        {/* Image */}
        <div className="h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={home.title || home.address}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-500 mb-1">
                {home.city}
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {home.title || home.address}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{home.address}</p>
            </div>
            <p className="text-base font-semibold text-blue-700">
              {home.price}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
            <span>{home.beds} beds</span>
            <span>{home.baths} baths</span>
            <span>{home.sqft} sqft</span>
            <span>{home.furnished ? "Furnished" : "Unfurnished"}</span>
            <span>{home.parking ? "Parking available" : "No parking"}</span>
            <span>{home.internet ? "Internet included" : "No internet"}</span>
            {home.petsAllowed !== undefined && (
              <span>{home.petsAllowed ? "Pets allowed" : "No pets"}</span>
            )}
          </div>

          {home.description && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {home.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
