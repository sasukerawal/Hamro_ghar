// src/HomePage.js
import React, { useState, useEffect } from "react";
import { apiFetch } from "./api";
import { toast } from "react-toastify";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";

import FilterModal from "./FilterModal";
import { ListingModal, handleToggleSaveHome } from "./ListingUtils";
import { useMeasurement } from "./contexts/MeasurementContext";
import AddressSuggestionsList from "./AddressSuggestionsList";
import ListingMapView from "./ListingMapView";

import {
  MapPin,
  Search,
  Heart,
  Shield,
  Star,
  ArrowRight,
  Phone,
  Home as HomeIcon,
  Eye,
  SlidersHorizontal,
  ChevronUp,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// 🌐 Full page translation map — add more strings here as needed
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
    statsQuote: "“Clean, simple and fast. Found my flat in 2 days.”",
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
    mapHint: "Tap a pin or card to see full details.",
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
    statsQuote: "“सरल र छिटो। २ दिनमा फ्ल्याट फेला पाएँ।”",
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
    mapHint: "पिन वा कार्डमा ट्याप गरेर पूर्ण विवरण हेर्नुस्।",
  },
};

export default function HomePage({
  onGoLogin,
  onGoRegister,
  onGoMembership,
  lang = "en",
}) {
  const t = PAGE_LANG[lang] || PAGE_LANG.en;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 🔄 List vs Map toggle
  const [showMap, setShowMap] = useState(false);

  // Filters
  const [searchCity, setSearchCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [petsOnly, setPetsOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [listingType, setListingType] = useState(""); // "" | "sale" | "rent" | "offer" | "wanted"
  
  // NEW V2 Filters
  const [propertyType, setPropertyType] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [minLandArea, setMinLandArea] = useState("");
  const [maxLandArea, setMaxLandArea] = useState("");
  const [roadAccess, setRoadAccess] = useState("");
  const [facing, setFacing] = useState("");
  const [amenities, setAmenities] = useState([]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LISTINGS_PER_PAGE = 12;

  // Back-to-top
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Address Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Modal
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ❤️ Saved homes (for hearts)
  const [savedIds, setSavedIds] = useState([]);

  // Back-to-top scroll listener
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Memoize the handler for use in ListingCard and Modal
  const saveHomeHandler = (listing) =>
    handleToggleSaveHome(listing, savedIds, setSavedIds, onGoLogin);

  // Check auth state (to hide CTA for logged-in users)
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((d) => setIsLoggedIn(!!(d?.user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Fetcher for SWR
  const swrFetcher = async (url) => {
    const res = await apiFetch(url, { credentials: "omit" });
    return res;
  };

  // 1. SWR for Stats
  const { data: statsData } = useSWR("/api/listings/stats", swrFetcher, {
    revalidateOnFocus: false, // Don't hammer the DB on every tab switch
    dedupingInterval: 60000,  // Cache for 1 min
  });

  const stats = {
    totalListings: statsData?.totalListings ?? statsData?.totalActive ?? null,
    citiesCount: statsData?.citiesCount ?? null,
    avgViews: statsData?.avgViews ?? null,
  };

  // 2. SWR for Listings
  // Build query string based on current state
  const buildListingsUrl = () => {
    const params = new URLSearchParams();
    if (searchCity.trim()) params.append("city", searchCity.trim());
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (beds) params.append("beds", beds);
    if (petsOnly) params.append("petsAllowed", "true");
    if (furnishedOnly) params.append("furnished", "true");
    if (listingType) params.append("type", listingType);
    
    // Append V2 filters
    if (propertyType) params.append("propertyType", propertyType);
    if (district) params.append("district", district);
    if (municipality) params.append("municipality", municipality);
    if (minLandArea) params.append("minLandArea", minLandArea);
    if (maxLandArea) params.append("maxLandArea", maxLandArea);
    if (roadAccess) params.append("roadAccess", roadAccess);
    if (facing) params.append("facing", facing);
    if (amenities && amenities.length > 0) params.append("amenities", amenities.join(","));

    params.append("page", page);
    params.append("limit", LISTINGS_PER_PAGE);
    
    return `/api/listings/all?${params.toString()}`;
  };

  const { data: listingsData, isLoading: loadingListings } = useSWR(
    buildListingsUrl(),
    swrFetcher,
    {
      keepPreviousData: true, // Smooth pagination! Keeps old items visible while fetching next page
      revalidateOnFocus: false,
    }
  );

  const listings = Array.isArray(listingsData?.listings) ? listingsData.listings : [];
  
  // Keep syncing totalPages and resetting exact page if out of bounds (edge case)
  useEffect(() => {
    if (listingsData?.totalPages) setTotalPages(listingsData.totalPages);
    if (listingsData?.page && listingsData.page < page) setPage(listingsData.page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingsData]);

  // Load saved homes
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const data = await apiFetch("/api/listings/saved/me");
        if (Array.isArray(data.saved)) {
          const ids = data.saved.map((h) => h._id || h.id);
          setSavedIds(ids);
        }
      } catch (err) {
        if (err.message.includes("401")) return;
        console.error("Error loading saved homes", err);
      }
    };
    loadSaved();
  }, []);

  // 🟢 Address Auto-Suggestion Effect
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

  const handleSelectSuggestion = (suggestion) => {
    const val = suggestion.city || suggestion.label.split(",")[0];
    setSearchCity(val);
    setSuggestions([]);
    setShowSuggestions(false);
    handleRunSearch();
  };

  // Modal handlers -> Converted to Page Redirect for V2 Architecture
  const openHomeModal = (home) => {
    const id = home?._id || home?.id;
    if (!id) return;
    
    // Increment views asynchronously behind the scenes
    if (!String(id).startsWith("demo-")) {
      apiFetch(`/api/listings/${id}/view`, {
        method: "PATCH",
        credentials: "omit",
      }).catch(() => {});
    }
    
    navigate(`/property/${id}`);
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  const handleRunSearch = () => {
    setShowSuggestions(false);
    setPage(1); // Modifying state automatically triggers SWR refetch via buildListingsUrl
  };

  const handleTypeFilter = (type) => {
    const newType = listingType === type ? "" : type;
    // Changing type will trigger SWR refetch automatically
    setListingType(newType);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearchCity("");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setPetsOnly(false);
    setFurnishedOnly(false);
    setListingType("");
    
    setPropertyType("");
    setDistrict("");
    setMunicipality("");
    setMinLandArea("");
    setMaxLandArea("");
    setRoadAccess("");
    setFacing("");

    setSuggestions([]);
    setPage(1);
  };

  return (
    <>
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
      <HighlightStrip t={t} />

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
        
        // V2 Filters
        propertyType={propertyType}
        setPropertyType={setPropertyType}
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
        onOpenModal={() => setIsFilterModalOpen(true)}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
        showMap={showMap}
        onToggleMap={() => setShowMap((prev) => !prev)}
      />

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
        />
      )}

      <SiteReviewsSection isLoggedIn={isLoggedIn} t={t} />

      {!isLoggedIn && (
        <CallToAction
          t={t}
          onGoRegister={onGoRegister}
          onGoMembership={onGoMembership}
        />
      )}

      {isModalOpen && selectedHome && (
        <ListingModal
          home={selectedHome}
          onClose={closeHomeModal}
          onToggleSave={saveHomeHandler}
          isSaved={savedIds.includes(selectedHome._id || selectedHome.id)}
        />
      )}

      {showMap ? null : null /* already rendered above */}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
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
        
        // V2 Filters
        propertyType={propertyType}
        setPropertyType={setPropertyType}
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

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}

/* -------------------------------------------------------------------
   UI COMPONENTS
------------------------------------------------------------------- */

const HeroSection = ({
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

const FiltersBar = ({
  searchCity,
  setSearchCity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  beds,
  setBeds,
  petsOnly,
  setPetsOnly,
  furnishedOnly,
  setFurnishedOnly,
  listingType,
  onTypeFilter,
  
  // V2
  propertyType,
  setPropertyType,
  district,
  setDistrict,
  municipality,
  setMunicipality,
  
  onSearch,
  onClear,
  onOpenModal,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
  showMap,
  onToggleMap,
}) => (
  <section className="bg-white border-y border-blue-50 relative z-10">
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Desktop layout */}
      <div className="hidden sm:flex flex-col gap-3">
        {/* Type toggle + map toggle row */}
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Deal:</span>
          {[{val:"sale",label:"For Sale"},{val:"rent",label:"For Rent"}].map(({val,label}) => (
            <button
              key={val}
              type="button"
              onClick={() => onTypeFilter(val)}
              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                listingType === val
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-slate-200">|</span>
          <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="outline-none border border-slate-200 bg-white text-[11px] text-slate-600 font-semibold px-2 py-1 rounded-full w-32 cursor-pointer hover:bg-slate-50">
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
            <option value="room">Room</option>
          </select>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={onToggleMap}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
          >
            {showMap ? "📋 Show list" : "🗺️ Show map"}
          </button>
        </div>
        
        {/* Filter inputs row */}
        <div className="flex flex-row sm:items-end gap-3">
          <div className="grid gap-3 sm:grid-cols-4 flex-1">
             <FilterInput label="District (e.g. Kathmandu)" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />
             <FilterInput label="City/Municipality" type="text" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
             <FilterInput label="Max rent/price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
             <FilterInput label="Min beds" type="number" value={beds} onChange={(e) => setBeds(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-700 px-4 py-1.5 border border-blue-200 text-xs font-semibold hover:bg-blue-100"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              Advanced
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          {[{val:"sale",label:"Buy"},{val:"rent",label:"Rent"}].map(({val,label}) => (
            <button
              key={val}
              type="button"
              onClick={() => onTypeFilter(val)}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${
                listingType === val
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 truncate">
               {district || municipality ? `${municipality ? municipality+', ' : ''}${district}` : "All Areas"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMap}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              {showMap ? "List" : "Map"}
            </button>
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FilterInput = ({ label, ...props }) => (
  <div className="text-xs">
    <p className="font-semibold text-slate-700 mb-1">{label}</p>
    <input
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
      {...props}
    />
  </div>
);



// HighlightStrip — honest, no "verified" claim
const HighlightStrip = ({ t }) => (
  <section className="bg-white border-y border-blue-50">
    <div className="max-w-6xl mx-auto px-4 py-6 grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
      <HighlightItem
        icon={<HomeIcon className="h-4 w-4 text-blue-500" />}
        title={t.strip1Title}
        text={t.strip1Text}
      />
      <HighlightItem
        icon={<HomeIcon className="h-4 w-4 text-blue-500" />}
        title={t.strip2Title}
        text={t.strip2Text}
      />
      <HighlightItem
        icon={<Phone className="h-4 w-4 text-blue-500" />}
        title={t.strip3Title}
        text={t.strip3Text}
      />
    </div>
    {/* Risk notice */}
    <div className="max-w-6xl mx-auto px-4 pb-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <span className="font-bold">{t.riskTitle} —</span> {t.riskText}
        </p>
      </div>
    </div>
  </section>
);

const HighlightItem = ({ icon, title, text }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-slate-500 text-xs">{text}</p>
    </div>
  </div>
);

// Skeleton shimmer card
const SkeletonCard = () => (
  <div className="rounded-2xl border border-blue-50 bg-white shadow-sm overflow-hidden animate-pulse">
    <div className="h-40 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" style={{backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite'}} />
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

const FeaturedListings = ({
  t,
  listings,
  loading,
  onToggleSave,
  onOpenHome,
  savedIds,
  page,
  totalPages,
  onPageChange,
}) => (
  <section className="bg-slate-50 py-10">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">
            {t.listingsLabel}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t.listingsTitle}
          </h2>
        </div>
        {!loading && listings.length > 0 && (
          <p className="text-xs text-slate-500">{t.listingsPage} {page} {t.listingsOf} {totalPages}</p>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((home) => {
              const id = home._id || home.id;
              const isSaved = savedIds.includes(id);

              return (
                <ListingCard
                  key={id}
                  home={home}
                  onToggleSave={onToggleSave}
                  onOpenHome={onOpenHome}
                  isSaved={isSaved}
                  isVirtualized={false}
                />
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
                  className={`h-8 w-8 rounded-full text-xs font-semibold transition-all ${
                    pg === page
                      ? "bg-blue-600 text-white shadow-sm"
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

const ListingCard = ({ home, onToggleSave, onOpenHome, isSaved, isVirtualized }) => {
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
      className={`group rounded-2xl border border-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${isVirtualized ? "h-full" : "sm:block"}`}
      onClick={() => onOpenHome(home)}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={home.address}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x400/eff6ff/0f172a?text=Home";
          }}
        />
        {/* Verification Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {(home.verifiedSeller || home.isVerified) && (
             <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/95 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm tracking-wider uppercase">
               <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
               </svg>
               Verified
             </span>
          )}
          {home.urgency === "high" && (
             <span className="inline-flex items-center gap-1 rounded-full bg-red-500/95 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-sm tracking-wider uppercase bg-pulse">
               ⚡ Urgent
             </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-blue-50 z-20 ${
            isSaved ? "text-red-500" : "text-slate-700"
          }`}
        >
          <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
        <div className="absolute left-3 bottom-3 flex items-center gap-2 z-20">
           <span className="rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm shadow-sm border border-blue-500/50">
             {formatPrice(home.price)}
           </span>
           <span className="rounded-full bg-slate-900/80 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm uppercase tracking-wider border border-slate-700/50">
             {home.type === "sale" ? "Sale" : "Rent"}
           </span>
        </div>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <p className="text-sm font-bold text-slate-900 line-clamp-1">
          {home.title || home.address}
        </p>
        <p className="text-xs font-medium text-slate-500 flex items-start gap-1.5 mt-1">
          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
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
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">
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
              <span>{home.createdAt ? new Date(home.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "Recently"}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const CallToAction = ({ t, onGoRegister, onGoMembership }) => (
  <section className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-12">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-1">
          {t.ctaTag}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold">
          {t.ctaTitle}
        </h2>
        <p className="mt-2 text-sm text-blue-100 max-w-md">
          {t.ctaSub}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onGoRegister}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md hover:bg-slate-100"
        >
          {t.ctaBtn1}
        </button>
        <button
          type="button"
          onClick={onGoMembership}
          className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500/40"
        >
          {t.ctaBtn2}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

/* ----------------------------------------
   SITE REVIEWS SECTION
---------------------------------------- */
function SiteReviewsSection({ isLoggedIn, t }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [myReviewId, setMyReviewId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      apiFetch("/api/auth/me").then((d) => setCurrentUserId(d?.user?.id || d?.user?._id)).catch(() => {});
    }
  }, [isLoggedIn]);

  const load = () => {
    setLoading(true);
    apiFetch("/api/site-reviews", { credentials: "omit" })
      .then((d) => {
        setReviews(d.reviews || []);
        setAvgRating(d.avgRating);
        if (currentUserId) {
          const mine = (d.reviews || []).find((r) => String(r.userId) === String(currentUserId));
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment); setMyReviewId(mine._id); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [currentUserId]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { toast.error("Please pick a star rating"); return; }
    if (myComment.trim().length < 5) { toast.error("Comment must be at least 5 characters"); return; }
    setSubmitting(true);
    try {
      const data = await apiFetch("/api/site-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      if (data.review) {
        setMyReviewId(data.review._id);
        toast.success("Thank you for your review!");
        load();
      }
    } catch (err) { toast.error(err.message || "Could not submit review"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!myReviewId) return;
    try {
      await apiFetch(`/api/site-reviews/${myReviewId}`, { method: "DELETE" });
      setMyRating(0); setMyComment(""); setMyReviewId(null);
      toast.success("Review removed");
      load();
    } catch (err) { toast.error(err.message || "Could not delete review"); }
  };

  const labels = ["Terrible", "Poor", "Average", "Good", "Excellent"];

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">{t.communityTag}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t.communityTitle}</h2>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-2xl px-3 py-1.5">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-slate-800">{avgRating}</span>
              <span className="text-xs text-slate-500">/ 5</span>
            </div>
          )}
        </div>

        {/* Submit form — logged in only */}
        {isLoggedIn && (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-blue-100 rounded-2xl p-4 mb-6 space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              {myReviewId ? t.reviewUpdate2 : t.reviewShare}
            </p>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setMyRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} className="focus:outline-none">
                  <Star className={`h-6 w-6 transition-colors ${n <= (hover || myRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                </button>
              ))}
              {myRating > 0 && <span className="text-xs text-slate-500 ml-2">{labels[myRating - 1]}</span>}
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder={t.reviewPlaceholder}
              maxLength={400}
              className="w-full text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-400 min-h-[70px] resize-none"
            />
            <div className="flex items-center gap-2">
              <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white text-sm font-semibold rounded-xl py-2 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                {myReviewId ? t.reviewUpdate : t.reviewSubmit}
              </button>
              {myReviewId && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">{t.reviewRemove}</button>
              )}
            </div>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-blue-400" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">{t.reviewNone}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-2xl border border-blue-50 bg-slate-50/60 p-4 shadow-sm">
                <div className="flex items-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 mb-3">"{r.comment}"</p>
                <p className="text-xs font-semibold text-slate-900">{r.userName}</p>
                <p className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

