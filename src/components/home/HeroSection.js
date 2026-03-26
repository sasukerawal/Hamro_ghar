import React from "react";
import { Shield, MapPin, Search, Star, ArrowRight } from "lucide-react";
import AddressSuggestionsList from "../../AddressSuggestionsList";

/**
 * HeroSection - The main landing area with a premium, high-impact design.
 * Features: Glassmorphism search bar, floating decorative elements, and luminous stats.
 */
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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#fcfcfd]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: "-3s" }} />

      <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 grid gap-16 lg:grid-cols-2 items-center">
        {/* Left Content Column */}
        <div className="relative z-20">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200/50 mb-6 group cursor-default">
            <Shield className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            <span>{t.heroTag}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            {t.heroH1a}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic font-serif">
              {t.heroH1b}
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-lg mb-10 leading-relaxed">
            {t.heroSub}
          </p>

          {/* Premium Glassmorphism Search Bar */}
          <div className="glass p-2 sm:p-3 rounded-[2rem] shadow-2xl shadow-blue-500/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-white/50 relative overflow-visible">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/40 border border-white/30 transition-all focus-within:bg-white/60 focus-within:shadow-sm">
              <MapPin className="h-5 w-5 text-blue-600" />
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
                className="w-full bg-transparent text-slate-800 font-semibold outline-none placeholder:text-slate-400 text-[15px]"
                id="hero-city-input"
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
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 group"
            >
              <Search className="h-5 w-5 transition-transform group-hover:rotate-12" />
              {t.searchBtn}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-slate-100/50 rounded-full px-4 py-1.5 border border-slate-200/50">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-slate-700">{t.heroTrust}</span>
            </div>
            <button
              type="button"
              onClick={onGoLogin}
              className="group flex items-center gap-1.5 font-bold text-blue-600 transition-colors hover:text-blue-800"
            >
              {t.heroSignIn}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Section - Visual Feature */}
        <div className="relative z-10 hidden lg:block">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px]" />

          <HeroStatsCard
            t={t}
            totalListings={total}
            cities={cities}
            avgViews={avgViews}
            className="animate-float"
          />
        </div>
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
    {/* Decorative blur backdrop */}
    <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-[3rem] -z-10" />

    <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 sm:p-10 shadow-2xl border border-slate-700/50 overflow-hidden glow-heavy">
      {/* Abstract internal shapes */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-500/20 blur-[40px]" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-[30px]" />

      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-400 mb-2">
        {t.statsLive}
      </p>

      <div className="flex items-baseline gap-2 mb-8">
        <h3 className="text-6xl font-black tracking-tighter">{totalListings}</h3>
        <p className="text-sm font-bold text-slate-400">
          {t.statsProps}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <HeroStat label={t.statsViews} value={avgViews} icon="📈" />
        <HeroStat label={t.statsCities} value={cities} icon="🏙️" />
      </div>

      <div className="mt-10 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-default">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden shadow-lg">
              <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="opacity-80" />
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-tight font-medium text-slate-300">
          {t.statsQuote}
        </p>
      </div>
    </div>
  </div>
);

const HeroStat = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1 rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-white/20 transition-all hover:bg-white/10 group">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    <div className="flex items-center gap-2">
      <span className="text-sm group-hover:scale-110 transition-transform">{icon}</span>
      <p className="text-lg font-black">{value}</p>
    </div>
  </div>
);

export default HeroSection;
