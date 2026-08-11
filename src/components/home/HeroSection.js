import React, { useRef } from "react";
import { MapPin, Search, Star, Bed, Bath } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import AddressSuggestionsList from "../../AddressSuggestionsList";
import NumberTicker from "../common/NumberTicker";
import { useRipple } from "../common/Ripple";

// genjutsu cast — hero motion, variant C (Cinematic), validated 2026-08-11.
// Parallax factor 0.25, 0.6s reveal, 0.14s stagger, MASTER.md editorial ease.
const HERO_EASE = [0.16, 1, 0.3, 1];
const HERO_DURATION = 0.6;
const HERO_STAGGER = 0.14;
const HERO_PARALLAX_FACTOR = 0.25;
const HERO_IMAGE_OPACITY = 0.7;

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
  const searchRipple = useRipple();
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : 400 * HERO_PARALLAX_FACTOR]
  );

  const revealProps = (index) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: HERO_DURATION,
            delay: index * HERO_STAGGER,
            ease: HERO_EASE,
          },
        };

  return (
    // Full-bleed imag1 background + parallax (MASTER.md editorial surface:
    // dark-image ground, warm-ink gradient scrim for text legibility) —
    // replaces the prior slate/gold gradient wash. No overflow-hidden on the
    // outer section for the showcase card's offset frame; the image layer
    // gets its own overflow-hidden instead.
    // isolate is load-bearing: without it, `relative` alone doesn't create a
    // stacking context, so the image layer's -z-10 resolves against the
    // nearest ancestor stacking context instead of this section — which put
    // it behind the page background entirely (invisible image, invisible
    // white headline text with nothing dark behind it).
    <section ref={sectionRef} className="relative isolate overflow-hidden">
      <motion.div className="absolute inset-0 -z-10 overflow-hidden" style={{ y: parallaxY }}>
        <picture>
          <source
            srcSet="/optimized/imag1-1600.webp 1600w, /optimized/imag1-900.webp 900w, /optimized/imag1-480.webp 480w"
            sizes="100vw"
            type="image/webp"
          />
          {/* Ken Burns — one-time 1.08→1 zoom over 8s, not a loop (a looping
              zoom on a hero reads as a screensaver, not "alive"). Skipped
              entirely under reduced-motion via initial=false. */}
          <motion.img
            src="/optimized/imag1-900.webp"
            alt=""
            aria-hidden="true"
            fetchpriority="high"
            className="h-[130%] w-full object-cover object-[50%_35%]"
            style={{ opacity: HERO_IMAGE_OPACITY }}
            initial={reduceMotion ? false : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 8, ease: "easeOut" }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/60 to-blue-950/20" />
      </motion.div>

      {/* Mobile: near-fullscreen (88vh) so the photo dominates instead of
          being a cropped strip behind content sized to fit; content is
          bottom-anchored so the primary CTA lands in the thumb-reachable
          zone (mobile-principles). Desktop: unchanged two-column grid. */}
      <div className="max-w-6xl mx-auto px-4 pb-12 pt-28 min-h-[88vh] flex flex-col justify-end lg:min-h-0 lg:py-24 lg:grid lg:grid-cols-2 lg:items-center gap-10 relative z-10">
        {/* Left copy */}
        <div>
          <motion.p {...revealProps(0)} className="stamp text-gold-300 text-[11px]">
            {t.heroTag}
          </motion.p>

          <motion.h1
            {...revealProps(1)}
            className="font-display mt-5 text-4xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] tracking-tight"
          >
            {t.heroH1a}
            <span className="block mt-1 text-gold-300">{t.heroH1b}</span>
          </motion.h1>

          <motion.p {...revealProps(2)} className="mt-4 text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
            {t.heroSub}
          </motion.p>

          {/* Search box */}
          <motion.div
            {...revealProps(3)}
            className="mt-7 rounded-2xl bg-white shadow-xl border border-slate-200 p-3 flex flex-col gap-3 sm:flex-row sm:items-center relative z-20"
          >
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
              onPointerDown={searchRipple.onPointerDown}
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-ember-600 px-5 py-3 min-h-[44px] text-sm font-semibold text-white hover:from-gold-600 hover:to-ember-700 active:scale-95 transition-all shadow-md shadow-gold-600/25"
            >
              {searchRipple.rippleLayer}
              <Search className="h-4 w-4" />
              {t.searchBtn}
            </button>
          </motion.div>

          {/* Trust row */}
          <motion.div {...revealProps(4)} className="mt-5 flex items-center gap-4 text-xs text-white/70">
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 text-gold-400 fill-gold-400" />
              ))}
              <span className="ml-1 font-medium text-white/80">{t.heroTrust}</span>
            </div>
            <span className="h-3 w-px bg-white/30" />
            <button
              type="button"
              onClick={onGoLogin}
              className="text-gold-300 font-semibold hover:underline underline-offset-2 transition-colors"
            >
              {t.heroSignIn}
            </button>
          </motion.div>
        </div>

        {/* Right: the thesis — a stamped, verified listing, not an abstract metric */}
        <motion.div {...revealProps(2)} className="hidden lg:block">
          <VerifiedShowcase
            t={t}
            totalListings={total}
            cities={cities}
            avgViews={avgViews}
          />
        </motion.div>
      </div>
    </section>
  );
};

const VerifiedShowcase = ({ t, totalListings, cities, avgViews, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute -bottom-4 -right-4 h-full w-full rounded-[1.75rem] border-2 border-gold-300 -z-10" />

    <div className="relative rounded-[1.75rem] bg-white border border-slate-200 shadow-2xl shadow-blue-900/10 overflow-hidden">
      {/* Sample listing "photo" — an illustrated block, never a fake stock photo */}
      <div className="relative h-40 bg-[linear-gradient(135deg,#1A1410_0%,#4F2415_50%,#B4522F_85%,#E8A33D_130%)] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 64 64" className="h-16 w-16 text-gold-400/40" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 30 L32 10 L56 30" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 26 V54 H50 V26" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 54 V38 H38 V54" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Fully opaque, not /95 — any backdrop bleed-through against
            this dark photo gradient risked dragging the effective
            contrast down. */}
        <span className="stamp absolute top-3 left-3 bg-white text-gold-700 text-[11px] shadow-sm">
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
          <span className="ml-auto text-slate-500">{t.statsSampleTag}</span>
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
    <NumberTicker value={value} className="font-mono text-sm font-bold text-slate-900" />
    <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-0.5 leading-tight">{label}</p>
  </div>
);

export default HeroSection;
