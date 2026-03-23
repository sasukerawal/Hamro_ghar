/**
 * @file HomePage.js
 * @description Main landing page for HamroGhar.
 *
 * Architecture overview:
 *  - Data fetching is handled via SWR for automatic caching, deduplication,
 *    and revalidation on reconnect. Three data queries run in parallel:
 *      1. /api/listings/stats  — hero stats card (cached 60 s)
 *      2. /api/ads/active      — ad placements (cached 5 min)
 *      3. /api/listings/all    — filtered, paginated listing grid (no TTL)
 *  - All filter state lives here and is threaded down as props. Changing any
 *    filter simply causes `buildListingsUrl()` to return a new key, triggering
 *    an automatic SWR refetch.
 *  - The mobile sticky FAB (Map/List & Filters pill) uses a scroll-direction
 *    heuristic: it appears when the user scrolls *up*, auto-hides after 3 s
 *    of inactivity, and is hidden while the filter modal is open.
 */

// src/HomePage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "./api";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";

import FilterModal from "./FilterModal";
import { ListingModal, handleToggleSaveHome } from "./ListingUtils";
import ListingMapView from "./ListingMapView";

import HeroSection from "./components/home/HeroSection";
import FiltersBar from "./components/home/FiltersBar";
import HighlightStrip from "./components/home/HighlightStrip";
import { FeaturedListings } from "./components/home/FeaturedListings";
import CallToAction from "./components/home/CallToAction";
import SiteReviewsSection from "./components/home/SiteReviewsSection";
import AdBanner from "./components/ads/AdBanner";

import { MapPin, ChevronUp, Tag, Layers } from "lucide-react";

// ---------------------------------------------------------------------------
// 🌐 Full page translation map
// Add more language keys here as needed; fallback is always "en".
// ---------------------------------------------------------------------------
const PAGE_LANG = {
  en: {
    heroTag: "No broker spam · Real listings only",
    heroH1a: "Find a home that",
    heroH1b: "feels like you.",
    heroSub: "Search rooms and homes across Nepal in just a few clicks. No hidden fees, no middlemen.",
    searchPlaceholder: "Enter area or city, e.g. Baneshwor, Kathmandu",
    searchBtn: "Search homes",
    heroTrust: "Trusted by members across Nepal",
    heroSignIn: "Already a member? Sign in",
    statsLive: "Live listings",
    statsProps: "properties available right now",
    statsViews: "Average homes viewed per user",
    statsCities: "Cities covered",
    statsQuote: "\u201cClean, simple and fast. Found my flat in 2 days.\u201d",
    strip1Title: "Community platform",
    strip1Text: "Listings are posted by real users — not agencies. Always verify before paying.",
    strip2Title: "Student friendly",
    strip2Text: "Filter by furnished rooms, Wi-Fi, and walking distance.",
    strip3Title: "Human support",
    strip3Text: "Talk to a real person when you feel stuck.",
    riskTitle: "⚠️ Use caution",
    riskText: "HamroGhar does not verify listings. Always visit in person and never pay without seeing the property.",
    filterTypeLabel: "Type:",
    filterForRent: "🏠 Homes for Rent",
    filterWanted: "🔍 Wanted Rooms",
    filterForRentMobile: "For Rent",
    filterWantedMobile: "Wanted",
    filterMap: "🗺️ Show map",
    filterList: "📋 Show list",
    filterApply: "Apply filters",
    filterClear: "Clear",
    filterCityLabel: "City / Area",
    filterCityPlaceholder: "Baneshwor",
    filterMinRent: "Min rent (Rs)",
    filterMaxRent: "Max rent (Rs)",
    filterMinBeds: "Min beds",
    filterPets: "Pets allowed",
    filterFurnished: "Furnished only",
    filterShowing: "Showing",
    filterHomesIn: "homes in",
    filterAllAreas: "All Areas",
    filterBed: "+ bed ",
    listingsLabel: "Featured",
    listingsTitle: "Homes picked for you",
    listingsPage: "Page",
    listingsOf: "of",
    listingsEmpty: "No homes found",
    listingsEmptyHint: "Try adjusting your filters or clearing your search.",
    listingsPrev: "Prev",
    listingsNext: "Next",
    ctaTag: "Membership",
    ctaTitle: "Unlock member-only homes & support",
    ctaSub: "Get saved searches, instant alerts, and priority help from our team — all in one clean dashboard.",
    ctaBtn1: "Get started free",
    ctaBtn2: "View member dashboard",
    communityTitle: "What members say about us",
    communityTag: "Community",
    reviewPlaceholder: "Tell us about your experience finding a home on HamroGhar...",
    reviewSubmit: "Submit review",
    reviewUpdate: "Update",
    reviewRemove: "Remove",
    reviewUpdate2: "Update your review",
    reviewShare: "Share your experience with HamroGhar",
    reviewNone: "No reviews yet. Be the first to share your experience!",
    mapTitle: "Map view",
    mapHint: "Click a district to explore listings in that area.",
  },
  ne: {
    heroTag: "ब्रोकर स्प्याम छैन · वास्तविक लिस्टिङ मात्र",
    heroH1a: "आफ्नो लागि घर खोज्नुस्",
    heroH1b: "ज्युन तपाईंलाई मनपर्छ।",
    heroSub: "नेपालभर कोठा र घर खोज्नुस् — कुनै लुकेको शुल्क वा बिचौलिया छैन।",
    searchPlaceholder: "क्षेत्र वा सहर लेख्नुस्, जस्तै: बानेश्वर, काठमाडौं",
    searchBtn: "घर खोज्नुस्",
    heroTrust: "नेपालभरका सदस्यहरूले भरोसा गर्छन्",
    heroSignIn: "पहिलेदेखि सदस्य हुनुहुन्छ? साइन इन गर्नुस्",
    statsLive: "लाइभ लिस्टिङ",
    statsProps: "अहिले उपलब्ध सम्पत्तिहरू",
    statsViews: "प्रति प्रयोगकर्ता औसत हेरिएका घरहरू",
    statsCities: "शहरहरू समेटिएका",
    statsQuote: "\u201cसरल र छिटो। २ दिनमा फ्ल्याट फेला पाएँ।\u201d",
    strip1Title: "सम्प्रदाय प्लेटफर्म",
    strip1Text: "लिस्टिङहरू एजेन्सीले होइन, वास्तविक प्रयोगकर्ताले पोस्ट गर्छन्। भुक्तानी गर्नु अघि सत्यापन गर्नुस्।",
    strip2Title: "विद्यार्थी अनुकूल",
    strip2Text: "फर्निसड कोठा, Wi-Fi र हिँड्न मिल्ने दूरीका घरहरू फिल्टर गर्नुस्।",
    strip3Title: "मानव सहयोग",
    strip3Text: "अलमलमा परेमा वास्तविक व्यक्तिसँग कुरा गर्नुस्।",
    riskTitle: "⚠️ सावधान रहनुस्",
    riskText: "HamroGhar ले लिस्टिङ प्रमाणित गर्दैन। सधैँ व्यक्तिगत रूपमा भेट्नुस् र सम्पत्ति नदेखी भुक्तानी नगर्नुस्।",
    filterTypeLabel: "प्रकार:",
    filterForRent: "🏠 भाडाको घर",
    filterWanted: "🔍 खोज्दै छु",
    filterForRentMobile: "भाडामा",
    filterWantedMobile: "खोज्दै",
    filterMap: "🗺️ नक्सा देखाउनुस्",
    filterList: "📋 सूची देखाउनुस्",
    filterApply: "फिल्टर लागू गर्नुस्",
    filterClear: "हटाउनुस्",
    filterCityLabel: "सहर / क्षेत्र",
    filterCityPlaceholder: "बानेश्वर",
    filterMinRent: "न्यूनतम भाडा (रु)",
    filterMaxRent: "अधिकतम भाडा (रु)",
    filterMinBeds: "न्यूनतम कोठा",
    filterPets: "पाल्तु जनावर मिल्छ",
    filterFurnished: "फर्निसड मात्र",
    filterShowing: "देखाइँदै छ",
    filterHomesIn: "घरहरू",
    filterAllAreas: "सबै क्षेत्र",
    filterBed: "+ ओछ्यान ",
    listingsLabel: "विशेष",
    listingsTitle: "तपाईंको लागि छानिएका घरहरू",
    listingsPage: "पृष्ठ",
    listingsOf: "मध्ये",
    listingsEmpty: "कुनै घर फेला परेन",
    listingsEmptyHint: "फिल्टर परिवर्तन गर्नुस् वा खोजी हटाउनुस्।",
    listingsPrev: "अघिल्लो",
    listingsNext: "अर्को",
    ctaTag: "सदस्यता",
    ctaTitle: "सदस्य-मात्र घर र सहयोग अनलक गर्नुस्",
    ctaSub: "सेभ गरिएका खोजहरू, तत्काल अलर्ट र प्राथमिक सहयोग पाउनुस्।",
    ctaBtn1: "निःशुल्क सुरु गर्नुस्",
    ctaBtn2: "सदस्य ड्यासबोर्ड हेर्नुस्",
    communityTitle: "सदस्यहरूले हाम्रोबारे के भन्छन्",
    communityTag: "समुदाय",
    reviewPlaceholder: "HamroGhar मा घर खोज्ने अनुभव साझा गर्नुस्...",
    reviewSubmit: "समीक्षा पेश गर्नुस्",
    reviewUpdate: "अपडेट",
    reviewRemove: "हटाउनुस्",
    reviewUpdate2: "आफ्नो समीक्षा अपडेट गर्नुस्",
    reviewShare: "HamroGhar सँगको आफ्नो अनुभव साझा गर्नुस्",
    reviewNone: "अझै समीक्षा छैन। पहिलो हुनुस्!",
    mapTitle: "नक्सा दृश्य",
    mapHint: "जिल्लामा क्लिक गरेर त्यहाँका लिस्टिङहरू हेर्नुस्।",
  },
};

// ---------------------------------------------------------------------------
// ⏱️  FAB_HIDE_DELAY_MS
// How long (in milliseconds) to keep the mobile floating action button
// visible after the user stops scrolling upward.
// ---------------------------------------------------------------------------
const FAB_HIDE_DELAY_MS = 3000;

// ---------------------------------------------------------------------------
// 🏠 HomePage Component
// ---------------------------------------------------------------------------

/**
 * HomePage — root shell component for the application landing page.
 *
 * @param {Function} onGoLogin       — navigate to the login screen
 * @param {Function} onGoRegister    — navigate to the register screen
 * @param {Function} onGoMembership  — navigate to the membership screen
 * @param {"en"|"ne"} lang           — active language key (defaults to "en")
 */
export default function HomePage({
  onGoLogin,
  onGoRegister,
  onGoMembership,
  lang = "en",
}) {
  /** Active translation object */
  const t = PAGE_LANG[lang] || PAGE_LANG.en;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // ── View toggle ────────────────────────────────────────────────────────────
  /** Controls whether the map or the listing grid is displayed */
  const [showMap, setShowMap] = useState(false);

  // ── Basic filter state ─────────────────────────────────────────────────────
  const [searchCity, setSearchCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [petsOnly, setPetsOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);

  /**
   * listingType — deal type filter.
   * Possible values: "" (all) | "sale" | "rent" | "offer" | "wanted"
   */
  const [listingType, setListingType] = useState("");

  // ── V2 filter state ────────────────────────────────────────────────────────
  const [propertyType, setPropertyType] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [minLandArea, setMinLandArea] = useState("");
  const [maxLandArea, setMaxLandArea] = useState("");
  const [roadAccess, setRoadAccess] = useState("");
  const [facing, setFacing] = useState("");
  const [amenities, setAmenities] = useState([]);

  /** Controls whether the advanced filter modal overlay is open */
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /** Number of listings to request per page */
  const LISTINGS_PER_PAGE = 12;

  // ── UI state ───────────────────────────────────────────────────────────────
  /** Whether the back-to-top FAB should be visible */
  const [showBackToTop, setShowBackToTop] = useState(false);

  /**
   * showMobileFab — controls the mobile sticky action pill visibility.
   * true  → pill is visible (user scrolled up recently)
   * false → pill is hidden (user scrolled down, or timer elapsed)
   */
  const [showMobileFab, setShowMobileFab] = useState(false);

  // ── Address suggestions ────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Listing modal ──────────────────────────────────────────────────────────
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Saved homes ────────────────────────────────────────────────────────────
  /** Array of listing _id strings the current user has saved */
  const [savedIds, setSavedIds] = useState([]);

  // ── Refs for scroll tracking ───────────────────────────────────────────────
  /**
   * lastScrollY — records the window.scrollY value from the *previous*
   * scroll event so we can detect direction (up vs. down).
   */
  const lastScrollY = useRef(window.scrollY);
  /** Stores the setTimeout handle for the FAB auto-hide timer */
  const fabHideTimer = useRef(null);

  // ── Scroll listener: back-to-top + FAB direction heuristic ────────────────
  useEffect(() => {
    /**
     * handleScroll — fires on every scroll event.
     *
     * Logic:
     *  1. Compare current scrollY to lastScrollY to determine direction.
     *  2. Show back-to-top button when scrollY > 400 px.
     *  3. Show the mobile FAB only when the user scrolls *up* (positive delta).
     *  4. Start/restart a timer to auto-hide the FAB after FAB_HIDE_DELAY_MS.
     */
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = lastScrollY.current - currentY; // positive = scrolled up

      // ── Back-to-top button ──────────────────────────────────────────────
      setShowBackToTop(currentY > 400);

      // ── Mobile FAB ──────────────────────────────────────────────────────
      if (delta > 0 && currentY > 150) {
        // User scrolled upward — reveal the FAB
        setShowMobileFab(true);

        // Reset auto-hide timer on every upward scroll event
        clearTimeout(fabHideTimer.current);
        fabHideTimer.current = setTimeout(() => {
          setShowMobileFab(false);
        }, FAB_HIDE_DELAY_MS);
      } else if (delta < 0) {
        // User scrolled downward — immediately hide the FAB
        setShowMobileFab(false);
        clearTimeout(fabHideTimer.current);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup: remove listener and cancel any pending timer on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(fabHideTimer.current);
    };
  }, []); // run once on mount — no external dependencies needed

  // ── Auth check ─────────────────────────────────────────────────────────────
  /**
   * Detect whether the current visitor is authenticated so we can conditionally
   * render the CTA section (hidden for logged-in users).
   */
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((d) => setIsLoggedIn(!!(d?.user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // ── SWR fetcher ────────────────────────────────────────────────────────────
  /**
   * swrFetcher — shared async fetcher passed to all useSWR hooks on this page.
   * `credentials: "omit"` is intentionally set for public endpoints (stats,
   * ads, listings) to avoid attaching cookies to cross-origin requests.
   *
   * @param {string} url — API endpoint URL
   * @returns {Promise<any>} — parsed JSON response
   */
  const swrFetcher = useCallback(async (url) => {
    return apiFetch(url, { credentials: "omit" });
  }, []);

  // ── 1. Platform stats ──────────────────────────────────────────────────────
  const { data: statsData } = useSWR("/api/listings/stats", swrFetcher, {
    revalidateOnFocus: false, // Don't hammer the DB on every tab switch
    dedupingInterval: 60000, // Cache result for 1 minute
  });

  /** Normalised stats object used by HeroSection */
  const stats = {
    totalListings: statsData?.totalListings ?? statsData?.totalActive ?? null,
    citiesCount: statsData?.citiesCount ?? null,
    avgViews: statsData?.avgViews ?? null,
  };

  // ── 2. Ad placements ───────────────────────────────────────────────────────
  const { data: adsData } = useSWR("/api/ads/active", swrFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300_000, // Cache for 5 minutes — ads rarely change
  });

  // ── 3. Listings (filtered + paginated) ────────────────────────────────────
  /**
   * buildListingsUrl — constructs the API URL for the listing query.
   *
   * Every piece of filter/pagination state is encoded as a query parameter.
   * Because SWR uses the URL string as its cache key, changing any filter
   * state automatically triggers a new fetch — no manual invalidation needed.
   *
   * @returns {string} — fully-formed API URL
   */
  const buildListingsUrl = () => {
    const params = new URLSearchParams();

    // ── Basic filters ──────────────────────────────────────────────────────
    if (searchCity.trim()) params.append("city", searchCity.trim());
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (beds) params.append("beds", beds);
    if (petsOnly) params.append("petsAllowed", "true");
    if (furnishedOnly) params.append("furnished", "true");
    if (listingType) params.append("type", listingType);

    // ── V2 filters ─────────────────────────────────────────────────────────
    if (propertyType) params.append("propertyType", propertyType);
    if (province) params.append("province", province);
    if (district) params.append("district", district);
    if (municipality) params.append("municipality", municipality);
    if (minLandArea) params.append("minLandArea", minLandArea);
    if (maxLandArea) params.append("maxLandArea", maxLandArea);
    if (roadAccess) params.append("roadAccess", roadAccess);
    if (facing) params.append("facing", facing);
    if (amenities && amenities.length) params.append("amenities", amenities.join(","));

    // ── Pagination ─────────────────────────────────────────────────────────
    params.append("page", page);
    params.append("limit", LISTINGS_PER_PAGE);

    return `/api/listings/all?${params.toString()}`;
  };

  const { data: listingsData, isLoading: loadingListings } = useSWR(
    buildListingsUrl(),
    swrFetcher,
    {
      keepPreviousData: true,   // Keep stale listings visible during page transitions
      revalidateOnFocus: false,
    }
  );

  /** Safely extract the listings array from the SWR response */
  const listings = Array.isArray(listingsData?.listings) ? listingsData.listings : [];

  /**
   * Sync pagination state from the server response.
   * The server returns the authoritative page count; if the current page
   * is out of bounds, reset it (handles cases where filters reduce total pages).
   */
  useEffect(() => {
    if (listingsData?.totalPages) setTotalPages(listingsData.totalPages);
    if (listingsData?.page && listingsData.page < page) setPage(listingsData.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingsData]);

  // ── Saved homes loader ─────────────────────────────────────────────────────
  /**
   * Loads the current user's saved listing IDs on mount.
   * Silently swallows 401 errors (when the user is not logged in).
   */
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const data = await apiFetch("/api/listings/saved/me");
        if (Array.isArray(data.saved)) {
          setSavedIds(data.saved.map((h) => h._id || h.id));
        }
      } catch (err) {
        if (err.message.includes("401")) return; // Expected for anonymous users
        console.error("Error loading saved homes", err);
      }
    };
    loadSaved();
  }, []);

  // ── Address auto-suggestion ────────────────────────────────────────────────
  /**
   * Debounces the geo/search API call (400 ms) whenever the search city input
   * changes. Requires at least 3 characters to trigger a suggestion request.
   */
  useEffect(() => {
    const query = searchCity.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch(
          `/api/listings/geo/search?q=${encodeURIComponent(query)}`,
          { credentials: "omit" }
        );
        if (data && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        }
      } catch (err) {
        console.error("Geo search error", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchCity]);

  // ── Event handlers ─────────────────────────────────────────────────────────

  /**
   * handleSelectSuggestion — called when the user clicks an address suggestion.
   * Sets the search city to the suggestion value and immediately runs search.
   *
   * @param {{ city?: string, label: string }} suggestion
   */
  const handleSelectSuggestion = (suggestion) => {
    const val = suggestion.city || suggestion.label.split(",")[0];
    setSearchCity(val);
    setSuggestions([]);
    setShowSuggestions(false);
    handleRunSearch();
  };

  /**
   * openHomeModal — navigates to the property detail page.
   * Also fires a view-count PATCH in the background (fire-and-forget).
   *
   * @param {{ _id?: string, id?: string }} home — listing object
   */
  const openHomeModal = (home) => {
    const id = home?._id || home?.id;
    if (!id) return;

    // Increment the view counter asynchronously — no await needed
    if (!String(id).startsWith("demo-")) {
      apiFetch(`/api/listings/${id}/view`, {
        method: "PATCH",
        credentials: "omit",
      }).catch(() => { }); // Intentionally swallowed — non-critical
    }

    navigate(`/property/${id}`);
  };

  /** closeHomeModal — clears the selected listing and closes the modal */
  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  /**
   * handleRunSearch — resets to page 1, closing the suggestion dropdown.
   * Mutating `page` causes `buildListingsUrl()` to return a new key,
   * triggering a SWR refetch automatically.
   */
  const handleRunSearch = () => {
    setShowSuggestions(false);
    setPage(1);
  };

  /**
   * handleTypeFilter — toggles a deal-type filter (sale/rent).
   * Selecting the already-active type clears the filter (acts as a toggle).
   *
   * @param {"sale"|"rent"|"offer"|"wanted"} type
   */
  const handleTypeFilter = (type) => {
    setListingType(listingType === type ? "" : type);
    setPage(1);
  };

  /** handlePageChange — updates the page and smoothly scrolls to listings */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  /**
   * handleClearFilters — resets all filter state back to empty defaults.
   * SWR will automatically refetch after state clears.
   */
  const handleClearFilters = () => {
    setSearchCity("");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setPetsOnly(false);
    setFurnishedOnly(false);
    setListingType("");

    // V2 filters
    setPropertyType("");
    setProvince("");
    setDistrict("");
    setMunicipality("");
    setMinLandArea("");
    setMaxLandArea("");
    setRoadAccess("");
    setFacing("");

    setSuggestions([]);
    setPage(1);
  };

  /**
   * openFilterModal — opens the advanced filter modal.
   * Also hides the mobile FAB to avoid layering stacking issues.
   */
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
    // FAB is hidden while the modal is open (controlled via `isFilterModalOpen`
    // in the render gate below, so no extra setState is needed here).
  };

  /** closeFilterModal — closes the advanced filter modal */
  const closeFilterModal = () => setIsFilterModalOpen(false);

  /** saveHomeHandler — memoised save/unsave toggler passed to listing cards */
  const saveHomeHandler = (listing) =>
    handleToggleSaveHome(listing, savedIds, setSavedIds, onGoLogin);

  // ── Whether any V2 filter is active (used for badge indicator) ─────────────
  const hasActiveFilters = !!(propertyType || province || district || minPrice || maxPrice);

  // ---------------------------------------------------------------------------
  // 📐 Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ── Hero section ────────────────────────────────────────────────── */}
      <HeroSection
        t={t}
        searchCity={searchCity}
        setSearchCity={setSearchCity}
        onSearch={handleRunSearch}
        onGoLogin={onGoLogin}
        stats={stats}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
      />

      {/* ── Trust / highlight strip ──────────────────────────────────────── */}
      <HighlightStrip t={t} />

      {/* ── Desktop + mobile filters bar ─────────────────────────────────── */}
      <FiltersBar
        searchCity={searchCity}
        setSearchCity={setSearchCity}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        beds={beds}
        setBeds={setBeds}
        petsOnly={petsOnly}
        setPetsOnly={setPetsOnly}
        furnishedOnly={furnishedOnly}
        setFurnishedOnly={setFurnishedOnly}
        listingType={listingType}
        onTypeFilter={handleTypeFilter}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        province={province}
        setProvince={setProvince}
        district={district}
        setDistrict={setDistrict}
        municipality={municipality}
        setMunicipality={setMunicipality}
        minLandArea={minLandArea}
        setMinLandArea={setMinLandArea}
        maxLandArea={maxLandArea}
        setMaxLandArea={setMaxLandArea}
        roadAccess={roadAccess}
        setRoadAccess={setRoadAccess}
        facing={facing}
        setFacing={setFacing}

        onSearch={handleRunSearch}
        onClear={handleClearFilters}
        onOpenModal={openFilterModal}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
        showMap={showMap}
        onToggleMap={() => setShowMap((prev) => !prev)}
      />

      {/* ── Hero ad slot (hidden when map is showing) ─────────────────────── */}
      {adsData?.hero && adsData.hero.length > 0 && !showMap && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <AdBanner ad={adsData.hero[0]} className="h-24 sm:h-32 mb-6" />
        </div>
      )}

      {/* ── Map view / Listing grid ───────────────────────────────────────── */}
      {showMap ? (
        <section className="bg-slate-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {t.mapTitle}
              </h2>
              <p className="text-xs text-slate-500">{t.mapHint}</p>
            </div>
            <ListingMapView
              listings={listings}
              onSelectListing={openHomeModal}
            />
          </div>
        </section>
      ) : (
        <FeaturedListings
          t={t}
          listings={listings}
          loading={loadingListings}
          onToggleSave={saveHomeHandler}
          onOpenHome={openHomeModal}
          savedIds={savedIds}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          feedAd={adsData?.feed?.[0]}
        />
      )}

      {/* ── Community reviews ────────────────────────────────────────────── */}
      <SiteReviewsSection isLoggedIn={isLoggedIn} t={t} />

      {/* ── CTA (hidden when already logged in) ──────────────────────────── */}
      {!isLoggedIn && (
        <CallToAction
          t={t}
          onGoRegister={onGoRegister}
          onGoMembership={onGoMembership}
        />
      )}

      {/* ── Listing detail modal (kept in DOM for back-nav support) ──────── */}
      {isModalOpen && selectedHome && (
        <ListingModal
          home={selectedHome}
          onClose={closeHomeModal}
          onToggleSave={saveHomeHandler}
          isSaved={savedIds.includes(selectedHome._id || selectedHome.id)}
        />
      )}

      {/* ── Advanced filter modal ─────────────────────────────────────────── */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        searchCity={searchCity}
        setSearchCity={setSearchCity}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        beds={beds}
        setBeds={setBeds}
        petsOnly={petsOnly}
        setPetsOnly={setPetsOnly}
        furnishedOnly={furnishedOnly}
        setFurnishedOnly={setFurnishedOnly}
        propertyType={propertyType}
        setPropertyType={setPropertyType}
        province={province}
        setProvince={setProvince}
        district={district}
        setDistrict={setDistrict}
        municipality={municipality}
        setMunicipality={setMunicipality}
        minLandArea={minLandArea}
        setMinLandArea={setMinLandArea}
        maxLandArea={maxLandArea}
        setMaxLandArea={setMaxLandArea}
        roadAccess={roadAccess}
        setRoadAccess={setRoadAccess}
        facing={facing}
        setFacing={setFacing}
        amenities={amenities}
        setAmenities={setAmenities}

        onApply={handleRunSearch}
        onClear={handleClearFilters}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
      />

      {/* ── Back-to-top button ────────────────────────────────────────────── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 sm:bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {/*
       * ── Mobile sticky action pill (Map/List & Filters) ─────────────────
       *
       * Visibility rules:
       *  • Only rendered on mobile (sm:hidden).
       *  • Visible only when `showMobileFab` is true (user scrolled up).
       *  • Hidden entirely while the filter modal is open (`isFilterModalOpen`).
       *  • Fades in/out via CSS transition on the `opacity` and `translate-y`.
       *
       * The pill contains two actions separated by a divider:
       *  1. Map/List toggle — switches between district map and listing grid.
       *  2. Filters — opens the advanced filter modal overlay.
       *
       * A small blue dot badge appears over "Filters" when any filter is active.
       */}
      <div
        className={`sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-slate-900/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-2xl border border-slate-700/50 transition-all duration-300 ${showMobileFab && !isFilterModalOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        aria-hidden={!showMobileFab || isFilterModalOpen}
      >
        {/* Map / List toggle */}
        <button
          onClick={() => setShowMap((prev) => !prev)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors active:scale-95"
          aria-label={showMap ? "Switch to list view" : "Switch to map view"}
        >
          {showMap
            ? <Layers className="w-4 h-4 text-blue-400" />
            : <MapPin className="w-4 h-4 text-blue-400" />
          }
          <span className="text-sm font-bold tracking-wide">
            {showMap ? "List" : "Map"}
          </span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-slate-700 mx-1" />

        {/* Filters button — hides FAB while modal is open */}
        <button
          onClick={openFilterModal}
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors active:scale-95"
          aria-label="Open filters"
        >
          <Tag className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold tracking-wide">Filters</span>

          {/* Active-filter badge dot */}
          {hasActiveFilters && (
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   UI COMPONENTS
--------------------------------------------------------------------------- */
