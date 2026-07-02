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
  Loader,
  BadgeCheck,
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
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Hero banner — solid gradient, no fade-to-white so stat text stays readable */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-xl font-bold shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold drop-shadow">{user?.name || "Member"}</h1>
                <BadgeCheck className="h-5 w-5 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm mt-0.5">{user?.email}</p>
            </div>
            {/* Quick stats — wrapped in white/20 pill so they pop on the gradient */}
            <div className="flex gap-1 shrink-0 bg-white/10 rounded-2xl border border-white/20 px-4 py-3">
              <div className="text-center px-3">
                <p className="text-2xl font-bold text-white drop-shadow">{loadingMyListings ? "…" : myListings.length}</p>
                <p className="text-[11px] text-blue-100 font-medium">Posted</p>
              </div>
              <div className="w-px bg-white/20 mx-1" />
              <div className="text-center px-3">
                <p className="text-2xl font-bold text-white drop-shadow">{loadingSaved ? "…" : savedHomes.length}</p>
                <p className="text-[11px] text-blue-100 font-medium">Saved</p>
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
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full px-4 py-2.5 hover:bg-blue-700 shadow-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post listing
          </button>
        </div>

        {/* MY LISTINGS TAB */}
        {activeTab === "listings" && (
          <>
            {loadingMyListings ? (
              <EmptyState icon={<Loader className="h-8 w-8 animate-spin text-blue-400" />} text="Loading your listings…" />
            ) : myListings.length === 0 ? (
              <EmptyState
                icon={<Home className="h-10 w-10 text-blue-200" />}
                title="No listings yet"
                text="You haven't posted any homes. Click 'Post listing' to get started."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((home) => (
                  <MyListingCard
                    key={home._id}
                    home={home}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onView={() => openModal(home)}
                    onEdit={() => handleEditListingSafe(home._id)}
                    onToggle={() => handleToggleStatus(home._id, home.status)}
                    onDelete={() => handleDeleteListing(home._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* SAVED HOMES TAB */}
        {activeTab === "saved" && (
          <>
            {loadingSaved ? (
              <EmptyState icon={<Loader className="h-8 w-8 animate-spin text-blue-400" />} text="Loading saved homes…" />
            ) : savedHomes.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-10 w-10 text-blue-200" />}
                title="No saved homes"
                text="Tap the heart icon on any listing to save it here."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedHomes.map((home) => (
                  <SavedCard key={home._id} home={home} onView={() => openModal(home)} onUnsave={() => onUnsaveHandler(home)} />
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
        active ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 opacity-60">{icon}</div>
      {title && <p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>}
      <p className="text-xs text-slate-400 max-w-xs">{text}</p>
    </div>
  );
}

function MyListingCard({ home, openMenuId, setOpenMenuId, onView, onEdit, onToggle, onDelete }) {
  const img = home.images?.[0] || "https://placehold.co/300x200/eff6ff/0f172a?text=Home";
  const isActive = home.status === "active";
  const menuOpen = openMenuId === home._id;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-stretch overflow-visible">
      <div className="relative h-44 overflow-hidden rounded-t-2xl cursor-pointer group" onClick={onView}>
        <img src={img} alt={home.title} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" onError={(e) => { e.target.src = "https://placehold.co/300x200/eff6ff/0f172a?text=Home"; }} />
        
        {/* Top Fade overlay */}
        <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-black/60 to-transparent"></div>
        
        {/* Status Badge Top Left */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md ${isActive ? "bg-emerald-500/90 text-white" : "bg-slate-800/90 text-slate-200"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></span>
          {isActive ? "Active" : "Hidden"}
        </span>
        
        {/* Price Tag Bottom Right */}
        <span className="absolute bottom-3 right-3 bg-blue-600/95 backdrop-blur shadow-md rounded-xl px-3 py-1.5 text-xs font-black text-white">
          Rs. {home.price?.toLocaleString()}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1 relative z-0">
        <p className="text-base font-bold text-slate-900 line-clamp-1 mb-1">{home.title || home.address}</p>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" /> <span className="truncate">{home.location?.municipality || home.city}</span>
        </p>
        <div className="mt-auto px-1">
           <hr className="border-slate-100 mb-3" />
           <div className="flex items-center justify-between">
             <div className="flex gap-2">
               <ActionBtn onClick={onEdit} title="Edit" icon={<Edit3 className="h-4 w-4" />} />
             </div>
             <div className="relative z-50">
               <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : home._id); }} className={`p-2 rounded-xl transition-colors ${menuOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                 <MoreHorizontal className="h-5 w-5" />
               </button>
               
               {/* Floating Action Menu dropdown */}
               {menuOpen && (
                 <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 min-w-[160px] p-2 animate-in zoom-in-95 duration-200">
                   <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                     {isActive ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-blue-500" />} {isActive ? "Hide Listing" : "Publish Listing"}
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-stretch overflow-visible">
      <div className="relative h-44 overflow-hidden rounded-t-2xl cursor-pointer group" onClick={onView}>
        <img src={img} alt={home.title} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" onError={(e) => { e.target.src = "https://placehold.co/300x200/eff6ff/0f172a?text=Home"; }} />
        
        {/* Top Fade overlay */}
        <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-black/60 to-transparent"></div>
        
        <button
          onClick={(e) => { e.stopPropagation(); onUnsave(); }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 active:scale-95 transition-all group/btn"
          title="Remove from saved"
        >
          <Heart className="h-4 w-4 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
        </button>

        <span className="absolute bottom-3 right-3 bg-blue-600/95 backdrop-blur shadow-md rounded-xl px-3 py-1.5 text-xs font-black text-white">
          Rs. {home.price?.toLocaleString()}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1 relative z-0">
        <p className="text-base font-bold text-slate-900 line-clamp-1 mb-1">{home.title || home.address}</p>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-4">
          <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" /> <span className="truncate">{home.location?.municipality || home.city}</span>
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
      className="flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 hover:text-blue-700 rounded-xl transition-all shadow-sm"
    >
      {icon} {title}
    </button>
  );
}
