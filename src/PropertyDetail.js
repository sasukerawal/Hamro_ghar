import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { Helmet } from "react-helmet";
import {
  MapPin, Heart, Share2, ChevronLeft, Loader, Phone, CheckCircle2,
  AlertTriangle, Home, Ruler, Compass, Layers, Droplets, Wifi, Car, Bike, Grid, Maximize2
} from "lucide-react";
import { toast } from "react-toastify";
import { useMeasurement } from "./contexts/MeasurementContext";

const MetricBox = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col border border-slate-200 rounded-xl p-3 bg-white shadow-sm hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-1.5 mb-1 text-slate-500">
        <span className="text-lg">{icon}</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatPrice, formatArea } = useMeasurement();

  useEffect(() => {
    window.scrollTo(0, 0);
    apiFetch(`/api/listings/${id}`)
      .then((data) => {
        setHome(data.listing || data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Property not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (error || !home) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Property Not Found</h1>
      <p className="text-slate-500 mb-6">{error}</p>
      <button onClick={() => navigate("/")} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700">Go Back Home</button>
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
    home.location?.tole, 
    home.location?.ward ? `Ward ${home.location.ward}` : '',
    home.location?.municipality || home.city,
    home.location?.district
  ].filter(Boolean).join(", ");

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800">
      <Helmet>
        <title>{home.title || "Property Listing"} - HamroGhar</title>
        <meta name="description" content={home.description?.substring(0, 150)} />
      </Helmet>

      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back to Search
          </button>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-4 py-2 rounded-xl transition-colors">
              <Heart className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Photo Gallery Grid */}
        <div className="h-[40vh] sm:h-[55vh] flex gap-2 rounded-3xl overflow-hidden mb-8 group relative bg-slate-900 shadow-sm border border-slate-200/60">
           <div className="w-full sm:w-1/2 h-full relative cursor-pointer overflow-hidden">
              <img src={images[0]} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 hover:opacity-95" />
           </div>
           <div className="hidden sm:flex w-1/2 h-full flex-col gap-2">
              <div className="flex h-1/2 gap-2">
                 <div className="w-1/2 h-full overflow-hidden cursor-pointer"><img src={images[1] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 1" /></div>
                 <div className="w-1/2 h-full overflow-hidden cursor-pointer"><img src={images[2] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 2" /></div>
              </div>
              <div className="flex h-1/2 gap-2">
                 <div className="w-1/2 h-full overflow-hidden cursor-pointer"><img src={images[3] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 3" /></div>
                 <div className="w-1/2 h-full overflow-hidden cursor-pointer"><img src={images[4] || images[0]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Gallery 4" /></div>
              </div>
           </div>
           <button className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-sm text-slate-900 font-extrabold px-5 py-3 rounded-2xl shadow-xl hover:bg-white hover:scale-105 transition-all flex items-center gap-2">
             <Grid className="w-4 h-4" /> Show all {images.length} photos
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header Content */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg ${home.type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                   For {home.type === "sale" ? "Sale" : "Rent"}
                 </span>
                 <span className="bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg">
                   {home.propertyType}
                 </span>
                 {home.isVerified && (
                   <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-200">
                     <CheckCircle2 className="w-4 h-4" /> Verified
                   </span>
                 )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                {home.title || `${home.propertyType.charAt(0).toUpperCase() + home.propertyType.slice(1)} in ${home.location?.municipality || 'Nepal'}`}
              </h1>
              <p className="text-slate-600 font-medium flex items-center gap-2 text-lg">
                 <MapPin className="w-5 h-5 text-rose-500" /> {locationDisplay}
                 {home.location?.nearestLandmark && <span className="text-slate-400 bg-slate-100 px-2 rounded ml-2 text-sm">(Near {home.location.nearestLandmark})</span>}
              </p>
            </div>

            {/* Quick Facts Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {!isLand && <MetricBox label="Bedrooms" value={specs.bedrooms || home.beds} icon="🛏️" />}
              {!isLand && <MetricBox label="Bathrooms" value={specs.bathrooms || home.baths} icon="🛁" />}
              <MetricBox label="Road Access" value={specs.roadAccess?.widthFeet ? `${specs.roadAccess.widthFeet} ft ${specs.roadAccess.type ? `(${specs.roadAccess.type})` : ''}` : null} icon="🛣️" />
              <MetricBox label="Facing" value={specs.facing} icon="🧭" />
              <MetricBox label="Land Area" value={formatArea(specs.landArea, specs.builtUpAreaSqFt || home.sqft)} icon="📐" />
              {!isLand && <MetricBox label="Kitchens" value={specs.kitchen} icon="🍳" />}
              {!isLand && <MetricBox label="Furnished" value={specs.furnishing || (home.furnished ? 'Fully' : 'No')} icon="🛋️" />}
              {isHouse && <MetricBox label="Floors" value={specs.totalFloors} icon="🏢" />}
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
                       <li key={i} className="flex gap-3 text-amber-950 font-medium"><span className="text-amber-500 font-bold">✓</span> {h}</li>
                     ))}
                   </ul>
                </div>
              )}
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[16px] font-medium">
                {home.description}
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Detailed Specifications */}
            <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Maximize2 className="w-5 h-5 text-blue-600" /> Detailed Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-1">
                 <DetailRow label="Property Type" value={<span className="capitalize">{home.propertyType}</span>} icon={Home} />
                 <DetailRow label="Listing Purpose" value={<span className="capitalize">{home.type}</span>} icon={Tag} />
                 {specs.builtYear && <DetailRow label="Year Built" value={specs.builtYear} icon={Building} />}
                 {specs.builtUpAreaSqFt && <DetailRow label="Built Up Area" value={`${specs.builtUpAreaSqFt} Sq.Ft`} icon={Ruler} />}
                 {(isApt || home.propertyType === 'room') && specs.floorNumber && <DetailRow label="Floor Level" value={specs.floorNumber} icon={Layers} />}
                 
                 {/* Parking Sub-section */}
                 {(specs.parking > 0 || fac.carParking > 0 || fac.bikeParking > 0 || home.parkingFeature) && (
                   <>
                     <DetailRow label="Car Parking" value={fac.carParking || specs.parking || (home.parkingFeature ? "Available" : "0")} icon={Car} />
                     <DetailRow label="Bike Parking" value={fac.bikeParking || "0"} icon={Bike} />
                   </>
                 )}
              </div>
            </section>

            {/* Utilities */}
            {!isLand && (
              <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-600" /> Utilities</h2>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-1">
                   <DetailRow label="Water Supply" value={specs.water?.available ? "Yes" : "No"} icon={Droplets} />
                   {specs.water?.source && <DetailRow label="Water Source" value={specs.water.source} />}
                   {specs.water?.drinkingWater && <DetailRow label="Drinking Water" value="Available" />}
                   {specs.water?.hotWater && <DetailRow label="Hot Water" value="Available" />}
                   <DetailRow label="Internet / WiFi" value={(specs.wifi?.available || home.internet) ? "Available" : "No"} icon={Wifi} />
                   {specs.wifi?.provider && <DetailRow label="ISP" value={specs.wifi.provider} />}
                </div>
              </section>
            )}

            {/* Nearby Facilities */}
            {Array.isArray(home.nearby) && home.nearby.length > 0 && (
              <section className="mt-10">
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
            )}

            {/* Amenities Grid */}
            {amenities.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                  {amenities.map(a => (
                    <div key={a} className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {a}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-5">Location & Map</h2>
              {home.mapsUrl ? (
                <div className="bg-slate-100 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                  <MapPin className="w-10 h-10 text-rose-500 mb-3" />
                  <p className="font-bold text-slate-700 mb-4">The owner has provided a direct Google Maps link.</p>
                  <a href={home.mapsUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all">
                    Open in Google Maps
                  </a>
                </div>
              ) : (
                <div className="h-64 bg-slate-200 rounded-3xl flex items-center justify-center text-slate-500 font-bold border-2 border-dashed border-slate-300">
                  Approximate Location Area
                </div>
              )}
            </section>
          </div>

          {/* Details Sidebar Sticky */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-200 p-7">
              <div className="mb-8">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Asking Price</p>
                 <div className="flex items-baseline gap-1">
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">{priceLabel}</h2>
                   {home.type === "rent" && <span className="text-slate-500 font-bold text-lg">/mo</span>}
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform active:scale-95 text-lg">
                  <Phone className="w-5 h-5" /> Contact Owner
                </button>
                <div className="flex gap-3">
                   <button className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-emerald-200">
                     WhatsApp
                   </button>
                   <button className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold py-3 rounded-xl text-sm transition-colors border-2 border-slate-200">
                     Schedule Visit
                   </button>
                </div>
              </div>

              {home.owner && (
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                   <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-black text-xl border-2 border-white shadow-sm">
                     {home.owner.name?.charAt(0) || "U"}
                   </div>
                   <div>
                     <p className="font-extrabold text-slate-900 text-lg">{home.owner.name || "HamroGhar User"}</p>
                     <p className="text-xs font-bold text-slate-500">Member • Verified Phone</p>
                   </div>
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
          </div>

        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
         <div>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Price</p>
           <p className="text-xl font-black text-slate-900 tracking-tight">{priceLabel} <span className="text-sm font-bold text-slate-500">{home.type==='rent'&&'/mo'}</span></p>
         </div>
         <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-transform">
            <Phone className="w-5 h-5" /> Call Owner
         </button>
      </div>

    </div>
  );
}
