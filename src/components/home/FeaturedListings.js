import React from "react";
import { ChevronLeft, ChevronRight, Heart, MapPin, Eye } from "lucide-react";
import { useMeasurement } from "../../contexts/MeasurementContext";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import AdBanner from "../ads/AdBanner";

// Skeleton shimmer card
export const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden animate-pulse">
    <div className="h-40 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div className="p-3.5 space-y-2">
      <div className="h-4 bg-slate-200 rounded-full w-3/4" />
      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
      <div className="flex gap-2 pt-1">
        <div className="h-3 bg-slate-100 rounded-full w-12" />
        <div className="h-3 bg-slate-100 rounded-full w-12" />
        <div className="h-3 bg-slate-100 rounded-full w-12" />
      </div>
    </div>
  </div>
);

export const FeaturedListings = ({
  t,
  listings,
  loading,
  onToggleSave,
  onOpenHome,
  savedIds,
  page,
  totalPages,
  onPageChange,
  feedAd,
}) => {
  const { ref, isVisible } = useScrollReveal();

  return (
  <section ref={ref} className="bg-slate-50 py-10">
    <div className={`max-w-6xl mx-auto px-4 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
            {t.listingsLabel}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
            {t.listingsTitle}
          </h2>
        </div>
        {!loading && listings.length > 0 && (
          <p className="text-xs text-slate-500 font-mono">{t.listingsPage} {page} {t.listingsOf} {totalPages}</p>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-base font-semibold text-slate-700">{t.listingsEmpty}</p>
          <p className="text-xs text-slate-500 mt-1">{t.listingsEmptyHint}</p>
        </div>
      ) : (
        <>
          {/* Masonry: CSS columns so varying card heights (photo aspect ratio,
              badge count, title length) stack naturally instead of forcing
              a uniform row grid. break-inside-avoid keeps each card intact. */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:balance]">
            {listings.map((home, index) => {
              const id = home._id || home.id;
              const isSaved = savedIds.includes(id);
              const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
              // Vary the photo height per card so the masonry effect is real,
              // not a grid that merely happens to use column layout.
              const photoHeight = ["h-40", "h-56", "h-48", "h-64", "h-44"][index % 5];

              return (
                <React.Fragment key={id}>
                  <div className={`break-inside-avoid mb-6 animate-fade-in-up ${staggerClass}`}>
                    <ListingCard
                      home={home}
                      onToggleSave={onToggleSave}
                      onOpenHome={onOpenHome}
                      isSaved={isSaved}
                      isVirtualized={false}
                      photoHeight={photoHeight}
                    />
                  </div>

                  {/* Inline Feed Ad Placement */}
                  {feedAd && index === 5 && (
                    <div className="break-inside-avoid mb-6">
                      <AdBanner ad={feedAd} className="h-32 w-full" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {t.listingsPrev}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => pg !== page && onPageChange(pg)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold font-mono transition-all ${pg === page
                    ? "bg-gold-500 text-white shadow-sm"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.listingsNext} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </section>
  );
};

export const ListingCard = ({ home, onToggleSave, onOpenHome, isSaved, isVirtualized, photoHeight = "h-40" }) => {
  const { formatPrice, formatArea } = useMeasurement();
  const imageSrc =
    home.images?.[0] ||
    home.image ||
    "https://placehold.co/600x400/eff6ff/0f172a?text=Home";

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onToggleSave(home);
  };

  return (
    <div
      className={`card-lift group rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden cursor-pointer flex flex-col ${isVirtualized ? "h-full" : "sm:block"}`}
      onClick={() => onOpenHome(home)}
    >
      <div className={`relative ${photoHeight} w-full overflow-hidden`}>
        <img
          src={imageSrc}
          alt={home.address}
          width={400}
          height={160}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x400/eff6ff/0f172a?text=Home";
          }}
        />
        {/* Verification Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
          {(home.verifiedSeller || home.isVerified) && (
            <span className="stamp bg-white/95 text-gold-700 text-[9px] shadow-sm">
              Verified
            </span>
          )}
          {home.urgency === "high" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/95 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm tracking-wider uppercase">
              ⚡ Urgent
            </span>
          )}
          {home.category === "hostel" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/95 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm tracking-wider uppercase">
              🏨 {home.hostelType ? home.hostelType.charAt(0).toUpperCase() + home.hostelType.slice(1) : "Hostel"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          aria-label={isSaved ? "Remove from saved homes" : "Save home"}
          className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-gold-50 z-20 before:absolute before:inset-0 before:m-auto before:h-11 before:w-11 before:content-[''] ${isSaved ? "text-red-500" : "text-slate-700"
            }`}
        >
          <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
        <div className="absolute left-3 bottom-3 flex items-center gap-2 z-20">
          <span className="rounded-full bg-gold-500/95 px-2.5 py-1 text-[11px] font-mono font-semibold text-white backdrop-blur-sm shadow-sm border border-gold-400/50">
            {formatPrice(home.price)}
          </span>
          <span className="rounded-full bg-blue-950/85 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm uppercase tracking-wider border border-gold-600/50">
            {home.type === "sale" ? "Sale" : "Rent"}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <p className="text-sm font-bold text-blue-900 line-clamp-1">
          {home.title || home.address}
        </p>
        <p className="text-xs font-medium text-slate-500 flex items-start gap-1.5 mt-1">
          <MapPin className="h-3.5 w-3.5 text-gold-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-snug">
            {[
              home?.location?.tole || home.address,
              home?.location?.ward ? `Ward ${home.location.ward}` : '',
              home?.location?.municipality || home.city,
              home?.location?.district
            ].filter(Boolean).join(", ")}
          </span>
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">
            <span className="flex items-center gap-1"><span className="text-slate-400">🛏️</span> {home?.specs?.bedrooms || home.beds || "-"}</span>
            <div className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1"><span className="text-slate-400">🛁</span> {home?.specs?.bathrooms || home.baths || "-"}</span>
            <div className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1 truncate max-w-[90px]"><span className="text-slate-400">📐</span> {formatArea(home?.specs?.landArea, home.sqft)}</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {home.views ?? 0} views
            </span>
            <span>{home.createdAt ? new Date(home.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Recently"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
