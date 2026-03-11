import React from "react";
import { Shield, MapPin, Search, Star } from "lucide-react";
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
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-4">
            <Shield className="h-3.5 w-3.5" />
            {t.heroTag}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            {t.heroH1a}
            <span className="text-blue-600"> {t.heroH1b}</span>
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-md">
            {t.heroSub}
          </p>

          <div className="mt-6 rounded-2xl bg-white shadow-lg border border-blue-50 p-3 flex flex-col gap-3 sm:flex-row sm:items-center relative z-20">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 relative">
              <MapPin className="h-4 w-4 text-blue-500" />
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
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              {t.searchBtn}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{t.heroTrust}</span>
            </div>
            <button
              type="button"
              onClick={onGoLogin}
              className="underline-offset-2 hover:underline text-blue-700"
            >
              {t.heroSignIn}
            </button>
          </div>
        </div>

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

const HeroStatsCard = ({
  t,
  totalListings,
  cities,
  avgViews,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <div className="relative rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-12 h-32 w-32 rounded-full bg-white/10" />

      <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-2">
        {t.statsLive}
      </p>
      <p className="text-3xl font-bold mb-1">{totalListings}</p>
      <p className="text-xs text-blue-100 mb-6">
        {t.statsProps}
      </p>

      <div className="space-y-3 text-xs">
        <HeroStat label={t.statsViews} value={avgViews} />
        <HeroStat label={t.statsCities} value={cities} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex -space-x-2">
          <AvatarInitial label="A" />
          <AvatarInitial label="B" />
          <AvatarInitial label="C" />
        </div>
        <p className="text-[11px] text-blue-100">
          {t.statsQuote}
        </p>
      </div>
    </div>
  </div>
);

const HeroStat = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
    <p className="text-[11px] text-blue-100">{label}</p>
    <p className="text-xs font-semibold">{value}</p>
  </div>
);

const AvatarInitial = ({ label }) => (
  <div className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-xs font-semibold text-blue-700 border border-blue-100">
    {label}
  </div>
);

export default HeroSection;
