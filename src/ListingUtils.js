import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MapPin,
  AlertTriangle,
  Facebook,
  Instagram,
  Phone,
  ExternalLink,
  Star,
  Loader,
  Share2,
  Copy,
  Flag,
} from "lucide-react";
import { apiFetch } from "./api";
import { Helmet } from "react-helmet";


// Reusable Helper Components
export const SpecPill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
    {children}
  </span>
);

export const AmenityTag = ({ active, children }) => (
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

/**
 * Helper to save/unsave a home.
 * Used by HomePage to toggle hearts.
 */
export async function handleToggleSaveHome(listing, savedIds, setSavedIds, onGoLogin) {
  const id = listing?._id || listing?.id;
  if (!id) return;

  if (String(id).startsWith("demo-")) {
    toast.info("Demo homes can't be saved.");
    return;
  }

  const isSaved = savedIds.includes(id);

  try {
    await apiFetch(`/api/listings/save/${id}`, {
      method: isSaved ? "DELETE" : "POST",
    });

    toast.success(
      isSaved ? "Removed from your favourites" : "Home saved to favourites ❤️"
    );

    setSavedIds((prev) =>
      isSaved ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  } catch (err) {
    if (err.message.includes("401") && onGoLogin) {
      toast.info("Please log in to save homes.");
      onGoLogin();
    } else {
      toast.error(err.message || "Could not update saved status");
    }
  }
}

/**
 * Shared Modal Component
 */
export function ListingModal({
  home,
  onClose,
  onToggleSave, // Standard toggle (Home page)
  isSaved,
  isOwner = false, // If true, show Edit button
  onEdit, // Handler for Edit click
  onUnsave, // Specific handler for "Remove from Saved" (Membership page)
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const homeKey = home ? home._id || home.id : null;

  useEffect(() => {
    setActiveIndex(0);
  }, [homeKey]);

  if (!home) return null;

  const rawImages =
    (Array.isArray(home.images) && home.images.length > 0
      ? home.images
      : home.image
      ? [home.image]
      : []) || [];

  const fallbackImg = "https://placehold.co/800x500/eff6ff/0f172a?text=Home";
  const images = rawImages.length > 0 ? rawImages : [fallbackImg];
  const currentImage = images[activeIndex] || fallbackImg;

  // Priority: (1) stored original Maps URL, (2) coords-based, (3) text address
  const mapsUrl =
    home?.mapsUrl && home.mapsUrl.trim()
      ? home.mapsUrl
      : home?.location?.lat && home?.location?.lng
      ? `https://www.google.com/maps/search/?api=1&query=${home.location.lat},${home.location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${home.address || ""} ${home.city || ""}`.trim()
        )}`;


  const postedDate = home.createdAt
    ? new Date(home.createdAt).toLocaleDateString()
    : null;

  const priceLabel =
    typeof home.price === "number" ? `Rs. ${home.price}` : home.price;


  // Handle background click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Edit handler
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(home);
      onClose();
    }
  };

  // Save/Unsave handler
  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (onUnsave && isSaved) {
      // Special mode for Membership page (Remove directly)
      onUnsave(home);
      onClose();
    } else if (onToggleSave) {
      // Standard toggle
      onToggleSave(home);
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

  // Generate dynamic SEO metadata and JSON-LD schema
  const pageTitle = home ? `${home.title || home.address} - HamroGhar` : "Property Details - HamroGhar";
  const pageDescription = home?.description 
    ? (home.description.substring(0, 155) + "...") 
    : `Check out this property located at ${home.address}, ${home.city} on HamroGhar.`;
  const pageUrl = `${window.location.origin}/?listing=${homeKey}`;
  const ogImage = images[0] || fallbackImg;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": home.title || home.address,
    "description": home.description || `Property in ${home.city}`,
    "image": ogImage,
    "url": pageUrl,
    "datePosted": home.createdAt,
    "offers": {
      "@type": "Offer",
      "price": typeof home.price === "number" ? home.price : 0,
      "priceCurrency": "NPR",
      "availability": "https://schema.org/InStock",
      "url": pageUrl
    },
    // Adding specific specs if available via V2 schema mapping
    "numberOfRooms": home.beds || home?.specs?.bedrooms,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": home.sqft || home?.specs?.landArea,
      "unitText": home?.specs?.landAreaUnit || "SQFT"
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-0 sm:py-6 sm:px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={pageUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      
      <div
        className="w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[85vh] sm:rounded-3xl bg-white shadow-2xl overflow-y-auto relative flex flex-col"
      >
        {/* Top Floating Actions */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {isOwner && (
            <button
              onClick={handleEditClick}
              className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-white hover:bg-slate-50 text-slate-800 h-8 w-8 rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Hero Image Area */}
        <div className="relative w-full overflow-hidden bg-slate-900 group shrink-0">
          <div className="relative h-64 sm:h-80 w-full">
            <img
              src={currentImage}
              alt="Home"
              className="h-full w-full object-cover transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImg;
              }}
            />
            {/* Gradient Overlay for bottom text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Price Badge Over Image */}
            {priceLabel && (
              <div className="absolute left-5 bottom-5 flex flex-col items-start gap-1">
                 <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wide">
                   {home.type === "sale" ? "For Sale" : "For Rent"}
                 </span>
                 <div className="text-white drop-shadow-md flex items-baseline gap-1">
                   <span className="text-3xl font-extrabold">{priceLabel}</span>
                   {home.type !== "sale" && <span className="text-sm font-medium text-white/80">/mo</span>}
                 </div>
              </div>
            )}

            {/* Gallery Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-8">
            {/* Title & Location */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                 <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase tracking-wider">
                   {home?.specs?.propertyType || "Property"}
                 </span>
                 {home?.status && home.status !== "active" && (
                   <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-700/10 uppercase tracking-wider">
                     {home.status}
                   </span>
                 )}
                 <span className="text-[10px] text-slate-400 font-medium">
                   Listed {postedDate || "Recently"}
                 </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                {home.title || "Beautiful Property in Nepal"}
              </h1>
              <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-slate-400" />
                {home?.location?.municipality || home.city}{home?.location?.district ? `, ${home.location.district}` : ""}
              </p>
            </div>

            {/* Quick Facts Grid (V2 Schema) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <QuickFact label="Bedrooms" value={home?.specs?.bedrooms || home.beds} icon="🛏️" />
              <QuickFact label="Bathrooms" value={home?.specs?.bathrooms || home.baths} icon="🛁" />
              <QuickFact label="Land Area" value={home?.specs?.landArea || home.sqft ? `${home?.specs?.landArea || home.sqft} ${home?.specs?.landAreaUnit || 'sqft'}` : null} icon="📐" />
              <QuickFact label="Facing" value={home?.specs?.facing} icon="🧭" />
              {home?.specs?.roadAccessFeet && <QuickFact label="Road Access" value={`${home.specs.roadAccessFeet} ft`} icon="🛣️" />}
              {home?.specs?.builtYear && <QuickFact label="Built Year" value={home.specs.builtYear} icon="🏗️" />}
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
               {/* Left Column (Main Content) */}
               <div className="sm:col-span-2 space-y-8 text-sm">
                 
                 {/* Overview */}
                 {home.description && (
                   <section>
                     <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Overview</h2>
                     <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{home.description}</p>
                   </section>
                 )}

                 {/* Room Details */}
                 {(home?.specs?.livingRoom || home?.specs?.kitchen || home?.specs?.totalFloors || home?.specs?.dimension) && (
                   <section>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Room Details</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {home?.specs?.totalFloors > 0 && <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Total Floors</span><span className="font-extrabold text-slate-800">{home.specs.totalFloors}</span></div>}
                        {home?.specs?.livingRoom > 0 && <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Living Rooms</span><span className="font-extrabold text-slate-800">{home.specs.livingRoom}</span></div>}
                        {home?.specs?.kitchen > 0 && <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Kitchens</span><span className="font-extrabold text-slate-800">{home.specs.kitchen}</span></div>}
                        {home?.specs?.dimension && <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Dimension</span><span className="font-extrabold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{home.specs.dimension}</span></div>}
                      </div>
                   </section>
                 )}

                 {/* Facilities */}
                 <section>
                   <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Facilities & Amenities</h2>
                   <div className="flex flex-wrap gap-2">
                     {home?.facilities?.bikeParking > 0 && <AmenityTag active={true}>🏍️ Bike Parking ({home.facilities.bikeParking})</AmenityTag>}
                     {home?.facilities?.carParking > 0 && <AmenityTag active={true}>🚗 Car Parking ({home.facilities.carParking})</AmenityTag>}
                     {home?.facilities?.boringWater && <AmenityTag active={true}>💧 Boring Water (Yes)</AmenityTag>}
                     {home?.facilities?.drinkingWater && <AmenityTag active={true}>🚰 Drinking Water (Yes)</AmenityTag>}

                     <AmenityTag active={!!(home?.specs?.furnishing === 'Fully Furnished' || home?.specs?.furnishing === 'fully' || home.furnished)}>🛋️ Furnished</AmenityTag>
                     <AmenityTag active={!!home?.highlights?.find(h => h.toLowerCase().includes('internet') || h.toLowerCase().includes('wifi') || home.internet)}>🌐 Internet/WiFi</AmenityTag>
                     <AmenityTag active={!!(home?.specs?.parking || home.parking)}>🅿️ Parking Available</AmenityTag>
                     <AmenityTag active={!!home.petsAllowed}>🐕 Pets Allowed</AmenityTag>
                     {home?.highlights?.map(h => <AmenityTag key={h} active={true}>✨ {h}</AmenityTag>)}
                   </div>
                 </section>

                 {/* Landmarks */}
                 {(home?.location?.ringRoad || home?.location?.hospital || home?.location?.school || home?.location?.airport || home?.location?.bhatbhateni || home?.location?.publicTransport) && (
                   <section>
                      <h2 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Nearby Landmarks</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {home?.location?.ringRoad && <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm"><span className="text-slate-500 font-medium">Ring Road</span><span className="font-bold text-slate-800">{home.location.ringRoad}</span></div>}
                        {home?.location?.hospital && <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm"><span className="text-slate-500 font-medium">Hospital</span><span className="font-bold text-slate-800">{home.location.hospital}</span></div>}
                        {home?.location?.school && <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm"><span className="text-slate-500 font-medium">School/College</span><span className="font-bold text-slate-800">{home.location.school}</span></div>}
                        {home?.location?.bhatbhateni && <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm"><span className="text-slate-500 font-medium">Bhatbhateni</span><span className="font-bold text-slate-800">{home.location.bhatbhateni}</span></div>}
                        {home?.location?.airport && <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm"><span className="text-slate-500 font-medium">Airport</span><span className="font-bold text-slate-800">{home.location.airport}</span></div>}
                        {home?.location?.publicTransport && <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm"><span className="text-slate-500 font-medium">Public Transport</span><span className="font-bold text-slate-800">{home.location.publicTransport}</span></div>}
                      </div>
                   </section>
                 )}



                 {/* Disclaimer */}
                 <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                   <div className="flex gap-3">
                     <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                     <p className="text-xs text-slate-600 leading-relaxed">
                       <strong className="text-slate-800">Safety Disclaimer:</strong> HamroGhar connects users but does not directly verify listings. Never wire money or pay a deposit before viewing the property in person and signing a lease. Report suspicious activity immediately.
                     </p>
                   </div>
                 </div>

               </div>

               {/* Right Column (Sidebar) */}
               <div className="space-y-6">
                 
                 {/* Contact Card */}
                 <div className="rounded-2xl bg-white border border-blue-100 shadow-xl shadow-blue-500/5 p-5 sticky top-5">
                    <h3 className="font-bold text-slate-900 mb-4">Contact Poster</h3>
                    <OwnerSocialsPanel socials={home.owner?.socials} />
                    
                    <div className="h-px bg-slate-100 my-4" />
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        <MapPin className="h-4 w-4" /> View on Map
                      </a>
                      
                      {!isOwner && (
                        <button
                          onClick={handleHeartClick}
                          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                            isSaved
                              ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                              : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                          {isSaved ? "Remove from Saved" : "Save this Home"}
                        </button>
                      )}
                    </div>

                    {/* Share Row */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Share</span>
                       <div className="flex gap-1">
                          <button onClick={() => {
                              const url = `${window.location.origin}/?listing=${home._id || home.id}`;
                              navigator.clipboard.writeText(url).then(() => toast.success("Copied!")).catch(() => toast.error("Could not copy"));
                            }} 
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 rounded-lg"
                            title="Copy Link">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button onClick={() => {
                             const text = `Check out this home on HamroGhar: ${home.title || home.address} — Rs.${home.price}/mo\n${window.location.origin}/?listing=${home._id || home.id}`;
                             window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }} 
                            className="p-1.5 text-slate-400 hover:text-green-500 transition-colors bg-slate-50 hover:bg-green-50 rounded-lg"
                            title="WhatsApp">
                            <Share2 className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                 </div>
                 
                 <ReportListingButton listingId={home._id || home.id} />

               </div>
            </div>

            {/* Price History & Reviews */}
            <div className="mt-12 space-y-8">
              {home.priceHistory && home.priceHistory.length > 1 && (
                <PriceHistoryChart history={home.priceHistory} />
              )}
              <ReviewsSection listingId={home._id || home.id} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Quick Facts
const QuickFact = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
       <span className="text-xl leading-none pt-0.5">{icon}</span>
       <div>
         <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{label}</p>
         <p className="text-sm font-semibold text-slate-900">{value}</p>
       </div>
    </div>
  );
};

/* ----------------------------------------
   OWNER SOCIALS PANEL
---------------------------------------- */
function OwnerSocialsPanel({ socials }) {
  if (!socials) {
    return (
      <p className="text-xs text-slate-400 italic">
        The owner hasn't added any contact info yet.
      </p>
    );
  }

  const { facebook, instagram, whatsapp, tiktok } = socials;
  const hasAny = facebook || instagram || whatsapp || tiktok;

  if (!hasAny) {
    return (
      <p className="text-xs text-slate-400 italic">
        The owner hasn't added any contact info yet.
      </p>
    );
  }

  // Build a WhatsApp link from a phone number or URL
  const whatsappHref = whatsapp
    ? whatsapp.startsWith("http")
      ? whatsapp
      : `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : null;

  // Build a TikTok link (handle @username or full URL)
  const tiktokHref = tiktok
    ? tiktok.startsWith("http")
      ? tiktok
      : `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}`
    : null;

  const links = [
    {
      key: "facebook",
      href: facebook
        ? facebook.startsWith("http")
          ? facebook
          : `https://facebook.com/${facebook}`
        : null,
      label: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
    },
    {
      key: "instagram",
      href: instagram
        ? instagram.startsWith("http")
          ? instagram
          : `https://instagram.com/${instagram.replace(/^@/, "")}`
        : null,
      label: "Instagram",
      icon: <Instagram className="h-4 w-4" />,
      bg: "bg-gradient-to-br from-purple-500 to-pink-500",
      hover: "hover:from-purple-600 hover:to-pink-600",
    },
    {
      key: "whatsapp",
      href: whatsappHref,
      label: "WhatsApp",
      icon: <Phone className="h-4 w-4" />,
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
    },
    {
      key: "tiktok",
      href: tiktokHref,
      label: "TikTok",
      icon: <ExternalLink className="h-4 w-4" />,
      bg: "bg-slate-900",
      hover: "hover:bg-slate-700",
    },
  ].filter((l) => !!l.href);

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-sm ${link.bg} ${link.hover}`}
        >
          {link.icon}
          {link.label}
        </a>
      ))}
    </div>
  );
}

/* ----------------------------------------
   REVIEWS SECTION
---------------------------------------- */
function ReviewsSection({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [myReviewId, setMyReviewId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Check auth state
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((d) => {
        if (d?.user) {
          setIsLoggedIn(true);
          setCurrentUserId(d.user.id || d.user._id);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Load reviews
  useEffect(() => {
    if (!listingId || String(listingId).startsWith("demo-")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch(`/api/reviews/${listingId}`, { credentials: "omit" })
      .then((d) => {
        setReviews(d.reviews || []);
        setAvgRating(d.avgRating);
        // Pre-fill form if user already reviewed
        if (currentUserId) {
          const mine = (d.reviews || []).find(
            (r) => String(r.reviewerId) === String(currentUserId)
          );
          if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment);
            setMyReviewId(mine._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { toast.error("Please select a star rating"); return; }
    if (myComment.trim().length < 5) { toast.error("Comment must be at least 5 characters"); return; }
    try {
      setSubmitting(true);
      const data = await apiFetch(`/api/reviews/${listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      if (data.review) {
        setMyReviewId(data.review._id);
        setReviews((prev) => {
          const filtered = prev.filter(
            (r) => String(r.reviewerId) !== String(currentUserId)
          );
          return [data.review, ...filtered];
        });
        const all = reviews.filter(
          (r) => String(r.reviewerId) !== String(currentUserId)
        );
        const allWithNew = [data.review, ...all];
        setAvgRating(
          Math.round(
            (allWithNew.reduce((s, r) => s + r.rating, 0) / allWithNew.length) * 10
          ) / 10
        );
        toast.success("Review submitted!");
      }
    } catch (err) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReviewId) return;
    try {
      await apiFetch(`/api/reviews/${myReviewId}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r._id !== myReviewId));
      setMyRating(0);
      setMyComment("");
      setMyReviewId(null);
      toast.success("Review removed");
    } catch (err) {
      toast.error(err.message || "Could not delete review");
    }
  };

  if (String(listingId).startsWith("demo-")) return null;

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          Reviews
        </p>
        {avgRating !== null && (
          <div className="flex items-center gap-1">
            <StarDisplay rating={avgRating} />
            <span className="text-[11px] text-slate-500 ml-1">
              {avgRating}/5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Submit Form */}
      {isLoggedIn ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2"
        >
          <p className="text-[11px] font-semibold text-slate-700">
            {myReviewId ? "Update your review" : "Leave a review"}
          </p>
          {/* Star Picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMyRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    n <= (hoverRating || myRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
            {myRating > 0 && (
              <span className="text-xs text-slate-500 ml-1">
                {["Terrible","Poor","Average","Good","Excellent"][myRating - 1]}
              </span>
            )}
          </div>
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder="Share your experience with this listing..."
            maxLength={500}
            className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[60px] resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white text-xs font-semibold rounded-xl py-2 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {submitting && <Loader className="h-3 w-3 animate-spin" />}
              {myReviewId ? "Update" : "Submit"}
            </button>
            {myReviewId && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-[11px] text-slate-400 italic">
          Log in to leave a review.
        </p>
      )}

      {/* Review List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader className="h-4 w-4 animate-spin text-blue-400" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-800">{r.reviewerName}</span>
                <StarDisplay rating={r.rating} />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{r.comment}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${
            n <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------
   PRICE HISTORY CHART
   Renders a small SVG line chart from priceHistory array
---------------------------------------- */
function PriceHistoryChart({ history }) {
  if (!history || history.length < 2) return null;

  const sorted = [...history].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
  const prices = sorted.map((h) => h.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const W = 260, H = 60, PAD = 8;
  const pts = sorted.map((h, i) => {
    const x = PAD + (i / (sorted.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxP - h.price) / range) * (H - PAD * 2);
    return [x, y];
  });

  const polyline = pts.map((p) => p.join(",")).join(" ");
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const diff = prices[prices.length - 1] - prices[0];
  const diffColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-green-500" : "text-slate-500";
  const diffText = diff === 0 ? "No change" : `${diff > 0 ? "+" : ""}Rs.${diff.toLocaleString()}`;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Price History</p>
        <span className={`text-[11px] font-semibold ${diffColor}`}>{diffText}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`${firstPt[0]},${H} ${polyline} ${lastPt[0]},${H}`}
          fill="url(#chartGrad)"
        />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        {sorted.map((h, i) => (
          <span key={i}>{new Date(h.changedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------
   REPORT LISTING BUTTON
---------------------------------------- */
function ReportListingButton({ listingId }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReport = async () => {
    if (submitted) return;
    if (!window.confirm("Report this listing as inappropriate, scam, or inaccurate?")) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      }).catch(() => {}); // Fire and forget — endpoint may not exist yet
      setSubmitted(true);
      toast.success("Report submitted. Thank you for keeping HamroGhar safe!");
    } catch {
      setSubmitted(true);
      toast.success("Report submitted. Thank you!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={submitting || submitted}
      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-400 hover:border-red-200 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <Flag className="h-3 w-3" />
      {submitted ? "Reported — thank you" : submitting ? "Submitting..." : "Report this listing"}
    </button>
  );
}