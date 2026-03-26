import React from "react";
import { Tag, SlidersHorizontal } from "lucide-react";

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
  <section className="bg-white border-y border-blue-50 relative z-10">
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Desktop layout */}
      <div className="hidden sm:flex flex-col gap-3">
        {/* Type toggle + map toggle row */}
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Deal:</span>
          {[{val:"sale",label:"For Sale"},{val:"rent",label:"For Rent"}].map(({val,label}) => (
            <button
              key={val}
              type="button"
              onClick={() => onTypeFilter(val)}
              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold border transition-all ${
                listingType === val
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-slate-200">|</span>
          <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="outline-none border border-slate-200 bg-white text-[11px] text-slate-600 font-semibold px-2 py-1 rounded-full w-32 cursor-pointer hover:bg-slate-50">
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
            <option value="room">Room</option>
          </select>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={onToggleMap}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
          >
            {showMap ? "📋 Show list" : "🗺️ Show map"}
          </button>
        </div>
        
        {/* Filter inputs row */}
        <div className="flex flex-row sm:items-end gap-3">
          <div className="grid gap-3 sm:grid-cols-4 flex-1">
             <FilterInput label="District (e.g. Kathmandu)" type="text" value={district} onChange={(e) => setDistrict(e.target.value)} />
             <FilterInput label="City/Municipality" type="text" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
             <FilterInput label="Max rent/price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
             <FilterInput label="Min beds" type="number" value={beds} onChange={(e) => setBeds(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-700 px-4 py-1.5 border border-blue-200 text-xs font-semibold hover:bg-blue-100"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              Advanced
            </button>
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          {[{val:"sale",label:"Buy"},{val:"rent",label:"Rent"}].map(({val,label}) => (
            <button
              key={val}
              type="button"
              onClick={() => onTypeFilter(val)}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${
                listingType === val
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 truncate">
               {district || municipality ? `${municipality ? municipality+', ' : ''}${district}` : "All Areas"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMap}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              {showMap ? "List" : "Map"}
            </button>
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FilterInput = ({ label, ...props }) => (
  <div className="text-xs">
    <p className="font-semibold text-slate-700 mb-1">{label}</p>
    <input
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
      {...props}
    />
  </div>
);

export default FiltersBar;
