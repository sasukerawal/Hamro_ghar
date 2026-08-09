// src/components/common/PropertyLocationMap.js
// Real pin map for a single property's detail page. Falls back to the
// owner's direct Google Maps link (if provided) or a plain notice when no
// coordinates exist at all — never a fake/static box pretending to be a map.
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, ExternalLink } from "lucide-react";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -38],
});

function getCoords(home) {
  const lat = home?.location?.lat ?? home?.location?.coordinates?.[1];
  const lng = home?.location?.lng ?? home?.location?.coordinates?.[0];
  if (typeof lat === "number" && typeof lng === "number" && (lat !== 0 || lng !== 0)) {
    return [lat, lng];
  }
  return null;
}

export default function PropertyLocationMap({ home }) {
  const coords = getCoords(home);
  const isApproximate = home?.location?.precision === "approximate";
  const areaLabel = home?.location?.municipality || home?.city || home?.location?.district;

  if (!coords) {
    // No coordinates at all — be honest instead of showing a fake map.
    return (
      <div className="h-64 bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-center gap-2 border border-dashed border-slate-300 px-6">
        <MapPin className="w-8 h-8 text-slate-400" />
        <p className="font-bold text-slate-500 text-sm">
          The owner hasn't pinned an exact location{areaLabel ? ` — this listing is in ${areaLabel}` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden border border-gold-100 shadow-xl animate-fade-in-up">
      <MapContainer
        center={coords}
        zoom={isApproximate ? 14 : 16}
        scrollWheelZoom={false}
        dragging={!L.Browser.mobile}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isApproximate ? (
          <Circle
            center={coords}
            radius={350}
            pathOptions={{ color: "#B4522F", fillColor: "#C97850", fillOpacity: 0.25, weight: 2 }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{home.title}</p>
                <p className="text-slate-500">Approximate area</p>
              </div>
            </Popup>
          </Circle>
        ) : (
          <Marker position={coords} icon={pinIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{home.title}</p>
                {areaLabel && <p className="text-slate-500">{areaLabel}</p>}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* This is a full sentence, not a short label, so it's read as body
          text (12px floor) rather than a functional tag (11px floor) —
          text-xs clears both. */}
      {isApproximate && (
        <div className="absolute bottom-4 left-4 z-[500] glass rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-md">
          Approximate area — exact pin hidden until you contact the owner
        </div>
      )}

      {home?.mapsUrl && (
        <a
          href={home.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute top-4 right-4 z-[500] inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md hover:bg-white hover:scale-105 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
        </a>
      )}
    </div>
  );
}
