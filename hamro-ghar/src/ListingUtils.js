import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Heart,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  MapPin, // ✅ Added missing import
} from "lucide-react";
import { apiFetch } from "./api";

const messageTemplates = [
  "Hi, I saw your listing on HamroGhar. Is this home still available?",
  "Hello, I’m interested in your listing. Can we schedule a viewing this week?",
  "Hi, could you please share more details about utilities, internet and any extra fees?",
];

// Reusable Helper Components
export const SpecPill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
    {children}
  </span>
);

export const AmenityTag = ({ active, children }) => (
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

/**
 * Helper to save/unsave a home.
 * Used by HomePage to toggle hearts.
 */
export async function handleToggleSaveHome(listing, savedIds, setSavedIds, onGoLogin) {
  const id = listing?._id || listing?.id;
  if (!id) return;

  if (String(id).startsWith("demo-")) {
    toast.info("Demo homes can't be saved.");
    return;
  }

  const isSaved = savedIds.includes(id);

  try {
    await apiFetch(`/api/listings/save/${id}`, {
      method: isSaved ? "DELETE" : "POST",
    });

    toast.success(
      isSaved ? "Removed from your favourites" : "Home saved to favourites ❤️"
    );

    setSavedIds((prev) =>
      isSaved ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  } catch (err) {
    if (err.message.includes("401") && onGoLogin) {
      toast.info("Please log in to save homes.");
      onGoLogin();
    } else {
      toast.error(err.message || "Could not update saved status");
    }
  }
}

/**
 * Shared Modal Component
 */
export function ListingModal({
  home,
  onClose,
  onToggleSave, // Standard toggle (Home page)
  isSaved,
  isOwner = false, // If true, show Edit button
  onEdit, // Handler for Edit click
  onUnsave, // Specific handler for "Remove from Saved" (Membership page)
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const homeKey = home ? home._id || home.id : null;

  useEffect(() => {
    setActiveIndex(0);
  }, [homeKey]);

  if (!home) return null;

  const rawImages =
    (Array.isArray(home.images) && home.images.length > 0
      ? home.images
      : home.image
      ? [home.image]
      : []) || [];

  const fallbackImg = "https://placehold.co/800x500/eff6ff/0f172a?text=Home";
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

  const handleCopyTemplate = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied!");
    } catch (err) {
        // Fallback for iframes/older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            toast.success("Message copied!");
        } catch (e) {
            toast.error("Manual copy required.");
        }
        document.body.removeChild(textArea);
    }
  };

  // Handle background click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Edit handler
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(home);
      onClose();
    }
  };

  // Save/Unsave handler
  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (onUnsave && isSaved) {
      // Special mode for Membership page (Remove directly)
      onUnsave(home);
      onClose(); 
    } else if (onToggleSave) {
      // Standard toggle
      onToggleSave(home);
    }
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
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-y-auto animate-scale-up-down" style={{animation: 'none'}}>
        {/* Image Area */}
        <div className="relative w-full overflow-hidden bg-slate-100">
          <div className="relative h-56 sm:h-64 w-full">
            <img
              src={currentImage}
              alt="Home"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImg;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Top Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              {isOwner && (
                <button
                  onClick={handleEditClick}
                  className="bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
              >
                Close
              </button>
            </div>

            {/* Price Badge */}
            {priceLabel && (
              <div className="absolute left-4 bottom-4 bg-white/95 px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                {priceLabel}
                <span className="ml-1 font-normal text-slate-500">/mo</span>
              </div>
            )}

            {/* Gallery Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails - Hidden if only 1 image */}
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg-white border-b border-slate-100 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleThumbClick(e, idx)}
                  className={`h-12 w-16 rounded-lg overflow-hidden border flex-shrink-0 ${
                    idx === activeIndex ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx}`}
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

        {/* Content Area */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Title Row */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
                {home.city || "Listed Home"}
              </p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                {home.title || home.address || "Home for rent"}
              </h3>
              {home.address && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {home.address}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">
                {postedDate ? `Posted ${postedDate}` : ""}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1">
                <Eye className="h-3 w-3" /> {home.views || 0} views
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2">
            <SpecPill>{home.beds} Beds</SpecPill>
            <SpecPill>{home.baths} Baths</SpecPill>
            {home.sqft && <SpecPill>{home.sqft} Sqft</SpecPill>}
          </div>

          {/* Description */}
          {home.description && (
            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {home.description}
            </div>
          )}

          {/* Amenities */}
          <div>
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              <AmenityTag active={!!home.furnished}>Furnished</AmenityTag>
              <AmenityTag active={!!home.internet}>Internet</AmenityTag>
              <AmenityTag active={!!home.parking}>Parking</AmenityTag>
              <AmenityTag active={!!home.petsAllowed}>Pets Allowed</AmenityTag>
            </div>
          </div>

          {/* Contact / Templates */}
          <div>
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
              Contact Owner
            </p>
            <div className="space-y-2">
              {messageTemplates.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyTemplate(msg)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                >
                  <span className="text-xs text-slate-600 group-hover:text-blue-700 line-clamp-1">
                    {msg}
                  </span>
                  <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              Google Maps
            </a>

            {/* Save/Unsave Logic */}
            {!isOwner && (
                <button
                onClick={handleHeartClick}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    isSaved
                    ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                    : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                }`}
                >
                {isSaved ? (
                    <>
                    <Trash2 className="h-3.5 w-3.5" /> Unsave
                    </>
                ) : (
                    <>
                    <Heart className="h-3.5 w-3.5" /> Save Home
                    </>
                )}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}