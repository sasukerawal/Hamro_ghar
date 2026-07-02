import React from "react";
import { Shield, MapPin, Search, Star, TrendingUp, Building2 } from "lucide-react";
import AddressSuggestionsList from "../../AddressSuggestionsList";

export const HeroSection = ({
  t,
  searchCity,
  setSearchCity,
  onSearch,
  onGoLogin,
  stats,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
}) => {
  const total = stats.totalListings ?? "—";
  const cities = stats.citiesCount ?? "—";
  const avgViews = stats.avgViews ?? "—";

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-sky-50 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid gap-10 lg:grid-cols-2 items-center relative z-10">
        {/* Left copy */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-100 mb-5 shadow-sm animate-float">
            <Shield className="h-3.5 w-3.5" />
            {t.heroTag}
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
            {t.heroH1a}
            <span className="block mt-1 gradient-text">{t.heroH1b}</span>
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-base max-w-md leading-relaxed">
            {t.heroSub}
          </p>

          {/* Search box */}
          <div className="mt-7 rounded-2xl bg-white shadow-xl border border-blue-100 p-3 flex flex-col gap-3 sm:flex-row sm:items-center relative z-20">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-transparent focus-within:border-blue-200 transition-colors relative">
              <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 font-medium"
              />
              <AddressSuggestionsList
                suggestions={suggestions}
                show={showSuggestions}
                onSelect={onSelectSuggestion}
              />
            </div>
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/25"
            >
              <Search className="h-4 w-4" />
              {t.searchBtn}
            </button>
          </div>

          {/* Trust row */}
          <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-1 font-medium text-slate-600">{t.heroTrust}</span>
            </div>
            <span className="h-3 w-px bg-slate-300" />
            <button
              type="button"
              onClick={onGoLogin}
              className="text-blue-600 font-semibold hover:underline underline-offset-2 transition-colors"
            >
              {t.heroSignIn}
            </button>
          </div>
        </div>

        {/* Right: animated stats card */}
        <HeroStatsCard
          t={t}
          totalListings={total}
          cities={cities}
          avgViews={avgViews}
          className="hidden lg:block"
        />
      </div>
    </section>
  );
};

const HeroStatsCard = ({ t, totalListings, cities, avgViews, className = "" }) => (
  <div className={`relative ${className}`}>
    {/* Outer glow ring */}
    <div className="absolute inset-0 rounded-3xl bg-blue-400/20 blur-2xl -z-10 animate-float" />

    <div className="relative rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white p-7 shadow-2xl overflow-hidden glow-heavy">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-14 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute top-1/2 right-4 h-16 w-16 rounded-full bg-white/5" />

      <p className="text-[10px] uppercase tracking-[0.25em] text-blue-200 mb-2 font-semibold">
        {t.statsLive}
      </p>
      <p className="text-4xl font-black mb-1 tracking-tight">{totalListings}</p>
      <p className="text-xs text-blue-200 mb-7">{t.statsProps}</p>

      <div className="space-y-3 text-xs">
        <HeroStat icon={<TrendingUp className="h-3.5 w-3.5" />} label={t.statsViews} value={avgViews} />
        <HeroStat icon={<Building2 className="h-3.5 w-3.5" />} label={t.statsCities} value={cities} />
      </div>

      <div className="mt-7 pt-5 border-t border-white/10 flex items-center gap-3">
        <div className="flex -space-x-2">
          {["S", "A", "R"].map((l) => (
            <AvatarInitial key={l} label={l} />
          ))}
        </div>
        <p className="text-[11px] text-blue-100 leading-snug">{t.statsQuote}</p>
      </div>
    </div>
  </div>
);

const HeroStat = ({ icon, label, value }) => (
  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
    <span className="flex items-center gap-1.5 text-[11px] text-blue-100">{icon} {label}</span>
    <span className="text-sm font-bold">{value}</span>
  </div>
);

const AvatarInitial = ({ label }) => (
  <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold text-blue-700 border-2 border-blue-500/40 shadow-sm">
    {label}
  </div>
);

export default HeroSection;
