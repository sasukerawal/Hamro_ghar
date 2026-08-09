// src/Membership.js
import React, { useEffect, useState } from "react";
import {
  Home,
  ArrowLeft,
  Heart,
  MapPin,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  LayoutDashboard,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "./api";
import { ListingModal } from "./ListingUtils";
import EmptyState from "./components/common/EmptyState";
import LoadingState from "./components/common/LoadingState";

export default function Membership({ onLogout, onGoHome, onEditListing }) {
  const [savedHomes, setSavedHomes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(true);
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // 'listings' | 'saved'
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const handleEditListingSafe = (id) => {
    if (!id) return;
    if (typeof onEditListing === "function") {
      onEditListing(id);
    } else {
      navigate(`/listings/${id}/edit`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auth check
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((d) => setUser(d?.user || null))
      .catch(() => onGoHome?.());
  }, [onGoHome]);

  // Load saved homes
  useEffect(() => {
    apiFetch("/api/listings/saved/me")
      .then((d) => setSavedHomes(Array.isArray(d.saved) ? d.saved : []))
      .catch((err) => { if (!err.message.includes("401")) toast.error("Could not load saved homes"); })
      .finally(() => setLoadingSaved(false));
  }, []);

  // Load my listings
  useEffect(() => {
    apiFetch("/api/listings/mine/all")
      .then((d) => setMyListings(Array.isArray(d.listings) ? d.listings : []))
      .catch((err) => { if (!err.message.includes("401")) toast.error("Could not load your listings"); })
      .finally(() => setLoadingMyListings(false));
  }, []);

  const openModal = (home) => { setSelectedHome(home); setIsModalOpen(true); };
  const closeModal = () => { setSelectedHome(null); setIsModalOpen(false); };

  const handleDeleteListing = async (listingId) => {
    if (!listingId || !window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/listings/${listingId}`, { method: "DELETE" });
      toast.success("Listing deleted");
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete listing");
    }
  };

  const handleToggleStatus = async (listingId, currentStatus) => {
    if (!listingId) return;
    const nextStatus = currentStatus === "active" ? "unavailable" : "active";
    try {
      await apiFetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(nextStatus === "active" ? "Listing marked active" : "Listing marked unavailable");
      setMyListings((prev) => prev.map((l) => l._id === listingId ? { ...l, status: nextStatus } : l));
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const onUnsaveHandler = async (listing) => {
    if (!listing?._id) return;
    try {
      await apiFetch(`/api/listings/save/${listing._id}`, { method: "DELETE" });
      toast.success("Removed from favourites");
      setSavedHomes((prev) => prev.filter((h) => h._id !== listing._id));
      closeModal();
    } catch (err) {
      toast.error("Failed to unsave");
    }
  };

  const initials = (user?.name || "HG").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50">
      {/* Hero banner — solid deep navy, matching the homepage CTA section */}
      <div className="relative bg-[#1A1410] text-white shadow-md overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border-[3px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border-[3px] border-white/[0.06] rotate-12" />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{user?.name || "Member"}</h1>
                <span className="stamp bg-white/10 border-white/30 text-white text-[11px]">
                  Member
                </span>
              </div>
              <p className="text-white/60 text-sm mt-0.5">{user?.email}</p>
            </div>
            {/* Quick stats — mono numerals, consistent with listing spec data elsewhere */}
            <div className="flex gap-1 shrink-0 bg-white/5 rounded-2xl border border-white/10 px-4 py-3">
              <div className="text-center px-3">
                <p className="font-mono text-2xl font-bold text-white">{loadingMyListings ? "…" : myListings.length}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium mt-0.5">Posted</p>
              </div>
              <div className="w-px bg-white/10 mx-1" />
              <div className="text-center px-3">
                <p className="font-mono text-2xl font-bold text-white">{loadingSaved ? "…" : savedHomes.length}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium mt-0.5">Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Tab bar + Post button */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm gap-1">
            <TabBtn active={activeTab === "listings"} onClick={() => setActiveTab("listings")} icon={<LayoutDashboard className="h-4 w-4" />} label="My Listings" />
            <TabBtn active={activeTab === "saved"} onClick={() => setActiveTab("saved")} icon={<Heart className="h-4 w-4" />} label="Saved" />
          </div>
          <button
            onClick={() => navigate("/listings/new")}
            className="inline-flex items-center gap-1.5 bg-gold-500 text-white text-xs font-semibold rounded-full px-5 py-2.5 hover:bg-gold-600 active:scale-95 shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Post listing
          </button>
        </div>

        {/* MY LISTINGS TAB */}
        {activeTab === "listings" && (
          <>
            {loadingMyListings ? (
              <LoadingState variant="inline" label="Loading your listings…" />
            ) : myListings.length === 0 ? (
              <EmptyState
                icon={Home}
                title="No listings yet"
                text="You haven't posted any homes. Click 'Post listing' to get started."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((home, index) => (
                  <div key={home._id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
                    <MyListingCard
                      home={home}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onView={() => openModal(home)}
                      onEdit={() => handleEditListingSafe(home._id)}
                      onToggle={() => handleToggleStatus(home._id, home.status)}
                      onDelete={() => handleDeleteListing(home._id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SAVED HOMES TAB */}
        {activeTab === "saved" && (
          <>
            {loadingSaved ? (
              <LoadingState variant="inline" label="Loading saved homes…" />
            ) : savedHomes.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No saved homes"
                text="Tap the heart icon on any listing to save it here."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedHomes.map((home, index) => (
                  <div key={home._id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
                    <SavedCard home={home} onView={() => openModal(home)} onUnsave={() => onUnsaveHandler(home)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && selectedHome && (
        <ListingModal
          home={selectedHome}
          onClose={closeModal}
          // In the Saved tab → show Unsave; in My Listings tab → show as owner (hides Save)
          isOwner={activeTab === "listings"}
          onEdit={activeTab === "listings" ? () => { handleEditListingSafe(selectedHome._id); closeModal(); } : undefined}
          onToggleSave={activeTab === "saved" ? () => onUnsaveHandler(selectedHome) : undefined}
          onUnsave={activeTab === "saved" ? () => onUnsaveHandler(selectedHome) : undefined}
          isSaved={activeTab === "saved"}
        />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        active ? "bg-gold-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MyListingCard({ home, openMenuId, setOpenMenuId, onView, onEdit, onToggle, onDelete }) {
  const img = home.images?.[0] || "https://placehold.co/300x200/eff6ff/0f172a?text=Home";
  const isActive = home.status === "active";
  const menuOpen = openMenuId === home._id;

  return (
    <div className="card-lift bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-stretch overflow-visible">
      <button
        type="button"
        onClick={onView}
        aria-label={`View ${home.title || "listing"} details`}
        className="relative block w-full h-44 overflow-hidden rounded-t-2xl cursor-pointer group text-left"
      >
        <img src={img} alt={home.title} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" onError={(e) => { e.target.src = "https://placehold.co/300x200/eff6ff/0f172a?text=Home"; }} />

        {/* Top Fade overlay */}
        <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-black/60 to-transparent"></div>

        {/* Status Badge Top Left */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md ${isActive ? "bg-emerald-500/90 text-white" : "bg-slate-800/90 text-slate-200"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></span>
          {isActive ? "Active" : "Hidden"}
        </span>

        {/* Price Tag Bottom Right */}
        <span className="absolute bottom-3 right-3 bg-gold-500/95 backdrop-blur shadow-md rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white">
          Rs. {home.price?.toLocaleString()}
        </span>
      </button>
      <div className="p-4 flex flex-col flex-1 relative z-0">
        <p className="text-base font-bold text-slate-900 line-clamp-1 mb-1">{home.title || home.address}</p>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" /> <span className="truncate">{home.location?.municipality || home.city}</span>
        </p>
        <div className="mt-auto px-1">
           <hr className="border-slate-100 mb-3" />
           <div className="flex items-center justify-between">
             <div className="flex gap-2">
               <ActionBtn onClick={onEdit} title="Edit" icon={<Edit3 className="h-4 w-4" />} />
             </div>
             <div className="relative z-50">
               <button
                 onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : home._id); }}
                 aria-label="More actions"
                 aria-haspopup="true"
                 aria-expanded={menuOpen}
                 className={`p-2 rounded-xl transition-colors ${menuOpen ? 'bg-blue-50 text-gold-700' : 'text-slate-400 hover:bg-slate-100'}`}
               >
                 <MoreHorizontal className="h-5 w-5" />
               </button>
               
               {/* Floating Action Menu dropdown */}
               {menuOpen && (
                 <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 min-w-[160px] p-2 animate-in zoom-in-95 duration-200">
                   <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                     {isActive ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-gold-600" />} {isActive ? "Hide Listing" : "Publish Listing"}
                   </button>
                   <hr className="border-slate-100 my-1 mx-2" />
                   <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                     <Trash2 className="h-4 w-4" /> Delete
                   </button>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SavedCard({ home, onView, onUnsave }) {
  const img = home.images?.[0] || "https://placehold.co/300x200/eff6ff/0f172a?text=Home";
  return (
    <div className="card-lift bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-stretch overflow-visible">
      <div
        role="button"
        tabIndex={0}
        onClick={onView}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onView();
          }
        }}
        aria-label={`View ${home.title || "listing"} details`}
        className="relative h-44 overflow-hidden rounded-t-2xl cursor-pointer group"
      >
        <img src={img} alt={home.title} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" onError={(e) => { e.target.src = "https://placehold.co/300x200/eff6ff/0f172a?text=Home"; }} />

        {/* Top Fade overlay */}
        <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-black/60 to-transparent"></div>

        <button
          onClick={(e) => { e.stopPropagation(); onUnsave(); }}
          aria-label="Remove from saved homes"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 active:scale-95 transition-all group/btn before:absolute before:inset-0 before:m-auto before:h-11 before:w-11 before:content-['']"
          title="Remove from saved"
        >
          <Heart className="h-4 w-4 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
        </button>

        <span className="absolute bottom-3 right-3 bg-gold-500/95 backdrop-blur shadow-md rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-white">
          Rs. {home.price?.toLocaleString()}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1 relative z-0">
        <p className="text-base font-bold text-slate-900 line-clamp-1 mb-1">{home.title || home.address}</p>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0" /> <span className="truncate">{home.location?.municipality || home.city}</span>
        </p>
        <div className="mt-auto px-1">
           <hr className="border-slate-100 mb-3" />
           <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
             <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-slate-400" /> {home.propertyType}</span>
             <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md text-slate-600">{home.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, icon }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 hover:text-gold-700 rounded-xl transition-all shadow-sm"
    >
      {icon} {title}
    </button>
  );
}
