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
  const [savedIds, setSavedIds] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load listings from backend
  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoadingListings(true);
        const res = await fetch("http://localhost:4000/api/listings/all");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.listings) && data.listings.length > 0) {
          setListings(data.listings);
        }
      } catch (err) {
        console.error("Error loading listings", err);
      } finally {
        setLoadingListings(false);
      }
    };

    loadListings();
  }, []);

  // Load saved homes ONCE so hearts reflect real saved state
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
          const ids = data.saved.map((h) => h._id);
          setSavedIds(ids);
        }
      } catch (err) {
        console.error("Error loading saved homes for hearts", err);
      }
    };

    loadSaved();
  }, []);

  const openHomeModal = (home) => {
    setSelectedHome(home);
    setIsModalOpen(true);
  };

  const closeHomeModal = () => {
    setSelectedHome(null);
    setIsModalOpen(false);
  };

  // ❤️ TOGGLE save / unsave
  const handleToggleSaveHome = async (listingId) => {
    if (!listingId) {
      toast.error("Listing ID missing");
      return;
    }

    // demo cards can't actually be saved to backend
    if (String(listingId).startsWith("demo-")) {
      toast.info("Demo homes can't be saved. Post a real home to save it.");
      return;
    }

    const isAlreadySaved = savedIds.includes(listingId);
    const method = isAlreadySaved ? "DELETE" : "POST";

    try {
      const res = await fetch(
        `http://localhost:4000/api/listings/save/${listingId}`,
        {
          method,
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
        toast.error(data.error || "Could not update favourites");
        return;
      }

      if (isAlreadySaved) {
        toast.info("Removed from your favourites");
        setSavedIds((prev) => prev.filter((id) => id !== listingId));
      } else {
        toast.success("Home saved to your favourites ❤️");
        setSavedIds((prev) =>
          prev.includes(listingId) ? prev : [...prev, listingId]
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating favourites");
    }
  };

  return (
    <>
      <HeroSection onGoLogin={onGoLogin} />
      <HighlightStrip />
      <FeaturedListings
        listings={listings}
        loading={loadingListings}
        onToggleSaveHome={handleToggleSaveHome}
        onOpenHome={openHomeModal}
        savedIds={savedIds}
      />
      <Testimonials />
      <CallToAction
        onGoRegister={onGoRegister}
        onGoMembership={onGoMembership}
      />

      {isModalOpen && (
        <ListingModal home={selectedHome} onClose={closeHomeModal} />
      )}
    </>
  );
}

// ───────────────── Hero section ─────────────────

const HeroSection = ({ onGoLogin }) => {
  const [query, setQuery] = useState("");

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
            Search blue &amp; white modern homes, cozy apartments, and family
            spaces across the city in just a few clicks.
          </p>

          <div className="mt-6 rounded-2xl bg-white shadow-lg border border-blue-50 p-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
              <MapPin className="h-4 w-4 text-blue-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter area, city, or postcode"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
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

        <HeroStatsCard />
      </div>
    </section>
  );
};

const HeroStatsCard = () => (
  <div className="relative">
    <div className="relative rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-12 h-32 w-32 rounded-full bg-white/10" />

      <p className="text-xs uppercase tracking-[0.2em] text-blue-100 mb-2">
        Live listings
      </p>
      <p className="text-3xl font-bold mb-1">12,430</p>
      <p className="text-xs text-blue-100 mb-6">
        properties available right now
      </p>

      <div className="space-y-3 text-xs">
        <HeroStat label="Average response time" value="15 min" />
        <HeroStat label="Homes viewed per user" value="9+" />
        <HeroStat label="Cities covered" value="32" />
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

// ───────────── Featured listings (with Save) ─────────────

const FeaturedListings = ({
  listings,
  loading,
  onToggleSaveHome,
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
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Loading listings…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((home) => (
            <ListingCard
              key={home._id || home.id}
              home={home}
              onToggleSaveHome={onToggleSaveHome}
              onOpenHome={onOpenHome}
              isSaved={savedIds.includes(home._id || home.id)}
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

const ListingCard = ({ home, onToggleSaveHome, onOpenHome, isSaved }) => {
  const handleClickSave = (e) => {
    e.stopPropagation();
    onToggleSaveHome(home._id || home.id);
  };

  const imageSrc =
    home?.images?.[0] ||
    home?.image ||
    "https://placehold.co/600x400/eff6ff/0f172a?text=Home";

  return (
    <div
      className="group rounded-2xl border border-blue-50 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => onOpenHome(home)}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={home.address || home.title || "Home"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x400/eff6ff/0f172a?text=Home";
          }}
        />
        <button
          type="button"
          onClick={handleClickSave}
          className={
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors " +
            (isSaved
              ? "bg-red-500 text-white"
              : "bg-white/90 text-slate-700 hover:bg-blue-50")
          }
        >
          <Heart className={"h-4 w-4 " + (isSaved ? "fill-current" : "")} />
        </button>
        <span className="absolute left-3 bottom-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
          {home.price}
        </span>
      </div>
      <div className="p-3.5 space-y-2">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {home.address}
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
      </div>
    </div>
  );
};

// ───────────── Modal for listing details ─────────────

const ListingModal = ({ home, onClose }) => {
  if (!home) return null;

  const imageSrc =
    home?.images?.[0] ||
    home?.image ||
    "https://placehold.co/800x500/eff6ff/0f172a?text=Home";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Top image */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={imageSrc}
            alt={home.title || home.address || "Home"}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/800x500/eff6ff/0f172a?text=Home";
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
            </div>
          </div>

          {/* Pills for core specs */}
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

          {/* Location / map */}
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700 mb-0.5">Location</p>
              {home.location?.lat && home.location?.lng ? (
                <p>
                  Lat: {home.location.lat.toFixed(4)}, Lng:{" "}
                  {home.location.lng.toFixed(4)}
                </p>
              ) : (
                <p>Map location based on address.</p>
              )}
            </div>
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

// ───────────── Testimonials & CTA ─────────────

const Testimonials = () => (
  <section className="bg-white py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items.end justify-between gap-4 mb-6">
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
          className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500/40"
        >
          View member dashboard
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);
