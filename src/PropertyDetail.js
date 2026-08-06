import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "./api";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import {
  MapPin, Share2, ChevronLeft, ChevronRight, X, Loader, Phone, CheckCircle2,
  AlertTriangle, Home, Ruler, Layers, Droplets, Wifi, Car, Bike, Grid, Maximize2, Tag, Building,
  MessageCircle, Mail, Facebook, Instagram, MessageSquare, Bed, Bath, Route, Compass,
  UtensilsCrossed, Sofa
} from "lucide-react";
import { useMeasurement } from "./contexts/MeasurementContext";
import VideoEmbed from "./components/VideoEmbed";
import { ListingCard } from "./components/home/FeaturedListings";
import useSWR from "swr";
import AdBanner from "./components/ads/AdBanner";
import ChatWidget from "./ChatWidget";
import PropertyLocationMap from "./components/common/PropertyLocationMap";
import { useScrollReveal } from "./hooks/useScrollReveal";

// Fades a section up into place as it enters the viewport while scrolling —
// content is present (and readable) in the DOM the whole time, this only
// adds motion on top per useScrollReveal's progressive-enhancement contract.
const Reveal = ({ children, className = "" }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
};

const MetricBox = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-white shadow-sm hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-1.5 mb-1 text-slate-500">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <span className="font-black text-slate-900 text-sm leading-tight">{value}</span>
    </div>
  );
};

const DetailRow = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2 text-slate-500">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const { formatPrice, formatArea } = useMeasurement();

  const swrFetcher = async (url) => {
    const res = await apiFetch(url, { credentials: "omit" });
    return res;
  };

  const { data: adsData } = useSWR("/api/ads/active", swrFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // Fetch main listing
    apiFetch(`/api/listings/${id}`)
      .then((data) => {
        setHome(data.listing || data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Property not found");
        setLoading(false);
      });

    // Fetch similar listings
    apiFetch(`/api/listings/${id}/similar`)
      .then((data) => setSimilarListings(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Could not load similar properties", err));

    // Who's logged in (needed to know who's sending chat messages)
    if (localStorage.getItem("token")) {
      apiFetch("/api/auth/me")
        .then((data) => setCurrentUser(data?.user || null))
        .catch(() => setCurrentUser(null));
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="w-10 h-10 animate-spin text-gold-700" /></div>;
  if (error || !home) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Property Not Found</h1>
      <p className="text-slate-500 mb-6">{error}</p>
      <button onClick={() => navigate("/")} className="px-6 py-3 bg-gold-500 text-white font-bold rounded-xl shadow-lg hover:bg-gold-600">Go Back Home</button>
    </div>
  );

  const images = home.images?.length ? home.images : ["https://placehold.co/800x500/eff6ff/0f172a?text=No+Photo"];
  const priceLabel = formatPrice(home.price);

  const isLand = home.propertyType === 'land';
  const isHouse = home.propertyType === 'house';
  const isApt = home.propertyType === 'apartment' || home.propertyType === 'flat';

  const specs = home.specs || {};
  const fac = home.facilities || {};
  const amenities = home.amenities || [];

  const locationDisplay = [
    home.location?.roadName,
    home.location?.tole,
    home.location?.nearestChowk ? `Near ${home.location.nearestChowk}` : '',
    home.location?.ward ? `Ward ${home.location.ward}` : '',
    home.location?.municipality || home.city,
    home.location?.district
  ].filter(Boolean).join(", ");

  const handleShare = async () => {
    const shareData = {
      title: `${home.title || "Property Listing"} - HamroGhar`,
      text: home.description?.substring(0, 100) + "...",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Share failed:", err.message);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Listing URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL.");
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800">
      <Helmet>
        <title>{home.title || "Property Listing"} - HamroGhar</title>
        <meta name="description" content={home.description?.substring(0, 150)} />

        {/* OpenGraph / Social Media SEO tags */}
        <meta property="og:title" content={`${home.title || "Property Listing"} - HamroGhar`} />
        <meta property="og:description" content={home.description?.substring(0, 150)} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${home.title || "Property Listing"} - HamroGhar`} />
        <meta name="twitter:description" content={home.description?.substring(0, 150)} />
        <meta name="twitter:image" content={images[0]} />
      </Helmet>

      {/* Top Navigation - Sticky Below Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 lg:top-20 z-30 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => location.key !== "default" ? navigate(-1) : navigate("/")} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-gold-700 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back to Search
          </button>
          <div className="flex gap-3">
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors active:scale-95">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Photo Gallery Grid */}
        {/* Desktop: 5-photo grid layout | Mobile: main photo + scrollable thumbnails */}
        <div className="relative mb-8">
          {/* Desktop grid */}
          <div className="hidden sm:flex h-[55vh] gap-2 rounded-3xl overflow-hidden group bg-slate-900 shadow-sm border border-slate-200/60">
            <div className="w-1/2 h-full relative cursor-pointer overflow-hidden" onClick={() => setLightboxIdx(0)}>
              <img src={images[0]} alt="Main" loading="eager" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 hover:opacity-95" />
            </div>
            <div className="flex w-1/2 h-full flex-col gap-2">
              <div className="flex h-1/2 gap-2">
                <div className="w-1/2 h-full overflow-hidden cursor-pointer" onClick={() => setLightboxIdx(Math.min(1, images.length - 1))}><img src={images[1] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 1" loading="lazy" /></div>
                <div className="w-1/2 h-full overflow-hidden cursor-pointer" onClick={() => setLightboxIdx(Math.min(2, images.length - 1))}><img src={images[2] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 2" loading="lazy" /></div>
              </div>
              <div className="flex h-1/2 gap-2">
                <div className="w-1/2 h-full overflow-hidden cursor-pointer" onClick={() => setLightboxIdx(Math.min(3, images.length - 1))}><img src={images[3] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 3" loading="lazy" /></div>
                <div className="w-1/2 h-full overflow-hidden cursor-pointer" onClick={() => setLightboxIdx(Math.min(4, images.length - 1))}><img src={images[4] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 4" loading="lazy" /></div>
              </div>
            </div>
            <button onClick={() => setLightboxIdx(0)} className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-sm text-slate-900 font-extrabold px-5 py-3 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all flex items-center gap-2">
              <Grid className="w-4 h-4" /> Show all {images.length} photos
            </button>
          </div>

          {/* Mobile: main image + scrollable thumbnails */}
          <div className="sm:hidden">
            <div className="h-[35vh] rounded-2xl overflow-hidden bg-slate-900 relative" onClick={() => setLightboxIdx(0)}>
              <img src={images[0]} alt="Main" className="w-full h-full object-cover" loading="eager" />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                1 / {images.length}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIdx(idx)}
                    className="shrink-0 h-16 w-20 rounded-xl overflow-hidden border-2 border-transparent hover:border-gold-300 transition-colors bg-slate-100"
                  >
                    <img src={img} alt={`Property view ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full-screen Lightbox */}
        {lightboxIdx !== null && (
          <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center animate-fade-in" onClick={() => setLightboxIdx(null)}>
            <button className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-white/10 rounded-full p-2" onClick={() => setLightboxIdx(null)}>
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
              <img
                key={lightboxIdx}
                src={images[lightboxIdx]}
                alt={`Property view ${lightboxIdx + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-xl animate-fade-in-up"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setLightboxIdx((lightboxIdx - 1 + images.length) % images.length)}
                    className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-md transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setLightboxIdx((lightboxIdx + 1) % images.length)}
                    className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-md transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            <div className="absolute bottom-6 text-white/80 text-sm font-bold">
              {lightboxIdx + 1} / {images.length}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          <div className="lg:col-span-2 space-y-10">

            {/* Header Content */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg ${home.type === 'sale' ? 'bg-blue-100 text-gold-800' : 'bg-rose-100 text-rose-800'}`}>
                  For {home.type === "sale" ? "Sale" : "Rent"}
                </span>
                <span className="bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  {home.propertyType}
                </span>
                {(home.isVerified || home.verificationStatus === 'verified') && (
                  <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-200" title={home.verificationNote || "Identity and documents verified by admin"}>
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                {home.title || `${home.propertyType.charAt(0).toUpperCase() + home.propertyType.slice(1)} in ${home.location?.municipality || 'Nepal'}`}
              </h1>
              <p className="text-slate-600 font-medium flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-gold-600" /> {locationDisplay}
                {home.location?.nearestLandmark && <span className="text-slate-400 bg-slate-100 px-2 rounded ml-2 text-sm">(Near {home.location.nearestLandmark})</span>}
              </p>
            </div>

            {/* Quick Facts Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {!isLand && <MetricBox label="Bedrooms" value={specs.bedrooms || home.beds} icon={<Bed className="h-4 w-4" />} />}
              {!isLand && <MetricBox label="Bathrooms" value={specs.bathrooms || home.baths} icon={<Bath className="h-4 w-4" />} />}
              <MetricBox label="Road Access" value={specs.roadAccess?.widthFeet ? `${specs.roadAccess.widthFeet} ft ${specs.roadAccess.type ? `(${specs.roadAccess.type})` : ''}` : null} icon={<Route className="h-4 w-4" />} />
              <MetricBox label="Facing" value={specs.facing} icon={<Compass className="h-4 w-4" />} />
              <MetricBox label="Land Area" value={formatArea(specs.landArea, specs.builtUpAreaSqFt || home.sqft)} icon={<Maximize2 className="h-4 w-4" />} />
              {!isLand && <MetricBox label="Kitchens" value={specs.kitchen} icon={<UtensilsCrossed className="h-4 w-4" />} />}
              {!isLand && <MetricBox label="Furnished" value={specs.furnishing || (home.furnished ? 'Fully' : 'No')} icon={<Sofa className="h-4 w-4" />} />}
              {isHouse && <MetricBox label="Floors" value={specs.totalFloors} icon={<Layers className="h-4 w-4" />} />}
            </div>

            <hr className="border-slate-200" />

            {/* In-depth Narrative */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5">About this property</h2>
              {home.highlights?.length > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200/60 p-5 rounded-2xl">
                  <h3 className="font-bold text-amber-900 mb-3 text-sm uppercase tracking-widest">Key Highlights</h3>
                  <ul className="space-y-2">
                    {home.highlights.map((h, i) => (
                      <li key={i} className="flex gap-3 items-start text-amber-950 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[16px] font-medium break-words overflow-hidden">
                {home.description}
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Detailed Specifications */}
            <Reveal>
              <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Maximize2 className="w-5 h-5 text-gold-700" /> Detailed Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-1">
                  <DetailRow label="Property Type" value={<span className="capitalize">{home.propertyType}</span>} icon={Home} />
                  <DetailRow label="Listing Purpose" value={<span className="capitalize">{home.type}</span>} icon={Tag} />
                  {specs.builtYear && <DetailRow label="Year Built" value={specs.builtYear} icon={Building} />}
                  {specs.builtUpAreaSqFt && <DetailRow label="Built Up Area" value={`${specs.builtUpAreaSqFt} Sq.Ft`} icon={Ruler} />}
                  {(isApt || home.propertyType === 'room') && specs.floorNumber && <DetailRow label="Floor Level" value={specs.floorNumber} icon={Layers} />}

                  {/* Room specifics if available */}
                  {specs.attachedBathrooms > 0 && <DetailRow label="Attached Bathrooms" value={specs.attachedBathrooms} icon={Tag} />}
                  {specs.commonBathrooms > 0 && <DetailRow label="Common Bathrooms" value={specs.commonBathrooms} icon={Tag} />}

                  {/* Parking Sub-section */}
                  {(specs.parking > 0 || fac.carParking > 0 || fac.bikeParking > 0 || home.parkingFeature) && (
                    <>
                      <DetailRow label="Car Parking" value={fac.carParking || specs.parking || (home.parkingFeature ? "Available" : "0")} icon={Car} />
                      <DetailRow label="Bike Parking" value={fac.bikeParking || "0"} icon={Bike} />
                    </>
                  )}
                </div>
              </section>
            </Reveal>

            {/* Utilities */}
            {!isLand && (
              <Reveal>
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Droplets className="w-5 h-5 text-gold-700" /> Utilities</h2>
                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-1">
                    <DetailRow label="Water Supply" value={specs.water?.available ? "Yes" : "No"} icon={Droplets} />
                    {specs.water?.source && <DetailRow label="Water Source" value={specs.water.source} />}
                    {specs.water?.drinkingWater && <DetailRow label="Drinking Water" value="Available" />}
                    {specs.water?.hotWater && <DetailRow label="Hot Water" value="Available" />}
                    {specs.water?.waterSupply247 && <DetailRow label="24/7 Water Supply" value="Yes" />}
                    {specs.water?.waterTank && <DetailRow label="Reserve Tank" value="Installed" />}
                    {specs.electricity && <DetailRow label="Electricity" value="Grid Connected" />}
                    <DetailRow label="Internet / WiFi" value={(specs.wifi?.available || home.internet) ? "Available" : "No"} icon={Wifi} />
                    {specs.wifi?.provider && <DetailRow label="ISP" value={specs.wifi.provider} />}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Nearby Facilities */}
            {Array.isArray(home.nearby) && home.nearby.length > 0 && (
              <Reveal className="mt-10">
                <section>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Facilities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 bg-slate-100/50 p-6 rounded-3xl border border-slate-200">
                    {home.nearby.map((n, i) => n.facility && n.distance ? (
                      <div key={i} className="flex flex-col border-b sm:border-b-0 border-slate-200/60 pb-2 sm:pb-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">{n.facility}</span>
                        <span className="text-sm font-extrabold text-slate-800">{n.distance}</span>
                      </div>
                    ) : null)}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Amenities Grid */}
            {amenities.length > 0 && (
              <Reveal className="mt-10">
                <section>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                    {amenities.map((a, i) => (
                      <div
                        key={a}
                        className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-100 p-3 rounded-xl border border-slate-200 hover:border-gold-200 hover:bg-gold-50 transition-colors animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {a}
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Video Tour Section */}
            {home.videoUrl && (
              <Reveal className="mt-10">
                <section>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">Video Walkthrough</h2>
                  <VideoEmbed url={home.videoUrl} />
                </section>
              </Reveal>
            )}

            {/* House Rules & Policies */}
            {home.houseRules && (Object.values(home.houseRules).some(val => val !== false && val !== undefined && val !== "")) && (
              <Reveal className="mt-10">
                <section>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">House Rules</h2>
                  <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    {home.houseRules.petsAllowed !== undefined && (
                      <div className="flex items-center justify-between border-b sm:border-b-0 border-slate-200/60 pb-3 sm:pb-0">
                        <span className="text-sm font-bold text-slate-600">Pets</span>
                        <span className={`text-sm font-black ${home.houseRules.petsAllowed ? 'text-emerald-600' : 'text-rose-500'}`}>{home.houseRules.petsAllowed ? 'Allowed' : 'Not Allowed'}</span>
                      </div>
                    )}
                    {home.houseRules.smokingAllowed !== undefined && (
                      <div className="flex items-center justify-between border-b sm:border-b-0 border-slate-200/60 pb-3 sm:pb-0">
                        <span className="text-sm font-bold text-slate-600">Smoking</span>
                        <span className={`text-sm font-black ${home.houseRules.smokingAllowed ? 'text-emerald-600' : 'text-rose-500'}`}>{home.houseRules.smokingAllowed ? 'Allowed' : 'Not Allowed'}</span>
                      </div>
                    )}
                    {home.houseRules.partiesAllowed !== undefined && (
                      <div className="flex items-center justify-between border-b sm:border-b-0 border-slate-200/60 pb-3 sm:pb-0">
                        <span className="text-sm font-bold text-slate-600">Parties/Events</span>
                        <span className={`text-sm font-black ${home.houseRules.partiesAllowed ? 'text-emerald-600' : 'text-rose-500'}`}>{home.houseRules.partiesAllowed ? 'Allowed' : 'Not Allowed'}</span>
                      </div>
                    )}
                    {home.houseRules.shoesOff !== undefined && (
                      <div className="flex items-center justify-between border-b sm:border-b-0 border-slate-200/60 pb-3 sm:pb-0">
                        <span className="text-sm font-bold text-slate-600">Shoes Indoors</span>
                        <span className={`text-sm font-black ${home.houseRules.shoesOff ? 'text-rose-500' : 'text-slate-500'}`}>{home.houseRules.shoesOff ? 'Must Take Off' : 'Optional'}</span>
                      </div>
                    )}
                    {home.houseRules.guestsLimit > 0 && (
                      <div className="flex items-center justify-between border-b sm:border-b-0 border-slate-200/60 pb-3 sm:pb-0">
                        <span className="text-sm font-bold text-slate-600">Max Guests</span>
                        <span className="text-sm font-black text-slate-800">{home.houseRules.guestsLimit} People</span>
                      </div>
                    )}
                    {(home.houseRules.quietHoursStart || home.houseRules.quietHoursEnd) && (
                      <div className="flex items-center justify-between border-b sm:border-b-0 border-slate-200/60 pb-3 sm:pb-0">
                        <span className="text-sm font-bold text-slate-600">Quiet Hours</span>
                        <span className="text-sm font-black text-slate-800">{home.houseRules.quietHoursStart || '?'} - {home.houseRules.quietHoursEnd || '?'}</span>
                      </div>
                    )}
                  </div>
                </section>
              </Reveal>
            )}

            {/* Location */}
            <Reveal className="mt-10">
              <section>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-5">Location & Map</h2>
                <PropertyLocationMap home={home} />
              </section>
            </Reveal>

            {/* Similar Properties Nearby */}
            {similarListings.length > 0 && (
              <Reveal className="mt-16 pt-10 border-t-2 border-slate-100">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-900">Similar Properties Nearby</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {similarListings.map(listing => (
                      <ListingCard
                        key={listing._id}
                        home={listing}
                        onToggleSave={() => { }} // Disabled in this view for simplicity
                        onOpenHome={() => navigate(`/property/${listing._id}`)}
                        isSaved={false}
                        isVirtualized={true}
                      />
                    ))}
                  </div>
                </section>
              </Reveal>
            )}
          </div>

          {/* Details Sidebar Sticky */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-200 p-7">
                <div className="mb-8">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Asking Price</p>
                  <div className="flex items-baseline gap-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{priceLabel}</h2>
                    {home.type === "rent" && <span className="text-slate-500 font-bold text-lg">/mo</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {home.contact?.phone && (
                    <a href={`tel:${home.contact.phone}`} className="w-full bg-gold-500 hover:bg-gold-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 transform active:scale-95 text-lg">
                      <Phone className="w-5 h-5" /> Call: {home.contact.phone}
                    </a>
                  )}

                  {home.contact?.whatsapp && (
                    <a href={`https://wa.me/${home.contact.whatsapp.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noreferrer" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-95 text-lg">
                      <MessageCircle className="w-5 h-5" /> WhatsApp Owner
                    </a>
                  )}

                  {home.owner && currentUser && String(currentUser.id || currentUser._id) !== String(home.owner._id || home.owner.id) && (
                    <button
                      type="button"
                      onClick={() => setChatOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transform active:scale-95 text-lg"
                    >
                      <MessageSquare className="w-5 h-5" /> Message Owner
                    </button>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {home.contact?.email ? (
                      <a href={`mailto:${home.contact.email}`} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-slate-200">
                        <Mail className="w-4 h-4" /> Email
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 font-bold py-3 rounded-xl text-sm border-2 border-slate-100 line-through">
                        <Mail className="w-4 h-4" /> Email
                      </div>
                    )}

                    {home.contact?.facebook ? (
                      <a href={home.contact.facebook.startsWith('http') ? home.contact.facebook : `https://${home.contact.facebook}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-blue-50 text-gold-700 hover:bg-blue-100 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-blue-200 overflow-hidden px-2">
                        <Facebook className="w-4 h-4 shrink-0" /> <span className="truncate">Facebook</span>
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 font-bold py-3 rounded-xl text-sm border-2 border-slate-100 line-through">
                        <Facebook className="w-4 h-4" /> Facebook
                      </div>
                    )}

                    {home.contact?.instagram ? (
                      <a href={home.contact.instagram.startsWith('http') ? home.contact.instagram : `https://instagram.com/${home.contact.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-pink-50 text-pink-700 hover:bg-pink-100 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-pink-200 overflow-hidden px-2">
                        <Instagram className="w-4 h-4 shrink-0" /> <span className="truncate">Instagram</span>
                      </a>
                    ) : (
                      <div className="hidden sm:flex items-center justify-center gap-2 bg-slate-50 text-slate-400 font-bold py-3 rounded-xl text-sm border-2 border-slate-100 line-through">
                        <Instagram className="w-4 h-4" /> Insta
                      </div>
                    )}
                  </div>
                </div>

                {home.owner && (
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-gold-700 font-black text-xl border-2 border-white shadow-sm">
                      {home.owner.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-lg">{home.owner.name || "HamroGhar User"}</p>
                      <p className="text-xs font-bold text-slate-500 mb-2">Member • Verified</p>
                      <button onClick={() => navigate(`/?owner=${home.owner._id || home.owner.id}`)} className="text-xs font-bold text-gold-700 hover:text-gold-800 transition-colors underline decoration-2 underline-offset-2">
                        View all listings by {home.owner.name?.split(' ')[0] || "this host"}
                      </button>
                    </div>
                  </div>
                )}

                {(!home.contact?.phone && !home.contact?.email && !home.contact?.whatsapp && !home.contact?.facebook && !home.contact?.instagram) && (
                  <div className="mt-4 flex items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                    <span className="text-sm font-bold text-slate-500">No public contact info provided.</span>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t-2 border-slate-100 flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    <strong className="text-slate-900">Safety Tip:</strong> Never transfer funds before verifying the property and identity in person. We do not intermediate payments.
                  </p>
                </div>

                <div className="mt-6 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">
                  <span>{home.views} Views</span>
                  <span>Posted {new Date(home.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Sticky Sidebar Ad Placement */}
              {adsData?.sidebar && adsData.sidebar.length > 0 && (
                <AdBanner ad={adsData.sidebar[0]} className="h-96 w-full shadow-lg" />
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Price</p>
          <p className="text-xl font-black text-slate-900 tracking-tight">{priceLabel} <span className="text-sm font-bold text-slate-500">{home.type === 'rent' && '/mo'}</span></p>
        </div>
        <div className="flex gap-2">
          {home.owner && currentUser && String(currentUser.id || currentUser._id) !== String(home.owner._id || home.owner.id) && (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Message owner"
              className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-95 font-black h-12 w-12 rounded-xl flex items-center justify-center transition-transform"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
          {home.contact?.whatsapp && (
            <a href={`https://wa.me/${home.contact.whatsapp.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 active:scale-95 font-black h-12 w-12 rounded-xl flex items-center justify-center transition-transform">
              <MessageCircle className="w-5 h-5" />
            </a>
          )}
          {home.contact?.email && (
            <a href={`mailto:${home.contact.email}`} className="bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 active:scale-95 font-black h-12 w-12 rounded-xl flex items-center justify-center transition-transform">
              <Mail className="w-5 h-5" />
            </a>
          )}
          {home.contact?.facebook && (
            <a href={home.contact.facebook.startsWith('http') ? home.contact.facebook : `https://${home.contact.facebook}`} target="_blank" rel="noreferrer" className="bg-blue-50 text-gold-700 border border-blue-200 hover:bg-blue-100 active:scale-95 font-black h-12 w-12 rounded-xl flex items-center justify-center transition-transform">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {home.contact?.instagram && (
            <a href={home.contact.instagram.startsWith('http') ? home.contact.instagram : `https://instagram.com/${home.contact.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 active:scale-95 font-black h-12 w-12 rounded-xl flex items-center justify-center transition-transform">
              <Instagram className="w-5 h-5" />
            </a>
          )}

          {home.contact?.phone ? (
            <a href={`tel:${home.contact.phone}`} className="grow bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-black px-4 h-12 rounded-xl shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 transition-transform">
              <Phone className="w-5 h-5" /> Call
            </a>
          ) : (
            (!home.contact?.whatsapp && !home.contact?.email && !home.contact?.facebook && !home.contact?.instagram) && (
              <button disabled className="bg-slate-200 text-slate-500 font-extrabold px-6 h-12 rounded-xl flex items-center gap-2 cursor-not-allowed">
                No Contact info
              </button>
            )
          )}
        </div>
      </div>

      {home.owner && (
        <ChatWidget
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUser={currentUser}
          receiver={home.owner}
        />
      )}

    </div>
  );
}
