import React from "react";
import { X, Search, MapPin } from "lucide-react"; 

/**
 * FilterModal component displayed on mobile to provide a clean,
 * dedicated space for setting complex search filters.
 */
export default function FilterModal({
  isOpen,
  onClose,
  searchCity,
  setSearchCity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  beds,
  setBeds,
  petsOnly,
  setPetsOnly,
  furnishedOnly,
  setFurnishedOnly,
  onApply,
  onClear,
  // 🆕 Suggestion Props 
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
}) {
  if (!isOpen) return null;

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };
  
  // Helper component for address autocomplete dropdown (Defined locally for reuse)
  const AddressSuggestionsList = ({ suggestions, onSelect, show }) => {
    if (!show || suggestions.length === 0) return null;
    
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
            <p className="font-medium text-slate-800 flex-1 truncate">{s.label.split(",")[0]}</p>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white sm:hidden overflow-y-auto">
      {/* Modal Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Search Filters</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-slate-600 hover:bg-slate-50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Content - Full set of filters */}
      <div className="p-4 space-y-6">
        <div className="grid gap-4">
          
          {/* City Input with Suggestions */}
          <div className="relative text-sm z-20"> 
            <p className="font-semibold text-slate-700 mb-1">City / Area</p>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              placeholder="Baneshwor"
              value={searchCity}
              onChange={(e) => {
                setSearchCity(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {/* ✅ Suggestions Dropdown for mobile modal */}
            <AddressSuggestionsList 
              suggestions={suggestions} 
              show={showSuggestions} 
              onSelect={onSelectSuggestion} 
            />
          </div>

          <FilterInput
            label="Min rent (Rs)"
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <FilterInput
            label="Max rent (Rs)"
            type="number"
            placeholder="100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        
        <div className="grid gap-4">
            <FilterInput
              label="Min beds"
              type="number"
              placeholder="1"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
            />
            <InputSpacer /> 
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Amenities</p>
          <div className="flex flex-col gap-2">
            <FilterCheckbox
              label="Pets allowed"
              checked={petsOnly}
              onChange={(e) => setPetsOnly(e.target.checked)}
            />
            <FilterCheckbox
              label="Furnished only"
              checked={furnishedOnly}
              onChange={(e) => setFurnishedOnly(e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex justify-between gap-3 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 rounded-full border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Clear Filters
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// Reusable components moved here to keep the main file clean
const FilterInput = ({ label, ...props }) => (
  <div className="text-sm">
    <p className="font-semibold text-slate-700 mb-1">{label}</p>
    <input
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
      {...props}
    />
  </div>
);

const FilterCheckbox = ({ label, ...props }) => (
  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
    <input
      type="checkbox"
      className="h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
      {...props}
    />
    <span>{label}</span>
  </label>
);

const InputSpacer = () => <div className="hidden sm:block"></div>;