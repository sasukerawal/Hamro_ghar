// src/ListingUtils.js
import React, { useMemo, useState } from "react";
import {
  Heart,
  MapPin,
  X,
  ChevronRight,
  Copy,
  Send,
  MessageCircle,
  Home as HomeIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "./api";
import { HOSTEL_TYPE_LABELS } from "./data/nepalLocations";

/* ===============================
   Small helpers
=============================== */

/**
 * Format price as "Rs. 25,000"
 * - null/undefined/"" => "—"
 * - string/number both supported
 */
export function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "—";
  if (isLandAreaObject(price)) return formatArea(price);
  const n = Number(price);
  if (!Number.isFinite(n)) return String(price);
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

/**
 * "2 beds • 1 bathroom • 800 sqft"
 */
export function formatDetails(home) {
  if (!home) return "";
  const parts = [];

  const beds = home.beds;
  if (beds !== undefined && beds !== null && beds !== "") {
    parts.push(`${beds} bed${beds === 1 ? "" : "s"}`);
  }

  const baths = home.baths;
  if (baths !== undefined && baths !== null && baths !== "") {
    parts.push(`${baths} bathroom${baths === 1 ? "" : "s"}`);
  }

  const areaLabel = formatArea(home.sqft);
  if (areaLabel !== "\u2014") {
    parts.push(areaLabel);
  }

  return parts.join(" • ");
}

function isLandAreaObject(value) {
  return (
    !!value &&
    typeof value === "object" &&
    ("ropani" in value || "aana" in value || "paisa" in value || "daam" in value)
  );
}

export function formatArea(value) {
  if (value === null || value === undefined || value === "") return "\u2014";

  if (isLandAreaObject(value)) {
    const ropani = Number(value.ropani || 0);
    const aana = Number(value.aana || 0);
    const paisa = Number(value.paisa || 0);
    const daam = Number(value.daam || 0);

    const parts = [];
    if (ropani) parts.push(`${ropani} ropani`);
    if (aana) parts.push(`${aana} aana`);
    if (paisa) parts.push(`${paisa} paisa`);
    if (daam) parts.push(`${daam} daam`);

    return parts.length ? parts.join(" ") : "\u2014";
  }

  const n = Number(value);
  if (Number.isFinite(n)) return `${n.toLocaleString("en-IN")} sqft`;
  return `${String(value)} sqft`;
}

/**
 * Helper used by HomePage to toggle favourite (save / unsave)
 * Signature matches previous implementation:
 *   handleToggleSaveHome(home, savedIds, setSavedIds, onGoLogin)
 */
export async function handleToggleSaveHome(
  home,
  savedIds,
  setSavedIds,
  onGoLogin
) {
  if (!home?._id && !home?.id) return;

  const listingId = home._id || home.id;
  const isSaved = savedIds.includes(listingId);

  try {
    if (isSaved) {
      await apiFetch(`/api/listings/save/${listingId}`, { method: "DELETE" });
      setSavedIds((prev) => prev.filter((id) => id !== listingId));
      toast.success("Removed from favourites");
    } else {
      await apiFetch(`/api/listings/save/${listingId}`, { method: "POST" });
      setSavedIds((prev) => [...prev, listingId]);
      toast.success("Added to favourites");
    }
  } catch (err) {
    if (String(err.message || "").includes("401")) {
      if (typeof onGoLogin === "function") {
        onGoLogin();
      }
      return;
    }
    console.error(err);
    toast.error("Something went wrong, please try again.");
  }
}

/* ===============================
   ListingCard
   - supports BOTH APIs:
     - onClick
     - onOpenHome(home)
=============================== */

export function ListingCard({
  home,
  onClick,
  onToggleSave,
  isSaved,
  onOpenHome,
  className = "",
}) {
  if (!home) return null;

  const imageSrc =
    home?.images?.[0] ||
    home?.image ||
    "https://placehold.co/400x260/eff6ff/0f172a?text=Home";

  const priceLabel = formatPrice(home?.price);
  const detailLabel = formatDetails(home);

  const handleCardClick = () => {
    if (onClick) {
      onClick(home);
    } else if (onOpenHome) {
      onOpenHome(home);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onToggleSave?.(home);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-blue-500/30 ${className}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={home?.title || home?.address || "Home"}
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x260/eff6ff/0f172a?text=Home";
          }}
        />
        <button
          type="button"
          onClick={handleSaveClick}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <Heart
            className={`h-4 w-4 ${
              isSaved ? "fill-pink-500 text-pink-500" : "text-slate-600"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {home?.title || home?.address || "Untitled home"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span>{home?.municipality || home?.city || "—"}</span>
            </p>
          </div>
          {home?.type === "wanted" ? (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
              Wanted
            </span>
          ) : home?.category === "hostel" && home?.hostelType ? (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
              {HOSTEL_TYPE_LABELS[home.hostelType]} hostel
            </span>
          ) : null}
        </div>

        {priceLabel && priceLabel !== "—" && (
          <p className="text-sm font-semibold text-blue-700">{priceLabel}</p>
        )}
        {detailLabel && (
          <p className="text-[11px] text-slate-500">{detailLabel}</p>
        )}
      </div>
    </div>
  );
}

/* ===============================
   ListingModal
   MERGED PROPS (supports both versions):
   - Old:
     { isOpen, onClose, home, context, onUnsave, onEditListing, onChat }
   - New:
     { home, onClose, onToggleSave, isSaved, isOwner, onEdit, onUnsave, onChat }
=============================== */

export function ListingModal({
  // old props
  isOpen,
  onClose,
  home,
  context = "none", // 'saved' | 'owned' | 'none'
  onUnsave,
  onEditListing,
  onChat,
  // new props
  onToggleSave,
  isSaved = false,
  isOwner = false, // not strictly needed but kept for compatibility
  onEdit,
}) {
  const [copiedTemplateIndex, setCopiedTemplateIndex] = useState(null);

  const imageSrc =
    home?.images?.[0] ||
    home?.image ||
    "https://placehold.co/600x360/eff6ff/0f172a?text=Home";

  const priceLabel = formatPrice(home?.price);
  const detailLabel = formatDetails(home);
  const isWanted = home?.type === "wanted";

  // ✅ Hooks MUST come before any early return
  const messageTemplates = useMemo(() => {
    if (!home) return [];
    if (isWanted) {
      // Renter is requesting a home – owner might be responding
      return [
        "Hi, I saw your home request and I might have something that matches. Is it still available?",
        "Namaste, I saw your wanted post. Could you share more about your requirements and move-in date?",
        "Hello, I think I have a home that matches your budget and area. When can we talk?",
      ];
    }
    // Normal case: viewer is renter, listing is an offer
    return [
      "Hi, I saw your home listing on HamroGhar. Is it still available?",
      "Namaste, I like your home listing. Can we schedule a visit?",
      "Hello, I’m interested in this home. Could you share more details about the rooms and facilities?",
    ];
  }, [home, isWanted]);

  const googleMapsUrl = useMemo(() => {
    if (!home) return null;
    const q = [home.address, home.city].filter(Boolean).join(", ");
    if (!q) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q
    )}`;
  }, [home]);

  // Open/close logic:
  // - If isOpen is provided, respect it
  // - Else, simply open when home is not null
  const shouldOpen =
    isOpen !== undefined ? Boolean(isOpen && home) : Boolean(home);
  if (!shouldOpen) return null;

  const handleCopyTemplate = (text, index) => {
    if (!navigator.clipboard) {
      toast.error("Clipboard not supported on this browser");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedTemplateIndex(index);
        toast.success("Message copied! Paste it in your chat or SMS.");
        setTimeout(() => setCopiedTemplateIndex(null), 1500);
      })
      .catch(() => {
        toast.error("Failed to copy text");
      });
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
    if (!onChat) return;

    let ownerId = home.ownerId;
    let ownerName = "Owner";

    if (ownerId && typeof ownerId === "object") {
      ownerName = ownerId.name || ownerId.fullName || "Owner";
      ownerId = ownerId._id || ownerId.id || ownerId; // fallback
    } else if (home.ownerName) {
      ownerName = home.ownerName;
    }

    if (!ownerId) {
      toast.error("Owner information is not available for chat.");
      return;
    }

    onChat({ id: ownerId, name: ownerName });
    // Old behaviour: close after opening chat
    if (onClose) onClose();
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onToggleSave) onToggleSave(home);
  };

  const handleUnsaveClick = () => {
    if (onUnsave) onUnsave(home);
  };

  const handleEditClick = () => {
    if (onEditListing && home?._id) {
      onEditListing(home._id);
    } else if (onEdit) {
      onEdit(home);
    }
  };

  const showSaveButton = !!onToggleSave;
  const showUnsaveButton = !!onUnsave || context === "saved";
  const showEditButton = !!onEditListing || !!onEdit || context === "owned";
  const showChatButton = !!onChat;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 px-3 py-6">
      <div className="relative flex w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-blue-600" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-900">
                {home.title || home.address || "Untitled home"}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-slate-500">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span>{home.municipality || home.city}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-5 sm:pt-4 sm:pb-5">
          {/* Image */}
          <div className="mb-3 overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={imageSrc}
              alt={home.title || home.address}
              className="h-48 w-full object-cover sm:h-56"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x360/eff6ff/0f172a?text=Home";
              }}
            />
          </div>

          {/* Top details */}
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {home.title || home.address}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span>{home.address || home.city}</span>
              </p>
            </div>
            <div className="text-right">
              {priceLabel && priceLabel !== "—" && (
                <p className="text-sm font-semibold text-blue-700">
                  {isWanted ? "Budget: " : ""}
                  {priceLabel}
                </p>
              )}
              {detailLabel && (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {detailLabel}
                </p>
              )}
              {home.type === "wanted" && (
                <p className="mt-1 inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                  Housing request
                </p>
              )}
              {home.category === "hostel" && home.hostelType && (
                <p className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">
                  {HOSTEL_TYPE_LABELS[home.hostelType]} hostel
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-3 rounded-2xl bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-slate-700 mb-1">
              {isWanted ? "What they are looking for" : "Description"}
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {home.description}
            </p>
          </div>

          {/* Amenities / Requirements */}
          <div className="mb-3 grid gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-700 sm:grid-cols-2">
            <p className="col-span-full mb-1 font-semibold">
              {isWanted ? "Requirements / preferences" : "Amenities"}
            </p>
            <AmenityItem
              label={isWanted ? "Needs furnished" : "Furnished"}
              value={home.furnished}
            />
            <AmenityItem
              label={isWanted ? "Needs parking" : "Parking available"}
              value={home.parking}
            />
            <AmenityItem
              label={isWanted ? "Needs internet" : "Internet included"}
              value={home.internet}
            />
            <AmenityItem label="Pets allowed" value={home.petsAllowed} />
          </div>

          {/* Contact templates */}
          <div className="rounded-2xl bg-blue-50 px-3 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-blue-900">
                {isWanted
                  ? "Suggested replies to this request"
                  : "Message templates to contact the owner"}
              </p>
            </div>
            <div className="space-y-1.5">
              {messageTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopyTemplate(t, idx)}
                  className="flex w-full items-start gap-2 rounded-xl bg-white px-3 py-2 text-left text-[11px] text-slate-700 hover:bg-slate-50 border border-blue-100"
                >
                  <Copy className="mt-[2px] h-3.5 w-3.5 text-blue-500" />
                  <span className="flex-1">{t}</span>
                  {copiedTemplateIndex === idx && (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Copied
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-blue-900/70">
              <Send className="h-3 w-3" />
              <span>
                Paste this into your preferred chat app or use the chat button
                below.
              </span>
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Chat button */}
            {showChatButton && (
              <button
                type="button"
                onClick={handleChatClick}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with owner
              </button>
            )}

            {/* Save button (HomePage style) */}
            {showSaveButton && (
              <button
                type="button"
                onClick={handleSaveClick}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    isSaved ? "fill-pink-500 text-pink-500" : "text-blue-600"
                  }`}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
            )}

            {/* Google Maps link */}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>Open in Google Maps</span>
                <ChevronRight className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Saved / Edit / Close actions */}
          <div className="flex flex-wrap justify-end gap-2">
            {showUnsaveButton && (
              <button
                type="button"
                onClick={handleUnsaveClick}
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-[11px] font-semibold text-pink-600 hover:bg-pink-100"
              >
                <Heart className="h-3.5 w-3.5 fill-pink-500" />
                <span>Remove from favourites</span>
              </button>
            )}

            {showEditButton && (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                <HomeIcon className="h-3.5 w-3.5" />
                <span>Edit listing</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AmenityItem({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-700">
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
          value
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-slate-100 text-slate-500 border border-slate-200"
        }`}
      >
        {value ? "✓" : "–"}
      </span>
      <span>{label}</span>
    </div>
  );
}
