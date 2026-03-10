import React, { useState } from "react";
import { X, Search, ChevronDown, ChevronUp, MapPin, Building, Tag, Layers, CheckCircle } from "lucide-react";
import { AMENITIES_LIST } from "./PostListing";

function FilterSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
       <button 
         type="button" 
         onClick={() => setIsOpen(!isOpen)} 
         className="flex items-center justify-between w-full text-left font-bold text-slate-800 transition-colors hover:text-blue-600"
       >
         <div className="flex items-center gap-3">
           <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
             <Icon className="w-5 h-5" />
           </div>
           {title}
         </div>
         {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
       </button>
       {isOpen && <div className="mt-4 ml-1 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
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
    <div className="fixed inset-0 z-50 bg-black/50 sm:bg-black/60 backdrop-blur-sm sm:p-4 flex items-end sm:items-center justify-center transition-all pb-0 sm:pb-4">
      <div className="w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[85vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
             <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Advanced Search</h2>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filter by exact requirements</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 bg-slate-50 rounded-full text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-2 relative">
          
          <FilterSection title="Property & Price" icon={Tag} defaultOpen={true}>
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px]">Property Type</p>
                <div className="grid grid-cols-2 gap-2">
                   {["house", "apartment", "land", "commercial"].map(type => (
                     <button 
                       key={type}
                       onClick={() => setPropertyType(propertyType === type ? "" : type)}
                       className={`py-3 px-2 rounded-xl text-xs font-bold capitalize transition-colors border-2 ${propertyType === type ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                     >
                        {type}
                     </button>
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <FilterInput label="Min Price (Rs)" type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <FilterInput label="Max Price (Rs)" type="number" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Location" icon={MapPin}>
            <div className="space-y-4">
               <FilterInput label="District (e.g. Kathmandu)" type="text" placeholder="Kathmandu" value={district} onChange={(e) => setDistrict(e.target.value)} />
               <FilterInput label="Municipality / City" type="text" placeholder="Kathmandu Metropolitan City" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
            </div>
          </FilterSection>

          <FilterSection title="Property Specs" icon={Building}>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <FilterInput label="Min Beds" type="number" placeholder="1" value={beds} onChange={(e) => setBeds(e.target.value)} />
                  <div className="text-sm">
                    <p className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px]">Facing</p>
                    <select value={facing} onChange={e => setFacing(e.target.value)} className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-3 outline-none focus:border-blue-400 font-bold text-slate-700">
                       <option value="">Any</option>
                       <option value="East">East</option>
                       <option value="West">West</option>
                       <option value="North">North</option>
                       <option value="South">South</option>
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <FilterInput label="Min Area (Aana)" type="number" placeholder="0" value={minLandArea} onChange={e => setMinLandArea(e.target.value)} />
                 <FilterInput label="Max Area (Aana)" type="number" placeholder="Any" value={maxLandArea} onChange={e => setMaxLandArea(e.target.value)} />
               </div>
               <FilterInput label="Min Road Access (Feet)" type="number" placeholder="10" value={roadAccess} onChange={e => setRoadAccess(e.target.value)} />
            </div>
          </FilterSection>

          <FilterSection title="Amenities & Facilities" icon={Layers}>
             <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <FilterToggle label="Pets allowed" checked={petsOnly} onChange={(e) => setPetsOnly(e.target.checked)} />
                  <FilterToggle label="Furnished only" checked={furnishedOnly} onChange={(e) => setFurnishedOnly(e.target.checked)} />
                </div>
                
                <p className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px]">Specific Amenities</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                   {AMENITIES_LIST.map(amenity => (
                     <label key={amenity} className={`flex items-start p-2.5 rounded-xl border-2 cursor-pointer transition-colors ${amenities?.includes(amenity) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                        <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border mt-0.5 mr-2 transition-colors ${amenities?.includes(amenity) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
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
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-5 flex gap-4 z-40">
          <button
            onClick={handleClear}
            className="flex-[1] rounded-2xl bg-slate-50 border-2 border-slate-100 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
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
const FilterInput = ({ label, ...props }) => (
  <div className="text-sm">
    <p className="font-bold text-slate-600 mb-2 uppercase tracking-wide text-[10px]">{label}</p>
    <input
      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white font-bold transition-colors"
      {...props}
    />
  </div>
);

const FilterToggle = ({ label, checked, onChange }) => (
  <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-colors duration-200 ${checked ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 text-white' : 'bg-slate-200 text-transparent'}`}>
      <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
    </div>
    <span className={`text-sm font-bold ${checked ? 'text-blue-900' : 'text-slate-600'}`}>{label}</span>
    <input
      type="checkbox"
      className="hidden"
      checked={checked}
      onChange={onChange}
    />
  </label>
);
