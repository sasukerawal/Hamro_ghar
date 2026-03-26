import React from "react";
import { Tag, SlidersHorizontal, Search, RotateCcw, Map as MapIcon, List } from "lucide-react";

/**
 * FiltersBar - Refined search and filter controls with glassmorphism.
 */
export const FiltersBar = ({
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
  listingType,
  onTypeFilter,

  // V2
  propertyType,
  setPropertyType,
  district,
  setDistrict,
  municipality,
  setMunicipality,

  onSearch,
  onClear,
  onOpenModal,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  setShowSuggestions,
  showMap,
  onToggleMap,
}) => (
  <section className="sticky top-20 z-30 glass border-y border-white/50 shadow-sm">
    <div className="max-w-7xl mx-auto px-6 py-4">
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center gap-6">
        {/* Deal Type Switcher */}
        <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
          {[
            { val: "sale", label: "Buy" },
            { val: "rent", label: "Rent" }
          ].map(({ val, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => onTypeFilter(val)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${listingType === val
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* Quick Filter Inputs */}
        <div className="flex-1 grid grid-cols-4 gap-4">
          <RefinedFilterInput
            label="District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Kathmandu..."
          />
          <select
            value={propertyType}
            onChange={e => setPropertyType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="">Any Property</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
          <RefinedFilterInput
            label="Budget"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Price"
          />
          <RefinedFilterInput
            label="Bedrooms"
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            placeholder="Min"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenModal}
            className="h-11 w-11 flex items-center justify-center rounded-2xl glass border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-lg transition-all"
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleMap}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl glass border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-white hover:shadow-lg transition-all"
          >
            {showMap ? <List className="h-4 w-4 text-blue-600" /> : <MapIcon className="h-4 w-4 text-blue-600" />}
            {showMap ? "List" : "Map"}
          </button>

          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:translate-y-[-1px] transition-all active:scale-95"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            {[{ val: "sale", label: "Buy" }, { val: "rent", label: "Rent" }].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => onTypeFilter(val)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${listingType === val
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700"
          >
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            Filters
          </button>
        </div>
      </div>
    </div>
  </section>
);

const RefinedFilterInput = ({ label, ...props }) => (
  <div className="relative">
    <input
      className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
      {...props}
    />
  </div>
);

export default FiltersBar;
