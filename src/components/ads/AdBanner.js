import React from "react";
import { ExternalLink } from "lucide-react";

export default function AdBanner({ ad, className = "" }) {
  if (!ad) return null;

  const handleClick = (e) => {
    // In Phase 13, we will intercept this to track clicks via POST /api/ads/:id/click
    // For now, it just follows the regular anchor tag behavior.
  };

  return (
    <div className={`relative w-full overflow-hidden bg-slate-100 rounded-xl group border border-slate-200 shadow-sm ${className}`}>
      {/* 
        Sponsor Tag 
        Small badge ensuring users know this is an advertisement.
      */}
      <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
        Sponsored
      </div>

      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block w-full h-full relative"
      >
        <img
          src={ad.imageUrl}
          alt={`Advertisement by ${ad.sponsorName}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 bg-white text-gold-700 font-bold text-xs py-2 px-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1">
            Visit Sponsor <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </a>
    </div>
  );
}
