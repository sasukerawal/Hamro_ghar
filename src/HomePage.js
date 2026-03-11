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

import HeroSection from "./components/home/HeroSection";
import FiltersBar from "./components/home/FiltersBar";
import HighlightStrip from "./components/home/HighlightStrip";
import { FeaturedListings } from "./components/home/FeaturedListings";
import CallToAction from "./components/home/CallToAction";
import SiteReviewsSection from "./components/home/SiteReviewsSection";
import AdBanner from "./components/ads/AdBanner";

import {
  MapPin,
  Search,
  Heart,
  Shield,
  Star,
  ArrowRight,
  ChevronUp,
  Tag,
  Layers,
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
  const [province, setProvince] = useState("");
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

  // 2. SWR for Ads
  const { data: adsData } = useSWR("/api/ads/active", swrFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, 
  });

  // 3. SWR for Listings
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
    if (province) params.append("province", province);
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
        onOpenModal={() => setIsFilterModalOpen(true)}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
        showMap={showMap}
        onToggleMap={() => setShowMap((prev) => !prev)}
      />

      {/* Hero Ad Placement */}
      {adsData?.hero && adsData.hero.length > 0 && !showMap && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <AdBanner ad={adsData.hero[0]} className="h-24 sm:h-32 mb-6" />
        </div>
      )}

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

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 sm:bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {/* Mobile Sticky Action Pill (Map/List Toggle & Filters) */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-slate-900/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-2xl border border-slate-700/50">
         <button 
           onClick={() => showMap ? setShowMap(false) : setShowMap(true)}
           className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors active:scale-95"
         >
            {showMap ? <Layers className="w-4 h-4 text-blue-400" /> : <MapPin className="w-4 h-4 text-blue-400" />}
            <span className="text-sm font-bold tracking-wide">{showMap ? 'List' : 'Map'}</span>
         </button>
         
         <div className="w-[1px] h-6 bg-slate-700 mx-1"></div>
         
         <button 
           onClick={() => setIsFilterModalOpen(true)}
           className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors active:scale-95"
         >
            <Tag className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold tracking-wide">Filters</span>
            {/* Show badge if filters are active */}
            {(propertyType || province || district || minPrice || maxPrice) && (
              <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-blue-500"></span>
            )}
         </button>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------
   UI COMPONENTS
------------------------------------------------------------------- */


