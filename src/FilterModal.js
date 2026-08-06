import React, { useState, useEffect } from "react";
import { X, Search, ChevronDown, ChevronUp, MapPin, Building, Tag, Layers, CheckCircle } from "lucide-react";
import { AMENITIES_LIST } from "./PostListing";
import { NEPAL_DATA, PROVINCES } from "./utils/nepalLocations";

function FilterSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-bold text-slate-800 transition-colors hover:text-gold-700"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          {title}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && <div className="mt-4 ml-1 animate-in slide-in-from-top-2 fade-in duration-300">{children}</div>}
    </div>
  )
}

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

  propertyType,
  setPropertyType,
  province,
  setProvince,
  district,
  setDistrict,
  municipality,
  setMunicipality,
  minLandArea,
  setMinLandArea,
  maxLandArea,
  setMaxLandArea,
  roadAccess,
  setRoadAccess,
  facing,
  setFacing,
  amenities,
  setAmenities,

  onApply,
  onClear,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const handleAmenityToggle = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 sm:bg-black/60 backdrop-blur-sm sm:p-4 flex items-end sm:items-center justify-center transition-all pb-0 sm:pb-4" role="dialog" aria-modal="true" aria-label="Advanced Search filters">
      <div className="w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[85vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">

        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Advanced Search</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filter by exact requirements</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close advanced search"
            className="h-10 w-10 bg-slate-50 rounded-full text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">

          <FilterSection title="Property & Price" icon={Tag} defaultOpen={true}>
            <div className="space-y-4">
              <div className="text-sm">
                <p id="propertyTypeGroupLabel" className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px]">Property Type</p>
                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="propertyTypeGroupLabel">
                  {["house", "apartment", "land", "commercial"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(propertyType === type ? "" : type)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold capitalize transition-colors border-2 ${propertyType === type ? 'bg-blue-50 border-gold-500 text-gold-700' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <FilterInput id="filterMinPrice" label="Min Price (Rs)" type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <FilterInput id="filterMaxPrice" label="Max Price (Rs)" type="number" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Location" icon={MapPin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="filterProvince" className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px] block">Province</label>
                <select id="filterProvince" value={province} onChange={e => { setProvince(e.target.value); setDistrict(''); setMunicipality(''); }} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-3 outline-none focus:border-gold-300 font-bold text-slate-700">
                  <option value="">Any Province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filterDistrict2" className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px] block">District</label>
                <select id="filterDistrict2" value={district} onChange={e => { setDistrict(e.target.value); setMunicipality(''); }} disabled={!province} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-3 outline-none focus:border-gold-300 font-bold text-slate-700 disabled:opacity-50">
                  <option value="">{province ? 'Any District' : 'Select Province first'}</option>
                  {province && NEPAL_DATA[province] && Object.keys(NEPAL_DATA[province]).sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="filterMunicipality2" className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px] block">Municipality</label>
                <select id="filterMunicipality2" value={municipality} onChange={e => setMunicipality(e.target.value)} disabled={!district} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-3 outline-none focus:border-gold-300 font-bold text-slate-700 disabled:opacity-50">
                  <option value="">{district ? 'Any Municipality' : 'Select District first'}</option>
                  {province && district && NEPAL_DATA[province]?.[district]?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Property Specs" icon={Building}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {propertyType !== 'land' && (
                  <FilterInput id="filterMinBeds" label="Min Beds" type="number" placeholder="1" value={beds} onChange={(e) => setBeds(e.target.value)} />
                )}
                <div className="text-sm">
                  <label htmlFor="filterFacing" className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px] block">Facing</label>
                  <select id="filterFacing" value={facing} onChange={e => setFacing(e.target.value)} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-3 outline-none focus:border-gold-300 font-bold text-slate-700">
                    <option value="">Any</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FilterInput id="filterMinLandArea" label="Min Area (Aana)" type="number" placeholder="0" value={minLandArea} onChange={e => setMinLandArea(e.target.value)} />
                <FilterInput id="filterMaxLandArea" label="Max Area (Aana)" type="number" placeholder="Any" value={maxLandArea} onChange={e => setMaxLandArea(e.target.value)} />
              </div>
              <FilterInput id="filterRoadAccess" label="Min Road Access (Feet)" type="number" placeholder="10" value={roadAccess} onChange={e => setRoadAccess(e.target.value)} />
            </div>
          </FilterSection>

          <FilterSection title="Amenities & Facilities" icon={Layers}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {/* Furnished toggle integrated into the grid */}
                <label className={`flex items-start p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${furnishedOnly ? 'border-gold-400 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border mt-0.5 mr-2 transition-colors ${furnishedOnly ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white border-slate-300'}`}>
                    {furnishedOnly && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className={`text-[11px] font-bold mt-0.5 leading-tight ${furnishedOnly ? 'text-blue-900' : 'text-slate-600'}`}>Furnished</span>
                  <input type="checkbox" className="hidden" checked={furnishedOnly || false} onChange={(e) => setFurnishedOnly(e.target.checked)} />
                </label>

                {/* Pets Allowed toggle integrated into the grid */}
                <label className={`flex items-start p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${petsOnly ? 'border-gold-400 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border mt-0.5 mr-2 transition-colors ${petsOnly ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white border-slate-300'}`}>
                    {petsOnly && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className={`text-[11px] font-bold mt-0.5 leading-tight ${petsOnly ? 'text-blue-900' : 'text-slate-600'}`}>Pets Allowed</span>
                  <input type="checkbox" className="hidden" checked={petsOnly || false} onChange={(e) => setPetsOnly(e.target.checked)} />
                </label>

                {AMENITIES_LIST.map(amenity => (
                  <label key={amenity} className={`flex items-start p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${amenities?.includes(amenity) ? 'border-gold-400 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border mt-0.5 mr-2 transition-colors ${amenities?.includes(amenity) ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white border-slate-300'}`}>
                      {amenities?.includes(amenity) && <CheckCircle className="w-3 h-3" />}
                    </div>
                    <span className={`text-[11px] font-bold mt-0.5 leading-tight ${amenities?.includes(amenity) ? 'text-blue-900' : 'text-slate-600'}`}>{amenity}</span>
                    <input type="checkbox" className="hidden" checked={amenities?.includes(amenity) || false} onChange={() => handleAmenityToggle(amenity)} />
                  </label>
                ))}
              </div>
            </div>
          </FilterSection>

        </div>

        {/* Fixed Footer */}
        <div className="bg-white border-t border-slate-100 p-5 flex gap-4 z-40 shrink-0 mt-auto">
          <button
            onClick={handleClear}
            className="flex-[1] rounded-2xl bg-slate-50 border-2 border-slate-100 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gold-500 py-3.5 text-sm font-bold text-white hover:bg-gold-600 shadow-lg shadow-gold-500/20 active:scale-95 transition-all"
          >
            <Search className="h-4 w-4" />
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
const FilterInput = ({ id, label, ...props }) => (
  <div className="text-sm">
    <label htmlFor={id} className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px] block">{label}</label>
    <input
      id={id}
      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-gold-300 focus:bg-white font-bold transition-colors"
      {...props}
    />
  </div>
);

