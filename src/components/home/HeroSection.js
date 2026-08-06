import React from "react";
import { MapPin, Search, Star, Bed, Bath } from "lucide-react";
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
    <section className="relative bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid gap-10 lg:grid-cols-2 items-center relative z-10">
        {/* Left copy */}
        <div className="animate-fade-in-up">
          <p className="stamp text-gold-700 text-[11px]">
            {t.heroTag}
          </p>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-900 leading-[1.12] tracking-tight">
            {t.heroH1a}
            <span className="block mt-1 text-gold-700">{t.heroH1b}</span>
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-base max-w-md leading-relaxed">
            {t.heroSub}
          </p>

          {/* Search box */}
          <div className="mt-7 rounded-2xl bg-white shadow-xl border border-slate-200 p-3 flex flex-col gap-3 sm:flex-row sm:items-center relative z-20">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-transparent focus-within:border-gold-300 transition-colors relative">
              <MapPin className="h-4 w-4 text-gold-600 shrink-0" />
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 min-h-[44px] text-sm font-semibold text-white hover:bg-gold-600 active:scale-95 transition-all shadow-md shadow-gold-600/25"
            >
              <Search className="h-4 w-4" />
              {t.searchBtn}
            </button>
          </div>

          {/* Trust row */}
          <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 text-gold-500 fill-gold-500" />
              ))}
              <span className="ml-1 font-medium text-slate-600">{t.heroTrust}</span>
            </div>
            <span className="h-3 w-px bg-slate-300" />
            <button
              type="button"
              onClick={onGoLogin}
              className="text-gold-700 font-semibold hover:underline underline-offset-2 transition-colors"
            >
              {t.heroSignIn}
            </button>
          </div>
        </div>

        {/* Right: the thesis — a stamped, verified listing, not an abstract metric */}
        <VerifiedShowcase
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

const VerifiedShowcase = ({ t, totalListings, cities, avgViews, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute -bottom-4 -right-4 h-full w-full rounded-[1.75rem] border-2 border-gold-300 -z-10" />

    <div className="relative rounded-[1.75rem] bg-white border border-slate-200 shadow-2xl shadow-blue-900/10 overflow-hidden">
      {/* Sample listing "photo" — an illustrated block, never a fake stock photo */}
      <div className="relative h-40 bg-[linear-gradient(135deg,#1A1410_0%,#4F2415_55%,#B4522F_100%)] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 64 64" className="h-16 w-16 text-gold-400/40" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 30 L32 10 L56 30" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 26 V54 H50 V26" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 54 V38 H38 V54" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <span className="stamp absolute top-3 left-3 bg-white/95 text-gold-700 text-[10px] shadow-sm">
          {t.statsVerified}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-blue-900">{t.statsSampleTitle}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t.statsSampleLoc}</p>
          </div>
          <p className="font-mono font-bold text-gold-700 text-base whitespace-nowrap">
            {t.statsSamplePrice}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-4 font-mono text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5"><Bed className="h-3.5 w-3.5" /> 2</span>
          <span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" /> 1</span>
          <span className="ml-auto text-slate-400">{t.statsSampleTag}</span>
        </div>
      </div>

      {/* Live counts — real data, kept quiet and secondary */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
        <MiniStat value={totalListings} label={t.statsLive} />
        <MiniStat value={cities} label={t.statsCities} />
        <MiniStat value={avgViews} label={t.statsViews} />
      </div>
    </div>
  </div>
);

const MiniStat = ({ value, label }) => (
  <div className="px-3 py-3 text-center">
    <p className="font-mono text-sm font-bold text-slate-900">{value}</p>
    <p className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5 leading-tight">{label}</p>
  </div>
);

export default HeroSection;
