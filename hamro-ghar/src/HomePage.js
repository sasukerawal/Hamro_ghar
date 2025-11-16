// src/HomePage.js
import React, { useState, useEffect } from "react";
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
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

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

  // Load listings from backend (with filters)
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
      const res = await fetch(
        `http://localhost:4000/api/listings/all${qs ? `?${qs}` : ""}`
      );

      if (!res.ok) {
        // Silent fallback: keep demo listings
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.listings) && data.listings.length > 0) {
        setListings(data.listings);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error("Error loading listings", err);
    } finally {
      setLoadingListings(false);
    }
  };

  // Load stats for hero box
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/listings/stats");
      if (!res.ok) return;
      const data = await res.json();
      setStats({
        totalListings: data.totalListings ?? null,
        citiesCount: data.citiesCount ?? null,
        avgViews: data.avgViews ?? null,
      });
    } catch (err) {
      console.error("Error loading listing stats", err);
    }
  };

  // Initial load: listings + stats
  useEffect(() => {
    fetchListings();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved homes once so hearts reflect real saved state
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/api/listings/saved/me",
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.saved)) {
          const ids = data.saved.map((h) => h._id || h.id);
          setSavedIds(ids);
        }
      } catch (err) {
        console.error("Error loading saved homes for hearts", err);
      }
    };

    loadSaved();
  }, []);

  // ❤️ Save / unsave home using your backend routes
  const handleToggleSaveHome = async (listing) => {
    const id = listing?._id || listing?.id;
    if (!id) {
      toast.error("Listing ID missing");
      return;
    }

    // Demo cards can't actually be saved to backend
    if (String(id).startsWith("demo-")) {
      toast.info("Demo homes can't be saved. Post a real home to save it.");
      return;
    }

    const isSaved = savedIds.includes(id);

    try {
      const res = await fetch(
        `http://localhost:4000/api/listings/save/${id}`,
        {
          method: isSaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      if (res.status === 401) {
        toast.info("Please log in to save homes.");
        onGoLogin();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not update saved status");
        return;
      }

      toast.success(
        isSaved
          ? "Removed from your favourites"
          : "Home saved to your favourites ❤️"
      );

      setSavedIds((prev) =>
        isSaved ? prev.filter((savedId) => savedId !== id) : [...prev, id]
      );
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating saved status");
    }
  };

  // 👁️ Open modal + bump view count
  const openHomeModal = async (home) => {
    setSelectedHome(home);
    setIsModalOpen(true);

    const id = home?._id || home?.id;
    if (!id || String(id).startsWith("demo-")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/listings/${id}/view`,
        { method: "POST" }
      );

      if (!res.ok) return;
      const data = await res.json();

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
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearchCity("");
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setPetsOnly(false);
    setFurnishedOnly(false);
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
      />

      <FeaturedListings
        listings={listings}
        loading={loadingListings}
        onToggleSave={handleToggleSaveHome}
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
          onToggleSave={handleToggleSaveHome}
          isSaved={savedIds.includes(selectedHome._id || selectedHome.id)}
        />
      )}
    </>
  );
}

// ───────────────── Hero section ─────────────────

const HeroSection = ({
  searchCity,
  setSearchCity,
  onSearch,
  onGoLogin,
  stats,
}) => {
  const total = stats.totalListings ?? "12,430";
  const cities = stats.citiesCount ?? "32";
  const avgViews = stats.avgViews ?? "9+";

  return (
    <section className="bg-gradient.to-br from-blue-50 via-white to-blue-100">
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

          <div className="mt-6 rounded-2xl bg-white shadow-lg border border-blue-50 p-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
              <MapPin className="h-4 w-4 text-blue-500" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Enter area or city, e.g. Baneshwor, Kathmandu"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
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
            <div className="flex.items-center gap-1">
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
        />
      </div>
    </section>
  );
};

const HeroStatsCard = ({ totalListings, cities, avgViews }) => (
  <div className="relative">
    <div className="relative rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-12 h-32 w-32 rounded-full bg.white/10" />

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

// ───────────── Filters bar ─────────────

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
}) => (
  <section className="bg-white border-y border-blue-50">
    <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-3 sm:grid-cols-4 flex-1">
        <FilterInput
          label="City / Area"
          placeholder="Baneshwor"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
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

// ───────────── Highlight strip ─────────────

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

// ───────────── Featured listings ─────────────

const FeaturedListings = ({
  listings,
  loading,
  onToggleSave,
  onOpenHome,
  savedIds,
}) => (
  <section className="bg-slate-50 py-10">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-between gap-4 mb-6">
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
      className="group rounded-2xl border border-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
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

// ───────────── Testimonials ─────────────

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
            <p className="text-xs font-semibold text-slate-900">{item.name}</p>
            <p className="text-[11px] text-slate-500">{item.role}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ───────────── CTA ─────────────

const CallToAction = ({ onGoRegister, onGoMembership }) => (
  <section className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-12">
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
          className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text.white hover:bg-blue-500/40"
        >
          View member dashboard
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

// ───────────── Listing Modal with message templates + gallery ─────────────

const messageTemplates = [
  "Hi, I saw your listing on HamroGhar. Is this home still available?",
  "Hello, I’m interested in your listing. Can we schedule a viewing this week?",
  "Hi, could you please share more details about utilities, internet and any extra fees?",
];

const ListingModal = ({ home, onClose, onToggleSave, isSaved }) => {
  // ✅ Hooks at the top
  const [activeIndex, setActiveIndex] = useState(0);
  const homeKey = home ? (home._id || home.id) : null;

  // Reset to first image whenever a different home is opened
  useEffect(() => {
    setActiveIndex(0);
  }, [homeKey]);

  if (!home) return null;

  // 🔹 Handle multiple images
  const rawImages =
    (Array.isArray(home.images) && home.images.length > 0
      ? home.images
      : home.image
      ? [home.image]
      : []) || [];

  const fallbackImg =
    "https://placehold.co/800x500/eff6ff/0f172a?text=Home";

  const images = rawImages.length > 0 ? rawImages : [fallbackImg];
  const currentImage = images[activeIndex] || fallbackImg;

  const mapsUrl =
    home?.location?.lat && home?.location?.lng
      ? `https://www.google.com/maps/search/?api=1&query=${home.location.lat},${home.location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${home.address || ""} ${home.city || ""}`
        )}`;

  const postedDate = home.createdAt
    ? new Date(home.createdAt).toLocaleDateString()
    : null;

  const priceLabel =
    typeof home.price === "number" ? `Rs. ${home.price}` : home.price;

  const handleCopyTemplate = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied. You can paste it in chat or SMS.");
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Could not copy message, please copy manually.");
    }
  };

  const handleToggleSaveClick = (e) => {
    e.stopPropagation();
    onToggleSave(home);
  };

  // ✅ Close when tapping on the dark backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handleThumbClick = (e, idx) => {
    e.stopPropagation();
    setActiveIndex(idx);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6"
      onClick={handleBackdropClick}
    >
      {/* Scrollable panel with max height */}
      <div className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-y-auto">
        {/* Top image + gallery */}
        <div className="relative w-full overflow-hidden">
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={currentImage}
              alt={home.title || home.address || "Home"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImg;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-800 hover:bg-white shadow-sm"
            >
              Close
            </button>
            {priceLabel && (
              <div className="absolute left-4 bottom-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow">
                {priceLabel}
                <span className="ml-1 text-[10px] font-normal text-slate-500">
                  / month
                </span>
              </div>
            )}

            {/* ⬅️➡️ arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg-white/95 border-t border-slate-100 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleThumbClick(e, idx)}
                  className={`h-14 w-20 rounded-xl overflow-hidden border ${
                    idx === activeIndex
                      ? "border-blue-500"
                      : "border-slate-200"
                  } flex-shrink-0`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-sm">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase text-blue-500 tracking-[0.16em] mb-1">
                {home.city || "Listed home"}
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {home.title || home.address || "Home for rent"}
              </h3>
              {home.address && (
                <p className="text-xs text-slate-500 mt-1">{home.address}</p>
              )}
            </div>
            <div className="text-right text-[11px] text-slate-500">
              {postedDate && (
                <p>
                  Posted on <span className="font-medium">{postedDate}</span>
                </p>
              )}
              {home._id && (
                <p className="mt-0.5">ID: {String(home._id).slice(-6)}</p>
              )}
              <p className="mt-1 flex items-center justify-end gap-1">
                <Eye className="h-3 w-3" />
                {home.views ?? 0} views
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <SpecPill>{home.beds} beds</SpecPill>
            <SpecPill>{home.baths} baths</SpecPill>
            <SpecPill>{home.sqft} sqft</SpecPill>
          </div>

          {/* Amenities */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.14em]">
              Amenities
            </p>
            <div className="flex flex-wrap gap-2">
              <AmenityTag active={!!home.furnished}>Furnished</AmenityTag>
              <AmenityTag active={!!home.internet}>Internet</AmenityTag>
              <AmenityTag active={!!home.parking}>Parking</AmenityTag>
              <AmenityTag
                active={home.petsAllowed !== undefined && home.petsAllowed}
              >
                Pets allowed
              </AmenityTag>
            </div>
          </div>

          {/* Description */}
          {home.description && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.14em]">
                Description
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {home.description}
              </p>
            </div>
          )}

          {/* Quick contact templates */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.14em]">
              Message templates
            </p>
            <p className="text-[11px] text-slate-500 mb-1">
              Copy a ready-made message to send on WhatsApp, Messenger or SMS.
            </p>
            <div className="space-y-1.5">
              {messageTemplates.map((msg, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <p className="flex-1 text-[11px] text-slate-700">{msg}</p>
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate(msg)}
                    className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Location / map + save */}
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700 mb-0.5">Location</p>
              {home.location?.lat && home.location?.lng ? (
                <p>
                  Lat: {home.location.lat.toFixed(4)}, Lng:{" "}
                  {home.location.lng.toFixed(4)}
                </p>
              ) : (
                <p>Map is based on the address you see above.</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={handleToggleSaveClick}
                className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                  isSaved
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                <Heart
                  className="h-3.5 w-3.5 mr-1"
                  fill={isSaved ? "currentColor" : "none"}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecPill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
    {children}
  </span>
);

const AmenityTag = ({ active, children }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border " +
      (active
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white text-slate-500")
    }
  >
    {children}
  </span>
);
