import React from "react";
import { Bed, Bath, Ruler } from "lucide-react";

export default function ListingCard({ home }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer bg-white">
      <div className="h-52 w-full overflow-hidden">
        <img
          src={home.image}
          alt="home"
          className="h-full w-full object-cover hover:scale-105 transition"
        />
      </div>

      <div className="p-4">
        <p className="text-blue-600 font-bold text-lg">{home.price}</p>

        <p className="text-slate-900 font-semibold mt-1">{home.address}</p>
        <p className="text-slate-500 text-sm">{home.city}</p>

        <div className="flex items-center gap-4 text-slate-600 text-sm mt-3">
          <span className="flex items-center gap-1"><Bed size={16}/> {home.beds} Beds</span>
          <span className="flex items-center gap-1"><Bath size={16}/> {home.baths} Baths</span>
          <span className="flex items-center gap-1"><Ruler size={16}/> {home.sqft} sqft</span>
        </div>
      </div>
    </div>
  );
}
