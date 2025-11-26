import React, { useState, useEffect } from "react";
import { apiFetch } from "./api";
import FilterModal from "./FilterModal";
// ✅ Import reusable utilities
import { ListingModal, handleToggleSaveHome } from "./ListingUtils";
import AddressSuggestionsList from "./AddressSuggestionsList";
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
} from "lucide-react";

// Fallback listings if backend fails
const FALLBACK_LISTINGS = [
  {
    _id: "demo-1",
    price: "Rs. 45,000 / month",
    beds: 3,
    baths: 2,
    sqft: "1,450",
    address: "Modern Apartment, Lazimpat",
    city: "Kathmandu",
    image:
      "https://images.unsplash.com/photo-1600596542815-7b95e06b5f3c?auto=format&fit=crop&w=900&q=80",
    views: 0,
  },
  {
    _id: "demo-2",
    price: "Rs. 35,000 / month",
    beds: 2,
    baths: 1,
    sqft: "1,020",
    address: "Cozy Flat, Baneshwor",
    city: "Kathmandu",
    image:
      "https://images.unsplash.com/photo-1590490359854-dfba19688d70?auto=format&fit=crop&w=900&q=80",
    views: 0,
  },
  {
    _id: "demo-3",
    price: "Rs. 60,000 / month",
    beds: 4,
    baths: 3,
    sqft: "1,900",
    address: "Family House, Pokhara Lakeside",
    city: "Pokhara",
    image:
      "https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?auto=format&fit=crop&w=900&q=80",
    views: 0,
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sara K.",
    role: "Student",
    quote: "HamroGhar made it easy to find a safe, clean flat near my college.",
  },
  {
    id: 2,
    name: "Ram B.",
    role: "Working professional",
    quote:
      "Clean interface, no spam calls, just real homes that matched my budget.",
  },
  {
    id: 3,
    name: "Anushka R.",
    role: "First-time renter",
    quote:
      "I liked how simple everything looked — blue and white, no confusion.",
  },
];

export default function HomePage({
  onGoLogin,
  onGoRegister,
  onGoMembership,
}) {
  const [listings, setListings] = useState(FALLBACK_LISTINGS);
  const [loadingListings, setLoadingListings] = useState(false);

  // Filters
  const [searchCity, setSearchCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [petsOnly, setPetsOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Address Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Modal
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hero stats
  const [stats, setStats] = useState({
    totalListings: null,
    citiesCount: null,
    avgViews: null,
  });

  // ❤️ Saved homes (for hearts)
  const [savedIds, setSavedIds] = useState([]);

  // Memoize the handler for use in ListingCard and Modal
  const saveHomeHandler = (listing) =>
    handleToggleSaveHome(listing, savedIds, setSavedIds, onGoLogin);

  // Load listings from backend
  const fetchListings = async (opts = {}) => {
    const {
      city = searchCity,
      min = minPrice,
      max = maxPrice,
      minBeds = beds,
      pets = petsOnly,
      furnished = furnishedOnly,
    } = opts;

    try {
      setLoadingListings(true);

      const params = new URLSearchParams();
      if (city.trim()) params.append("city", city.trim());
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);
      if (minBeds) params.append("beds", minBeds);
      if (pets) params.append("petsAllowed", "true");
      if (furnished) params.append("furnished", "true");

      const qs = params.toString();

      const data = await apiFetch(`/api/listings/all${qs ? `?${qs}` : ""}`, {
        credentials: "omit",
      });

      if (Array.isArray(data.listings) && data.listings.length > 0) {
        setListings(data.listings);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error("Error loading listings", err);
      if (listings.length === 0) setListings(FALLBACK_LISTINGS);
    } finally {
      setLoadingListings(false);
    }
  };

  // Load stats
  const fetchStats = async () => {
    try {
      const data = await apiFetch("/api/listings/stats", {
        credentials: "omit",
      });
      setStats({
        totalListings: data.totalListings ?? null,
        citiesCount: data.citiesCount ?? null,
        avgViews: data.avgViews ?? null,
      });
    } catch (err) {
      console.error("Error loading listing stats", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchListings();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Modal handlers
  const openHomeModal = async (home) => {
    setSelectedHome(home);
    setIsModalOpen(true);

    const id = home?._id || home?.id;
    if (!id || String(id).startsWith("demo-")) return;

    try {
      const data = await apiFetch(`/api/listings/${id}/view`, {
        method: "PATCH",
        credentials: "omit",
      });

      if (typeof data.views === "number") {
        setListings((prev) =>
          prev.map((l) =>
            (l._id || l.id) === id ? { ...l, views: data.views } : l
          )
        );
        setSelectedHome((prev) =>
          prev && (prev._id || prev.id) === id
            ? { ...prev, views: data.views }
            : prev
        );
      }
    } catch (err) {
      console.error("Increment view error", err);
    }
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  const handleRunSearch = () => {
    setShowSuggestions(false);
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearchCity("");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setPetsOnly(false);
    setFurnishedOnly(false);
    setSuggestions([]);
    fetchListings({
      city: "",
      min: "",
      max: "",
      minBeds: "",
      pets: false,
      furnished: false,
    });
  };

  return (
    <>
      <HeroSection
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
      <HighlightStrip />

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
        onSearch={handleRunSearch}
        onClear={handleClearFilters}
        onOpenModal={() => setIsFilterModalOpen(true)}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
      />

      <FeaturedListings
        listings={listings}
        loading={loadingListings}
        onToggleSave={saveHomeHandler}
        onOpenHome={openHomeModal}
        savedIds={savedIds}
      />

      <Testimonials />
      <CallToAction
        onGoRegister={onGoRegister}
        onGoMembership={onGoMembership}
      />

      {isModalOpen && selectedHome && (
        <ListingModal
          home={selectedHome}
          onClose={closeHomeModal}
          onToggleSave={saveHomeHandler}
          isSaved={savedIds.includes(selectedHome._id || selectedHome.id)}
        />
      )}

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
        onApply={handleRunSearch}
        onClear={handleClearFilters}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        setShowSuggestions={setShowSuggestions}
      />
    </>
  );
}

/* -------------------------------------------------------------------
   UI COMPONENTS
------------------------------------------------------------------- */

const HeroSection = ({
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
  const total = stats.totalListings ?? "12,430";
  const cities = stats.citiesCount ?? "32";
  const avgViews = stats.avgViews ?? "9+";

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-4">
            <Shield className="h-3.5 w-3.5" />
            Verified homes · No broker spam
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            Find a home that
            <span className="text-blue-600"> feels like you.</span>
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-md">
            Search modern blue &amp; white homes, cozy apartments, and family
            spaces across the city in just a few clicks.
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
                placeholder="Enter area or city, e.g. Baneshwor, Kathmandu"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {/* ✅ Shared Address Suggestions */}
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
              Search homes
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>4.9/5 from 2k+ users</span>
            </div>
            <button
              type="button"
              onClick={onGoLogin}
              className="underline-offset-2 hover:underline text-blue-700"
            >
              Already a member? Sign in
            </button>
          </div>
        </div>

        <HeroStatsCard
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
        Live listings
      </p>
      <p className="text-3xl font-bold mb-1">{totalListings}</p>
      <p className="text-xs text-blue-100 mb-6">
        properties available right now
      </p>

      <div className="space-y-3 text-xs">
        <HeroStat label="Average homes viewed per user" value={avgViews} />
        <HeroStat label="Cities covered" value={cities} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex -space-x-2">
          <AvatarInitial label="A" />
          <AvatarInitial label="B" />
          <AvatarInitial label="C" />
        </div>
        <p className="text-[11px] text-blue-100">
          “Clean, simple and fast. Found my flat in 2 days.”
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
  onSearch,
  onClear,
  onOpenModal,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
}) => (
  <section className="bg.white border-y border-blue-50 relative z-10">
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Desktop layout */}
      <div className="hidden sm:flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-4 flex-1">
          {/* City Input with Suggestions (Desktop) */}
          <div className="relative text-xs">
            <p className="font-semibold text-slate-700 mb-1">City / Area</p>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="Baneshwor"
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <AddressSuggestionsList
                suggestions={suggestions}
                show={showSuggestions}
                onSelect={onSelectSuggestion}
              />
            </div>
          </div>

          <FilterInput
            label="Min rent (Rs)"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <FilterInput
            label="Max rent (Rs)"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <FilterInput
            label="Min beds"
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-4">
          <FilterCheckbox
            label="Pets allowed"
            checked={petsOnly}
            onChange={(e) => setPetsOnly(e.target.checked)}
          />
          <FilterCheckbox
            label="Furnished only"
            checked={furnishedOnly}
            onChange={(e) => setFurnishedOnly(e.target.checked)}
          />
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Apply filters
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

      {/* Mobile layout */}
      <div className="sm:hidden flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Showing {beds ? `${beds}+ bed ` : ""}homes in{" "}
          {searchCity || "All Areas"}
        </p>
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

const FilterCheckbox = ({ label, ...props }) => (
  <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
    <input
      type="checkbox"
      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      {...props}
    />
    <span>{label}</span>
  </label>
);

const HighlightStrip = () => (
  <section className="bg-white border-y border-blue-50">
    <div className="max-w-6xl mx-auto px-4 py-6 grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
      <HighlightItem
        icon={<Shield className="h-4 w-4 text-blue-500" />}
        title="Verified listings"
        text="Every home is checked by our team before it goes live."
      />
      <HighlightItem
        icon={<HomeIcon className="h-4 w-4 text-blue-500" />}
        title="Student friendly"
        text="Filter by furnished rooms, Wi-Fi, and walking distance."
      />
      <HighlightItem
        icon={<Phone className="h-4 w-4 text-blue-500" />}
        title="Human support"
        text="Talk to a real person when you feel stuck."
      />
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

const FeaturedListings = ({
  listings,
  loading,
  onToggleSave,
  onOpenHome,
  savedIds,
}) => (
  <section className="bg-slate-50 py-10">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items.end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">
            Featured
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Homes picked for you
          </h2>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Loading listings…</p>
      ) : listings.length === 0 ? (
        <p className="text-xs text-slate-500">
          No homes match these filters yet. Try adjusting your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              />
            );
          })}
        </div>
      )}
    </div>
  </section>
);

const ListingCard = ({ home, onToggleSave, onOpenHome, isSaved }) => {
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
      className="group rounded-2xl border border-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col sm:block"
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
        <button
          type="button"
          onClick={handleSaveClick}
          className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-blue-50 ${
            isSaved ? "text-red-500" : "text-slate-700"
          }`}
        >
          <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
        <span className="absolute left-3 bottom-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
          {typeof home.price === "number" ? `Rs. ${home.price}` : home.price}
        </span>
      </div>
      <div className="p-3.5 space-y-2">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {home.title || home.address}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-blue-500" />
          {home.city}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>{home.beds} beds</span>
          <span>{home.baths} baths</span>
          <span>{home.sqft} sqft</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {home.views ?? 0} views
          </span>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => (
  <section className="bg-white py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-blue-500 uppercase">
            Stories
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            What members say
          </h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-blue-50 bg-slate-50/60 p-4 shadow-sm"
          >
            <div className="flex items-center gap-1 mb-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="text-sm text-slate-700 mb-4">“{item.quote}”</p>
            <p className="text-xs font-semibold text-slate-900">
              {item.name}
            </p>
            <p className="text-[11px] text-slate-500">{item.role}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CallToAction = ({ onGoRegister, onGoMembership }) => (
  <section className="bg-gradient-to-r from-blue-600 to-sky-500 text.white py-12">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-1">
          Membership
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold">
          Unlock member-only homes &amp; support
        </h2>
        <p className="mt-2 text-sm text-blue-100 max-w-md">
          Get saved searches, instant alerts, and priority help from our team —
          all in one clean, simple dashboard.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onGoRegister}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md hover:bg-slate-100"
        >
          Get started free
        </button>
        <button
          type="button"
          onClick={onGoMembership}
          className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500/40"
        >
          View member dashboard
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);
