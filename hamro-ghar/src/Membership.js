// src/Membership.js
import React, { useEffect, useState } from "react";
import {
  Home,
  ArrowLeft,
  LogIn,
  Heart,
  MapPin,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";

export default function Membership({ onLogout, onGoHome }) {
  const [savedHomes, setSavedHomes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(true);

  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null); // 💡 which card menu is open

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

  // Load listings created by this user
  useEffect(() => {
    const loadMyListings = async () => {
      try {
        setLoadingMyListings(true);
        const res = await fetch(
          "http://localhost:4000/api/listings/mine/all",
          { credentials: "include" }
        );

        if (res.status === 401) {
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Could not load your posted homes");
          return;
        }

        setMyListings(Array.isArray(data.listings) ? data.listings : []);
      } catch (err) {
        console.error(err);
        toast.error("Server error while loading your posted homes");
      } finally {
        setLoadingMyListings(false);
      }
    };

    loadMyListings();
  }, []);

  const openHomeModal = (home) => {
    setSelectedHome(home);
    setIsModalOpen(true);
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  // 🗑️ Delete a listing that this user owns
  const handleDeleteListing = async (listingId) => {
    if (!listingId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/listings/${listingId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.status === 403) {
        toast.error("You can only delete listings you created.");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Failed to delete listing");
        return;
      }

      toast.success("Listing deleted");
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting listing");
    }
  };

  // ✅ Toggle status active/unavailable
  const handleToggleStatus = async (listingId, currentStatus) => {
    if (!listingId) return;

    const nextStatus = currentStatus === "active" ? "unavailable" : "active";

    try {
      const res = await fetch(
        `http://localhost:4000/api/listings/${listingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await res.json();

      if (res.status === 403) {
        toast.error("You can only update your own listing.");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }

      toast.success(
        nextStatus === "active"
          ? "Listing marked as active"
          : "Listing marked as unavailable"
      );

      setMyListings((prev) =>
        prev.map((l) =>
          l._id === listingId ? { ...l, status: nextStatus } : l
        )
      );
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating status");
    }
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
            You are logged in. Manage your posted homes, favourites, and
            account here.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-3 sm:grid-cols-3 text-left text-xs text-slate-600 mb-8">
          <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
            <p className="font-semibold text-slate-900 mb-1">Your listings</p>
            <p>See and manage the homes you have posted.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
            <p className="font-semibold text-slate-900 mb-1">Saved homes</p>
            <p>Keep track of favourites in one place.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-blue-50 p-3">
            <p className="font-semibold text-slate-900 mb-1">Support</p>
            <p>Chat with our team when you need help.</p>
          </div>
        </div>

        {/* Your posted homes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Your posted homes
            </h2>
            {myListings.length > 0 && (
              <p className="text-[11px] text-slate-500">
                {myListings.length} listing
                {myListings.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {loadingMyListings ? (
            <p className="text-xs text-slate-500">
              Loading your posted homes…
            </p>
          ) : myListings.length === 0 ? (
            <p className="text-xs text-slate-500">
              You haven&apos;t posted any homes yet. Create one from the home
              page.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myListings.map((home) => {
                const imageSrc =
                  home.images?.[0] ||
                  home.image ||
                  "https://placehold.co/200x150/eff6ff/0f172a?text=Home";
                const status = home.status || "active";

                return (
                  <div
                    key={home._id}
                    className="relative flex gap-3 rounded-2xl border border-blue-50 bg-slate-50 p-3"
                  >
                    {/* Image */}
                    <div
                      className="h-16 w-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 cursor-pointer"
                      onClick={() => openHomeModal(home)}
                    >
                      <img
                        src={imageSrc}
                        alt={home.title || home.address}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/200x150/eff6ff/0f172a?text=Home";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {home.title || home.address}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        {home.city}
                      </p>
                      <p className="text-[11px] text-blue-700 font-semibold mt-1">
                        {home.price}
                      </p>
                      <p className="mt-1">
                        <StatusBadge status={status} />
                      </p>
                    </div>

                    {/* 🍔 Little menu button */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === home._id ? null : home._id
                        )
                      }
                      className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-50"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 text-slate-600" />
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === home._id && (
                      <div className="absolute right-2 top-9 z-10 w-44 rounded-2xl bg-white border border-slate-200 shadow-lg py-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(home._id, status)
                          }
                          className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                        >
                          {status === "active" ? (
                            <ToggleRight className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          <span>
                            {status === "active"
                              ? "Mark as unavailable"
                              : "Mark as active"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(home._id)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete listing</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

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

      {/* Modal for viewing a home */}
      {isModalOpen && (
        <ListingModal home={selectedHome} onClose={closeHomeModal} />
      )}
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold border " +
        (isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500")
      }
    >
      {isActive
        ? "Active · visible in search"
        : "Unavailable · hidden from search"}
    </span>
  );
};

// Modal with scroll, backdrop click, and image gallery
const ListingModal = ({ home, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Extract dependency to a variable to satisfy ESLint
  const homeId = home ? home._id : null;

  // Reset to first image each time a new home is opened
  useEffect(() => {
    setActiveIndex(0);
  }, [homeId]);

  if (!home) return null;

  // 🔹 Handle multiple images
  const rawImages =
    (Array.isArray(home.images) && home.images.length > 0
      ? home.images
      : home.image
      ? [home.image]
      : []) || [];

  const fallbackImg =
    "https://placehold.co/800x500/eff6ff/0f172a?text=Home";

  const images = rawImages.length > 0 ? rawImages : [fallbackImg];
  const currentImage = images[activeIndex] || fallbackImg;

  const mapsUrl =
    home?.location?.lat && home?.location?.lng
      ? `https://www.google.com/maps/search/?api=1&query=${home.location.lat},${home.location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${home.address || ""} ${home.city || ""}`
        )}`;

  const postedDate = home.createdAt
    ? new Date(home.createdAt).toLocaleDateString()
    : null;

  const priceLabel =
    typeof home.price === "number" ? `Rs. ${home.price}` : home.price;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handleThumbClick = (e, idx) => {
    e.stopPropagation();
    setActiveIndex(idx);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-y-auto">
        {/* Top image + gallery */}
        <div className="relative w-full overflow-hidden">
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={currentImage}
              alt={home.title || home.address || "Home"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImg;
              }}
            />
            <div className="absolute inset-0 bg-gradient.to-t from-black/40 via.black/5 to.transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg.white/90 px-3 py-1 text-[11px] font-semibold text-slate-800 hover:bg.white shadow-sm"
            >
              Close
            </button>
            {priceLabel && (
              <div className="absolute left-4 bottom-4 rounded-full bg.white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow">
                {priceLabel}
                <span className="ml-1 text-[10px] font-normal text-slate-500">
                  / month
                </span>
              </div>
            )}

            {/* ⬅️➡️ arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg.black/40 p-1.5 text-white hover:bg.black/60"
                >
                  <ToggleLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg.black/40 p-1.5 text-white hover:bg.black/60"
                >
                  <ToggleRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg.white/95 border-t border-slate-100 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleThumbClick(e, idx)}
                  className={`h-14 w-20 rounded-xl overflow-hidden border ${
                    idx === activeIndex
                      ? "border-blue-500"
                      : "border-slate-200"
                  } flex-shrink-0`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-sm">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase text-blue-500 tracking-[0.16em] mb-1">
                {home.city || "Listed home"}
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {home.title || home.address || "Home for rent"}
              </h3>
              {home.address && (
                <p className="text-xs text-slate-500 mt-1">{home.address}</p>
              )}
            </div>
            <div className="text-right text-[11px] text-slate-500">
              {postedDate && (
                <p>
                  Posted on <span className="font-medium">{postedDate}</span>
                </p>
              )}
              {home._id && (
                <p className="mt-0.5">ID: {String(home._id).slice(-6)}</p>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <SpecPill>{home.beds} beds</SpecPill>
            <SpecPill>{home.baths} baths</SpecPill>
            <SpecPill>{home.sqft} sqft</SpecPill>
          </div>

          {/* Amenities */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.14em]">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              <AmenityTag active={!!home.furnished}>Furnished</AmenityTag>
              <AmenityTag active={!!home.internet}>Internet</AmenityTag>
              <AmenityTag active={!!home.parking}>Parking</AmenityTag>
              <AmenityTag
                active={home.petsAllowed !== undefined && home.petsAllowed}
              >
                Pets allowed
              </AmenityTag>
            </div>
          </div>

          {/* Description */}
          {home.description && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.14em]">
                Description
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {home.description}
              </p>
            </div>
          )}

          {/* Location / map */}
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700 mb-0.5">Location</p>
              {home.location?.lat && home.location?.lng ? (
                <p>
                  Lat: {home.location.lat.toFixed(4)}, Lng:{" "}
                  {home.location.lng.toFixed(4)}
                </p>
              ) : (
                <p>Map location based on address.</p>
              )}
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecPill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
    {children}
  </span>
);

const AmenityTag = ({ active, children }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border " +
      (active
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white text-slate-500")
    }
  >
    {children}
  </span>
);
