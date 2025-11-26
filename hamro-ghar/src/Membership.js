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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "./api";
import { ListingModal } from "./ListingUtils";

export default function Membership({ onLogout, onGoHome, onEditListing }) {
  const [savedHomes, setSavedHomes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(true);

  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState("none"); // 'saved' | 'owned'

  const [openMenuId, setOpenMenuId] = useState(null); // which card menu is open

  const navigate = useNavigate();

  // ✅ Local helper that is always safe to call
  const handleEditListingSafe = (id) => {
    if (!id) return;
    if (typeof onEditListing === "function") {
      onEditListing(id);
    } else {
      // fallback: navigate directly
      navigate(`/listings/${id}/edit`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ Membership check (using apiFetch)
  useEffect(() => {
    const check = async () => {
      try {
        await apiFetch("/api/membership");
      } catch (e) {
        if (e.message.includes("401") || e.message.includes("Unauthorized")) {
          onGoHome();
        } else {
          console.error("Membership check failed", e);
        }
      }
    };
    check();
  }, [onGoHome]);

  // ✅ Load saved homes
  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoadingSaved(true);
        const data = await apiFetch("/api/listings/saved/me");
        setSavedHomes(Array.isArray(data.saved) ? data.saved : []);
      } catch (err) {
        if (!err.message.includes("401")) {
          console.error(err);
          toast.error("Could not load saved homes");
        }
      } finally {
        setLoadingSaved(false);
      }
    };
    loadSaved();
  }, []);

  // ✅ Load listings created by this user
  useEffect(() => {
    const loadMyListings = async () => {
      try {
        setLoadingMyListings(true);
        const data = await apiFetch("/api/listings/mine/all");
        setMyListings(Array.isArray(data.listings) ? data.listings : []);
      } catch (err) {
        if (!err.message.includes("401")) {
          console.error(err);
          toast.error("Could not load your posted homes");
        }
      } finally {
        setLoadingMyListings(false);
      }
    };
    loadMyListings();
  }, []);

  // Open / close modal
  const openHomeModal = (home, context) => {
    setSelectedHome(home);
    setModalContext(context); // 'saved' or 'owned'
    setIsModalOpen(true);
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  // 🗑️ Delete own listing
  const handleDeleteListing = async (listingId) => {
    if (!listingId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await apiFetch(`/api/listings/${listingId}`, { method: "DELETE" });

      toast.success("Listing deleted");
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete listing");
    }
  };

  // ✅ Toggle status active/unavailable for own listing
  const handleToggleStatus = async (listingId, currentStatus) => {
    if (!listingId) return;

    const nextStatus = currentStatus === "active" ? "unavailable" : "active";

    try {
      await apiFetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

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
      toast.error(err.message || "Failed to update status");
    }
  };

  // ❌ Unsave from saved homes (card + modal)
  const onUnsaveHandler = async (listing) => {
    if (!listing?._id) return;
    try {
      await apiFetch(`/api/listings/save/${listing._id}`, {
        method: "DELETE",
      });
      toast.success("Removed from favourites");
      setSavedHomes((prev) => prev.filter((h) => h._id !== listing._id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to unsave");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-blue-100 shadow-md px-4 py-7 sm:px-8 sm:py-9">
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
            Manage your posted homes, favourites, and account here.
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
                    // flex-col on mobile, flex-row on desktop
                    className="relative flex flex-col sm:flex-row gap-3 rounded-2xl border border-blue-50 bg-slate-50 p-3 sm:p-3"
                  >
                    {/* Image */}
                    <div
                      className="h-32 w-full sm:h-16 sm:w-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 cursor-pointer"
                      onClick={() => openHomeModal(home, "owned")}
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
                    <div className="flex-1 min-w-0 pr-6 sm:pr-0">
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
                      <p className="mt-2 sm:mt-1">
                        <StatusBadge status={status} />
                      </p>
                    </div>

                    {/* 3-dot menu */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === home._id ? null : home._id
                        )
                      }
                      className="absolute top-3 right-3 sm:top-2 sm:right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm"
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
                        {/* Edit option */}
                        <button
                          type="button"
                          onClick={() => handleEditListingSafe(home._id)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-blue-600"
                        >
                          <Home className="h-3.5 w-3.5" />
                          <span>Edit listing</span>
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
                  className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-blue-50 bg-slate-50 p-3 cursor-pointer"
                  onClick={() => openHomeModal(home, "saved")}
                >
                  <div className="h-32 w-full sm:h-16 sm:w-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
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
                  <div className="flex-1 min-w-0 relative">
                    <p className="text-xs font-semibold text-slate-900 truncate pr-8">
                      {home.title || home.address}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      {home.city}
                    </p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      {home.price}
                    </p>
                    {/* Quick unsave */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnsaveHandler(home);
                      }}
                      className="absolute top-0 right-0 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-slate-50 w-full sm:w-auto"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to home
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 w-full sm:w-auto"
          >
            <LogIn className="mr-1.5 h-4 w-4 rotate-180" />
            Log out
          </button>
        </div>
      </div>

      {/* Shared modal from ListingUtils */}
      {isModalOpen && (
        <ListingModal
          home={selectedHome}
          onClose={closeHomeModal}
          isOwner={modalContext === "owned"}
          isSaved={modalContext === "saved"}
          onEdit={(home) => handleEditListingSafe(home._id)}
          onUnsave={onUnsaveHandler}
        />
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
