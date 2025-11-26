// src/ListingMapView.js
import React, { useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// fix default icon issue
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function BoundsWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const b = map.getBounds();
      onBoundsChange &&
        onBoundsChange({
          minLat: b.getSouth(),
          maxLat: b.getNorth(),
          minLng: b.getWest(),
          maxLng: b.getEast(),
        });
    },
  });
  return null;
}

export default function ListingMapView({
  listings,
  onBoundsChange,
  onSelectListing,
}) {
  // default center (Kathmandu-ish)
  const center = [27.7172, 85.3240];

  // if you have at least one listing with location, center there
  const firstWithLoc = listings.find(
    (l) => l.location?.lat && l.location?.lng
  );
  const startCenter = firstWithLoc
    ? [firstWithLoc.location.lat, firstWithLoc.location.lng]
    : center;

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-blue-100">
      <MapContainer
        center={startCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BoundsWatcher onBoundsChange={onBoundsChange} />

        {listings
          .filter((l) => l.location?.lat && l.location?.lng)
          .map((l) => (
            <Marker
              key={l._id}
              position={[l.location.lat, l.location.lng]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => onSelectListing && onSelectListing(l),
              }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{l.title || l.address}</p>
                  <p className="text-slate-500">{l.city}</p>
                  {l.price && (
                    <p className="text-blue-600 font-semibold mt-1">
                      {l.price}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
