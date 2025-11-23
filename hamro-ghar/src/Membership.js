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
import { apiFetch } from "./api";
import { ListingModal, handleToggleSaveHome } from "./ListingUtils"; // ✅ Import shared utilities

export default function Membership({ onLogout, onGoHome, onEditListing }) {
  const [savedHomes, setSavedHomes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(true);

  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState("none"); // 'saved' or 'owned'

  const [openMenuId, setOpenMenuId] = useState(null);

  // Check membership
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

  // Load saved homes
  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoadingSaved(true);
        const data = await apiFetch("/api/listings/saved/me");
        setSavedHomes(Array.isArray(data.saved) ? data.saved : []);
      } catch (err) {
        if (!err.message.includes("401")) {
          toast.error("Could not load saved homes");
        }
      } finally {
        setLoadingSaved(false);
      }
    };
    loadSaved();
  }, []);

  // Load my listings
  useEffect(() => {
    const loadMyListings = async () => {
      try {
        setLoadingMyListings(true);
        const data = await apiFetch("/api/listings/mine/all");
        setMyListings(Array.isArray(data.listings) ? data.listings : []);
      } catch (err) {
        if (!err.message.includes("401")) {
          toast.error("Could not load your posted homes");
        }
      } finally {
        setLoadingMyListings(false);
      }
    };
    loadMyListings();
  }, []);

  // Open Modal
  const openHomeModal = (home, context) => {
    setSelectedHome(home);
    setModalContext(context);
    setIsModalOpen(true);
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  // Delete listing
  const handleDeleteListing = async (listingId) => {
    if (!listingId) return;
    const confirmDelete = window.confirm("Are you sure? This cannot be undone.");
    if (!confirmDelete) return;

    try {
      await apiFetch(`/api/listings/${listingId}`, { method: "DELETE" });
      toast.success("Listing deleted");
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete listing");
    }
  };

  // Toggle Status
  const handleToggleStatus = async (listingId, currentStatus) => {
    if (!listingId) return;
    const nextStatus = currentStatus === "active" ? "unavailable" : "active";

    try {
      await apiFetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      toast.success(`Listing marked as ${nextStatus}`);
      setMyListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: nextStatus } : l))
      );
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // 🆕 Unsave handler specifically for the Saved Homes list
  // This removes the card from the UI immediately upon unsaving
  const onUnsaveHandler = async (listing) => {
    const savedIds = savedHomes.map(h => h._id);
    // Use the shared handler, but we need to provide a setter that updates the object list
    // So we wrap it manually or just call apiFetch directly for cleaner UI update
    
    try {
        await apiFetch(`/api/listings/save/${listing._id}`, { method: "DELETE" });
        toast.success("Removed from favourites");
        setSavedHomes(prev => prev.filter(h => h._id !== listing._id));
    } catch (err) {
        toast.error("Failed to unsave");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button type="button" onClick={onGoHome} className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </button>
          <Home className="h-8 w-8 text-blue-600" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Membership dashboard</h1>
          <p className="text-sm text-slate-600">Manage your posted homes and favourites.</p>
        </div>

        {/* Your posted homes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Your posted homes</h2>
            {myListings.length > 0 && <p className="text-[11px] text-slate-500">{myListings.length} listings</p>}
          </div>

          {loadingMyListings ? <p className="text-xs text-slate-500">Loading...</p> : myListings.length === 0 ? <p className="text-xs text-slate-500">No listings yet.</p> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {myListings.map((home) => (
                <div key={home._id} className="relative flex flex-col sm:flex-row sm:gap-3 rounded-2xl border border-blue-50 bg-slate-50 p-4 sm:p-3">
                  <div className="h-24 sm:h-16 w-full sm:w-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 cursor-pointer mb-2 sm:mb-0" onClick={() => openHomeModal(home, 'owned')}>
                    <img src={home.images?.[0] || "https://placehold.co/200x150"} alt="home" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{home.title}</p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">{home.price}</p>
                    <p className="mt-1"><StatusBadge status={home.status} /></p>
                  </div>
                  <button onClick={() => setOpenMenuId(prev => prev === home._id ? null : home._id)} className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                    <MoreHorizontal className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                  {openMenuId === home._id && (
                    <div className="absolute right-2 top-9 z-10 w-44 rounded-2xl bg-white border border-slate-200 shadow-lg py-1 text-[11px]">
                      <button onClick={() => handleToggleStatus(home._id, home.status)} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-700">
                        {home.status === "active" ? <ToggleRight className="h-3.5 w-3.5 text-emerald-600" /> : <ToggleLeft className="h-3.5 w-3.5 text-slate-500" />}
                        {home.status === "active" ? "Mark unavailable" : "Mark active"}
                      </button>
                      {/* 🆕 Edit Button in Dropdown */}
                      <button onClick={() => onEditListing(home._id)} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-blue-600">
                        <Home className="h-3.5 w-3.5" /> Edit Listing
                      </button>
                      <button onClick={() => handleDeleteListing(home._id)} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Homes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <h2 className="text-sm font-semibold text-slate-900">Your saved homes</h2>
            </div>
            {savedHomes.length > 0 && <p className="text-[11px] text-slate-500">{savedHomes.length} saved</p>}
          </div>

          {loadingSaved ? <p className="text-xs text-slate-500">Loading...</p> : savedHomes.length === 0 ? <p className="text-xs text-slate-500">No saved homes.</p> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {savedHomes.map((home) => (
                <div key={home._id} className="flex gap-3 rounded-2xl border border-blue-50 bg-slate-50 p-3 cursor-pointer w-full" onClick={() => openHomeModal(home, 'saved')}>
                  <div className="h-16 w-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img src={home.images?.[0] || "https://placehold.co/200x150"} alt="home" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{home.title}</p>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">{home.price}</p>
                  </div>
                  {/* 🆕 Quick remove button on the card itself */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUnsaveHandler(home); }}
                    className="shrink-0 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-colors self-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center">
            <button onClick={onLogout} className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 w-full sm:w-auto">
                <LogIn className="mr-1.5 h-4 w-4 rotate-180" /> Log out
            </button>
        </div>
      </div>

      {/* Shared Modal */}
      {isModalOpen && (
        <ListingModal 
            home={selectedHome} 
            onClose={closeHomeModal}
            isOwner={modalContext === 'owned'} // Show Edit button if owned
            isSaved={modalContext === 'saved'} // Show Unsave if saved
            onEdit={(home) => onEditListing(home._id)} // Handle edit click from modal
            onUnsave={onUnsaveHandler} // Handle unsave click from modal
        />
      )}
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold border ${isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
      {isActive ? "Active" : "Unavailable"}
    </span>
  );
};