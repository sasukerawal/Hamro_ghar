// src/ListingMapView.js
// District-wise choropleth map for Nepal listings
// Instead of individual pins, districts are colour-coded by listing density.
// Clicking a district opens a sidebar panel with its listings.
import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Nepal districts GeoJSON ────────────────────────────────────────────────
// Lightweight district polygons hosted on CDN. Loaded at runtime to keep
// bundle size small. Fallback to pin mode if load fails.
const NEPAL_DISTRICTS_GEOJSON_URL =
  "https://raw.githubusercontent.com/mesaugat/gis-nepal/master/districts.geojson";

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Normalise a district name so "Kathmandu" == "kathmandu" etc.
const normalise = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Given a listing, return the district string we'll use as the key.
function getDistrict(listing) {
  return (
    listing?.location?.district ||
    listing?.city ||
    listing?.address ||
    ""
  );
}

// Pick a colour based on number of listings in a district.
function districtColour(count) {
  if (count === 0) return "#e2e8f0";   // slate-200  — no listings
  if (count <= 2) return "#bfdbfe";   // blue-200
  if (count <= 5) return "#93c5fd";   // blue-300
  if (count <= 10) return "#60a5fa";   // blue-400
  if (count <= 20) return "#3b82f6";   // blue-500
  return "#1d4ed8";                    // blue-700 — hottest district
}

// ─── Custom price pill icon ───────────────────────────────────────────────────
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ─── Sidebar listing card ─────────────────────────────────────────────────────
function SidebarCard({ listing, onClick }) {
  const img =
    listing.images?.[0] ||
    listing.image ||
    "https://placehold.co/160x90/eff6ff/0f172a?text=Home";

  return (
    <button
      type="button"
      onClick={() => onClick(listing)}
      className="w-full text-left group flex gap-3 p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all"
    >
      <img
        src={img}
        alt={listing.title}
        className="h-16 w-24 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
        onError={(e) => { e.target.src = "https://placehold.co/160x90/eff6ff/0f172a?text=Home"; }}
      />
      <div className="overflow-hidden">
        <p className="text-xs font-bold text-slate-900 line-clamp-1">
          {listing.title || listing.address || "Property"}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {listing?.location?.municipality || listing.city || "—"}
        </p>
        <p className="mt-1 text-xs font-semibold text-blue-600">
          Rs. {Number(listing.price || 0).toLocaleString()}
          {listing.type !== "sale" && <span className="text-[10px] text-blue-400">/mo</span>}
        </p>
      </div>
    </button>
  );
}

// ─── District sidebar panel ───────────────────────────────────────────────────
function DistrictPanel({ districtName, listings, onClose, onSelectListing }) {
  if (!districtName) return null;
  return (
    <div className="absolute top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-md border-l border-blue-100 z-[800] flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest">District</p>
          <h3 className="text-sm font-bold text-slate-900">{districtName}</h3>
          <p className="text-[11px] text-slate-500">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {listings.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No listings in this district yet.</p>
        ) : (
          listings.map((l) => (
            <SidebarCard key={l._id || l.id} listing={l} onClick={onSelectListing} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ListingMapView({ listings = [], onSelectListing }) {
  const [geoData, setGeoData] = React.useState(null);
  const [geoError, setGeoError] = React.useState(false);
  const [activeDistrict, setActiveDistrict] = React.useState(null);

  // Load GeoJSON once on mount
  React.useEffect(() => {
    fetch(NEPAL_DISTRICTS_GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => setGeoData(data))
      .catch(() => setGeoError(true));
  }, []);

  // Group listings by normalised district name
  const districtMap = useMemo(() => {
    const map = {};
    listings.forEach((l) => {
      const d = normalise(getDistrict(l));
      if (!d) return;
      if (!map[d]) map[d] = [];
      map[d].push(l);
    });
    return map;
  }, [listings]);

  // Listings for the active (clicked) district
  const activeListings = useMemo(() => {
    if (!activeDistrict) return [];
    return districtMap[normalise(activeDistrict)] || [];
  }, [activeDistrict, districtMap]);

  // GeoJSON style function
  const styleDistrict = (feature) => {
    const name = normalise(feature.properties?.DISTRICT || "");
    const count = districtMap[name]?.length || 0;
    const isActive = normalise(activeDistrict || "") === name;
    return {
      fillColor: districtColour(count),
      fillOpacity: count > 0 ? 0.78 : 0.25,
      color: isActive ? "#1d4ed8" : "#94a3b8",
      weight: isActive ? 2.5 : 0.8,
    };
  };

  // Interaction handlers on each district polygon
  const onEachDistrict = (feature, layer) => {
    const name = feature.properties?.DISTRICT || "Unknown";

    layer.on({
      mouseover(e) {
        e.target.setStyle({ fillOpacity: 0.92, weight: 2, color: "#1d4ed8" });
        e.target.bringToFront();
      },
      mouseout(e) {
        e.target.setStyle(styleDistrict(feature));
      },
      click() {
        setActiveDistrict(name);
      },
    });
  };

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-blue-100 shadow-xl">
      {/* Colour legend */}
      <div className="absolute bottom-6 left-4 z-[700] glass rounded-xl px-3 py-2 text-[10px] font-semibold text-slate-600 flex items-center gap-3 shadow-md">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#e2e8f0] inline-block border border-slate-300" />None</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#bfdbfe] inline-block" />1-2</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#60a5fa] inline-block" />3-10</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#1d4ed8] inline-block" />20+</span>
      </div>

      <MapContainer
        center={[28.3, 84.0]}   // Nepal geographic centre
        zoom={7}
        minZoom={6}
        maxZoom={13}
        scrollWheelZoom={false}
        dragging={!L.Browser.mobile}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.4}
        />

        {/* District choropleth layer */}
        {geoData && (
          <GeoJSON
            key={JSON.stringify(Object.keys(districtMap))}
            data={geoData}
            style={styleDistrict}
            onEachFeature={onEachDistrict}
          >
          </GeoJSON>
        )}

        {/* Fallback: show pin markers when GeoJSON failed or still loading */}
        {(geoError || !geoData) &&
          listings
            .filter((l) => l.location?.lat && l.location?.lng)
            .map((l) => (
              <Marker
                key={l._id}
                position={[l.location.lat, l.location.lng]}
                icon={defaultIcon}
                eventHandlers={{ click: () => onSelectListing?.(l) }}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-semibold">{l.title || l.address}</p>
                    <p className="text-slate-500">{l.city}</p>
                    {l.price && <p className="text-blue-600 font-semibold mt-1">Rs. {Number(l.price).toLocaleString()}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
      </MapContainer>

      {/* Loading state */}
      {!geoData && !geoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[600]">
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading district map…</p>
        </div>
      )}

      {/* District sidebar */}
      <DistrictPanel
        districtName={activeDistrict}
        listings={activeListings}
        onClose={() => setActiveDistrict(null)}
        onSelectListing={(l) => { setActiveDistrict(null); onSelectListing?.(l); }}
      />
    </div>
  );
}
