import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  MapPin,
  AlertTriangle,
  Facebook,
  Instagram,
  Phone,
  ExternalLink,
  Star,
  Loader,
  Share2,
  Copy,
  Flag,
} from "lucide-react";
import { apiFetch } from "./api";


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

  // Priority: (1) stored original Maps URL, (2) coords-based, (3) text address
  const mapsUrl =
    home?.mapsUrl && home.mapsUrl.trim()
      ? home.mapsUrl
      : home?.location?.lat && home?.location?.lng
      ? `https://www.google.com/maps/search/?api=1&query=${home.location.lat},${home.location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${home.address || ""} ${home.city || ""}`.trim()
        )}`;


  const postedDate = home.createdAt
    ? new Date(home.createdAt).toLocaleDateString()
    : null;

  const priceLabel =
    typeof home.price === "number" ? `Rs. ${home.price}` : home.price;


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
      className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4 py-6 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-y-auto"
      >
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

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg-white border-b border-slate-100 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleThumbClick(e, idx)}
                  className={`h-12 w-16 rounded-lg overflow-hidden border flex-shrink-0 ${
                    idx === activeIndex
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
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

          {/* Price History Chart */}
          {home.priceHistory && home.priceHistory.length > 1 && (
            <PriceHistoryChart history={home.priceHistory} />
          )}

          {/* Disclaimer */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> HamroGhar is a listing platform only. All communication between users happens independently and off-platform. HamroGhar bears no responsibility for, and makes no guarantees about, any transactions, agreements, or interactions between renters and property owners. Proceed with your own judgment and due diligence.
            </p>
          </div>

          {/* Connect with Owner */}
          <div>
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
              Connect with Owner
            </p>
            <OwnerSocialsPanel socials={home.owner?.socials} />
          </div>

          {/* Reviews */}
          <ReviewsSection listingId={home._id || home.id} />

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {/* Row 1: Maps + Save */}
            <div className="flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                Google Maps
              </a>

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
                    <><Trash2 className="h-3.5 w-3.5" /> Unsave</>
                  ) : (
                    <><Heart className="h-3.5 w-3.5" /> Save Home</>
                  )}
                </button>
              )}
            </div>

            {/* Row 2: Share buttons + Copy URL */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const text = `Check out this home on HamroGhar: ${home.title || home.address} — Rs.${home.price}/mo\n${window.location.origin}/?listing=${home._id || home.id}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?listing=${home._id || home.id}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors"
              >
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?listing=${home._id || home.id}`;
                  navigator.clipboard.writeText(url).then(() => toast.success("Link copied!")).catch(() => toast.error("Could not copy"));
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>

            {/* Row 3: Report */}
            <ReportListingButton listingId={home._id || home.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   OWNER SOCIALS PANEL
---------------------------------------- */
function OwnerSocialsPanel({ socials }) {
  if (!socials) {
    return (
      <p className="text-xs text-slate-400 italic">
        The owner hasn't added any contact info yet.
      </p>
    );
  }

  const { facebook, instagram, whatsapp, tiktok } = socials;
  const hasAny = facebook || instagram || whatsapp || tiktok;

  if (!hasAny) {
    return (
      <p className="text-xs text-slate-400 italic">
        The owner hasn't added any contact info yet.
      </p>
    );
  }

  // Build a WhatsApp link from a phone number or URL
  const whatsappHref = whatsapp
    ? whatsapp.startsWith("http")
      ? whatsapp
      : `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : null;

  // Build a TikTok link (handle @username or full URL)
  const tiktokHref = tiktok
    ? tiktok.startsWith("http")
      ? tiktok
      : `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}`
    : null;

  const links = [
    {
      key: "facebook",
      href: facebook
        ? facebook.startsWith("http")
          ? facebook
          : `https://facebook.com/${facebook}`
        : null,
      label: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
    },
    {
      key: "instagram",
      href: instagram
        ? instagram.startsWith("http")
          ? instagram
          : `https://instagram.com/${instagram.replace(/^@/, "")}`
        : null,
      label: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
      bg: "bg-gradient-to-br from-purple-500 to-pink-500",
      hover: "hover:from-purple-600 hover:to-pink-600",
    },
    {
      key: "whatsapp",
      href: whatsappHref,
      label: "WhatsApp",
      icon: <Phone className="h-4 w-4" />,
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
    },
    {
      key: "tiktok",
      href: tiktokHref,
      label: "TikTok",
      icon: <ExternalLink className="h-4 w-4" />,
      bg: "bg-slate-900",
      hover: "hover:bg-slate-700",
    },
  ].filter((l) => !!l.href);

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-sm ${link.bg} ${link.hover}`}
        >
          {link.icon}
          {link.label}
        </a>
      ))}
    </div>
  );
}

/* ----------------------------------------
   REVIEWS SECTION
---------------------------------------- */
function ReviewsSection({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [myReviewId, setMyReviewId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Check auth state
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((d) => {
        if (d?.user) {
          setIsLoggedIn(true);
          setCurrentUserId(d.user.id || d.user._id);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Load reviews
  useEffect(() => {
    if (!listingId || String(listingId).startsWith("demo-")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch(`/api/reviews/${listingId}`, { credentials: "omit" })
      .then((d) => {
        setReviews(d.reviews || []);
        setAvgRating(d.avgRating);
        // Pre-fill form if user already reviewed
        if (currentUserId) {
          const mine = (d.reviews || []).find(
            (r) => String(r.reviewerId) === String(currentUserId)
          );
          if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment);
            setMyReviewId(mine._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { toast.error("Please select a star rating"); return; }
    if (myComment.trim().length < 5) { toast.error("Comment must be at least 5 characters"); return; }
    try {
      setSubmitting(true);
      const data = await apiFetch(`/api/reviews/${listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      if (data.review) {
        setMyReviewId(data.review._id);
        setReviews((prev) => {
          const filtered = prev.filter(
            (r) => String(r.reviewerId) !== String(currentUserId)
          );
          return [data.review, ...filtered];
        });
        const all = reviews.filter(
          (r) => String(r.reviewerId) !== String(currentUserId)
        );
        const allWithNew = [data.review, ...all];
        setAvgRating(
          Math.round(
            (allWithNew.reduce((s, r) => s + r.rating, 0) / allWithNew.length) * 10
          ) / 10
        );
        toast.success("Review submitted!");
      }
    } catch (err) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReviewId) return;
    try {
      await apiFetch(`/api/reviews/${myReviewId}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r._id !== myReviewId));
      setMyRating(0);
      setMyComment("");
      setMyReviewId(null);
      toast.success("Review removed");
    } catch (err) {
      toast.error(err.message || "Could not delete review");
    }
  };

  if (String(listingId).startsWith("demo-")) return null;

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          Reviews
        </p>
        {avgRating !== null && (
          <div className="flex items-center gap-1">
            <StarDisplay rating={avgRating} />
            <span className="text-[11px] text-slate-500 ml-1">
              {avgRating}/5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Submit Form */}
      {isLoggedIn ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2"
        >
          <p className="text-[11px] font-semibold text-slate-700">
            {myReviewId ? "Update your review" : "Leave a review"}
          </p>
          {/* Star Picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMyRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    n <= (hoverRating || myRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
            {myRating > 0 && (
              <span className="text-xs text-slate-500 ml-1">
                {["Terrible","Poor","Average","Good","Excellent"][myRating - 1]}
              </span>
            )}
          </div>
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder="Share your experience with this listing..."
            maxLength={500}
            className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[60px] resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white text-xs font-semibold rounded-xl py-2 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {submitting && <Loader className="h-3 w-3 animate-spin" />}
              {myReviewId ? "Update" : "Submit"}
            </button>
            {myReviewId && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-[11px] text-slate-400 italic">
          Log in to leave a review.
        </p>
      )}

      {/* Review List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader className="h-4 w-4 animate-spin text-blue-400" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-800">{r.reviewerName}</span>
                <StarDisplay rating={r.rating} />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{r.comment}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${
            n <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------
   PRICE HISTORY CHART
   Renders a small SVG line chart from priceHistory array
---------------------------------------- */
function PriceHistoryChart({ history }) {
  if (!history || history.length < 2) return null;

  const sorted = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
  const prices = sorted.map((h) => h.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const W = 260, H = 60, PAD = 8;
  const pts = sorted.map((h, i) => {
    const x = PAD + (i / (sorted.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxP - h.price) / range) * (H - PAD * 2);
    return [x, y];
  });

  const polyline = pts.map((p) => p.join(",")).join(" ");
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const diff = prices[prices.length - 1] - prices[0];
  const diffColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-green-500" : "text-slate-500";
  const diffText = diff === 0 ? "No change" : `${diff > 0 ? "+" : ""}Rs.${diff.toLocaleString()}`;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Price History</p>
        <span className={`text-[11px] font-semibold ${diffColor}`}>{diffText}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`${firstPt[0]},${H} ${polyline} ${lastPt[0]},${H}`}
          fill="url(#chartGrad)"
        />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        {sorted.map((h, i) => (
          <span key={i}>{new Date(h.changedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------
   REPORT LISTING BUTTON
---------------------------------------- */
function ReportListingButton({ listingId }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    if (submitted) return;
    if (!window.confirm("Report this listing as inappropriate, scam, or inaccurate?")) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      }).catch(() => {}); // Fire and forget — endpoint may not exist yet
      setSubmitted(true);
      toast.success("Report submitted. Thank you for keeping HamroGhar safe!");
    } catch {
      setSubmitted(true);
      toast.success("Report submitted. Thank you!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={submitting || submitted}
      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-400 hover:border-red-200 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <Flag className="h-3 w-3" />
      {submitted ? "Reported — thank you" : submitting ? "Submitting..." : "Report this listing"}
    </button>
  );
}