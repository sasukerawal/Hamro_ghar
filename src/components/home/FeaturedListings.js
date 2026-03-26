import React from "react";
import { ChevronLeft, ChevronRight, Heart, MapPin, Eye, Shield } from "lucide-react";
import { useMeasurement } from "../../contexts/MeasurementContext";
import AdBanner from "../ads/AdBanner";

// Skeleton shimmer card
class ListingCardBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ListingCard Error:", error, errorInfo, "Home Data:", this.props.home);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 shadow-sm text-center">
          <p className="text-red-500 font-bold mb-2">Error rendering this listing.</p>
          <p className="text-xs text-red-400">See console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SkeletonCard = () => (
  <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 w-full shimmer" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-slate-100 rounded-full w-3/4" />
      <div className="h-4 bg-slate-50 rounded-full w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-4 bg-slate-50 rounded-full w-16" />
        <div className="h-4 bg-slate-50 rounded-full w-16" />
        <div className="h-4 bg-slate-50 rounded-full w-16" />
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
}) => (
  <section className="relative py-20 bg-white overflow-hidden">
    {/* Decorative Background for Featured */}
    <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 rounded-full blur-[100px] -z-10" />
    <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-indigo-50/50 rounded-full blur-[80px] -z-10" />

    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[11px] font-black tracking-[0.3em] text-blue-600 uppercase mb-2">
            {t.listingsLabel}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {t.listingsTitle}
          </h2>
        </div>
        {!loading && listings.length > 0 && (
          <div className="glass px-4 py-2 rounded-2xl border border-slate-100 text-xs font-bold text-slate-500 shadow-sm">
            {t.listingsPage} <span className="text-blue-600">{page}</span> {t.listingsOf} <span className="text-slate-900">{totalPages}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-slate-200">
          <div className="text-6xl mb-6 animate-bounce">🏠</div>
          <h3 className="text-xl font-black text-slate-900">{t.listingsEmpty}</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">{t.listingsEmptyHint}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((home, index) => {
              const id = home._id || home.id;
              const isSaved = savedIds.includes(id);

              return (
                <React.Fragment key={id}>
                  <ListingCardBoundary home={home}>
                    <ListingCard
                      home={home}
                      onToggleSave={onToggleSave}
                      onOpenHome={onOpenHome}
                      isSaved={isSaved}
                      isVirtualized={false}
                    />
                  </ListingCardBoundary>

                  {/* Inline Feed Ad Placement */}
                  {feedAd && index === 5 && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <AdBanner ad={feedAd} className="h-32 w-full mt-4 rounded-[2rem] overflow-hidden shadow-lg" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-16">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center justify-center h-12 w-12 rounded-2xl glass border border-slate-200 text-slate-600 transition-all hover:bg-white hover:text-blue-600 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </button>

              <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border border-slate-100">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                  // Only show current, first, last, and neighbors if many pages
                  const isNear = Math.abs(pg - page) <= 1;
                  const isEnd = pg === 1 || pg === totalPages;
                  if (!isNear && !isEnd) return pg === 2 || pg === totalPages - 1 ? <span key={pg} className="px-1 text-slate-300">...</span> : null;

                  return (
                    <button
                      key={pg}
                      onClick={() => pg !== page && onPageChange(pg)}
                      className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${pg === page
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 translate-y-[-2px]"
                        : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
                        }`}
                    >
                      {pg}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center justify-center h-12 w-12 rounded-2xl glass border border-slate-200 text-slate-600 transition-all hover:bg-white hover:text-blue-600 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </section>
);

export const ListingCard = ({ home, onToggleSave, onOpenHome, isSaved, isVirtualized }) => {
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
      className={`group rounded-[2rem] border border-white bg-white shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col ${isVirtualized ? "h-full" : "sm:block"}`}
      onClick={() => onOpenHome(home)}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={home.address}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x400/eff6ff/0f172a?text=Home";
          }}
        />
        {/* Glassmorphism Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {(home.verifiedSeller || home.isVerified) && (
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-[10px] font-black text-blue-700 shadow-xl border border-white/50 tracking-wider uppercase">
              <Shield className="h-3 w-3" />
              Verified
            </span>
          )}
          {home.urgency === "high" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-black text-white shadow-xl backdrop-blur-md tracking-wider uppercase">
              ⚡ Urgent
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full glass shadow-xl transition-all hover:scale-110 active:scale-95 z-20 ${isSaved ? "text-red-500" : "text-slate-700"
            }`}
        >
          <Heart className="h-5 w-5 transition-transform" fill={isSaved ? "currentColor" : "none"} />
        </button>

        <div className="absolute left-4 bottom-4 flex items-center gap-2 z-20">
          <span className="rounded-2xl bg-slate-900/80 px-4 py-1.5 text-xs font-black text-white backdrop-blur-md shadow-2xl border border-white/10 uppercase tracking-tight">
            {formatPrice(home.price)}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
            {String(home.title || home.address || "Unnamed Property")}
          </h3>
          <p className="text-xs font-semibold text-slate-500 flex items-start gap-1.5 mt-2">
            <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-snug">
              {[
                home?.location?.tole || home.address,
                home?.location?.municipality || home.city,
                home?.location?.district
              ].filter(Boolean).join(", ")}
            </span>
          </p>
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">🛏️</span>
              <span className="text-[10px] font-black text-slate-800">{typeof home?.specs?.bedrooms === 'object' ? 'OBJ' : (home?.specs?.bedrooms || home.beds || "-")}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-x border-slate-100">
              <span className="text-lg">🛁</span>
              <span className="text-[10px] font-black text-slate-800">{typeof home?.specs?.bathrooms === 'object' ? 'OBJ' : (home?.specs?.bathrooms || home.baths || "-")}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">📐</span>
              {/* Area display using MeasurementContext formatArea */}
              <span className="text-[10px] font-black text-slate-800">{String(formatArea(home?.specs?.landArea, home?.specs?.builtUpAreaSqFt || home.sqft))}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Eye className="h-3.5 w-3.5" />
              {typeof home.views === 'object' ? 'OBJ' : (home.views ?? 0)} views
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {typeof home.createdAt === 'object' ? 'OBJ' : (home.createdAt ? new Date(home.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Just Now")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
