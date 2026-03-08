// src/AddressSuggestionsList.js
import React from "react";
import { MapPin } from "lucide-react";

/**
 * Reusable dropdown for address / city suggestions.
 * - suggestions: [{ id, label, city }]
 * - show: boolean (optional, defaults to true)
 * - onSelect: function(suggestion)
 */
export default function AddressSuggestionsList({
  suggestions,
  show = true,
  onSelect,
}) {
  if (!show || !Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s)}
          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-center gap-2"
        >
          <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            {/* Main name */}
            <p className="font-medium text-slate-800 truncate">
              {s.label.split(",")[0]}
            </p>
            {/* Full label for context */}
            <p className="text-xs text-slate-500 truncate">{s.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
