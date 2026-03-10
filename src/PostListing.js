/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, CheckCircle, MapPin, UploadCloud, X, Plus, Trash
} from "lucide-react";
import { apiFetch } from "./api";
import { MUNICIPALITIES, FACING_DIRECTIONS } from "./utils/nepalLocations";

const PROVINCES = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];
const DISTRICTS = Object.keys(MUNICIPALITIES).sort();
const ROAD_TYPES = ["Pitched", "Gravel", "Soil", "Alley", "None", "Blacktopped"];

export const AMENITIES_LIST = [
  "Air Conditioning", "Backup Inverter / Generator", "Balcony", "Bike Parking",
  "CCTV", "Cafeteria", "Car Parking", "Community Hall", "Drainage",
  "Drinking Water", "Electricity Backup", "Fire Place", "Garbage Collection",
  "Garden", "Gym", "Hot Water", "Internet / WiFi", "Kids Playground",
  "Lift", "Maintenance", "Modular Kitchen", "Parking", "Pets Allowed",
  "Public Transport", "Regular Water Supply", "Security Staff", "Solar",
  "Solar Water", "Store Room", "Swimming Pool", "Terrace", "Visitor Parking",
  "Washing Machine", "Water Well"
];

export default function PostListing() {
  const { id } = useParams();
  const editId = id || null;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [fetching, setFetching] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);

  // V2 Schema mapped directly to form state
  const [form, setForm] = useState({
    type: "sale",
    propertyType: "house",
    price: "",
    
    // Location
    province: "",
    district: "",
    municipality: "",
    wardNo: "",
    tole: "",
    nearestLandmark: "",
    mapsUrl: "",
    
    // Specs
    bedrooms: "",
    bathrooms: "",
    builtUpAreaSqFt: "",
    ropani: "",
    aana: "",
    paisa: "",
    daam: "",
    roadAccessWidth: "",
    roadAccessType: "",
    facing: "",
    yearBuilt: "",
    
    // Expanded Specs
    kitchen: "",
    diningRoom: "",
    livingRoom: "",
    totalFloors: "",
    floorNumber: "",
    balcony: "",
    parking: "",
    carParking: "",
    bikeParking: "",
    furnishing: "",
    
    waterAvailable: false,
    waterSource: "",
    hotWater: false,
    drinkingWater: false,

    wifiAvailable: false,
    wifiProvider: "",
    
    // Narrative & Details
    title: "",
    description: "",
    highlights: [""],
    videoUrl: "",
    
    // Facilities & Amenities
    amenities: []
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [keepExisting, setKeepExisting] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editId) return;
    const fetchListing = async () => {
      try {
        setFetching(true);
        const data = await apiFetch(`/api/listings/${editId}`);
        if (data.listing) {
          const l = data.listing;
          setForm({
            type: l.type || "sale",
            propertyType: l.propertyType || "house",
            price: l.price || "",
            
            province: l.location?.province || "",
            district: l.location?.district || l.city || "",
            municipality: l.location?.municipality || "",
            wardNo: l.location?.ward || l.location?.wardNo || "",
            tole: l.location?.tole || l.location?.locality || l.address || "",
            nearestLandmark: l.location?.nearestLandmark || "",
            mapsUrl: l.mapsUrl || "",
            
            bedrooms: l.specs?.bedrooms ?? l.beds ?? "",
            bathrooms: l.specs?.bathrooms ?? l.baths ?? "",
            builtUpAreaSqFt: l.specs?.builtUpAreaSqFt ?? l.sqft ?? "",
            ropani: l.specs?.landArea?.ropani ?? "",
            aana: l.specs?.landArea?.aana ?? l.specs?.landAreaAana ?? "",
            paisa: l.specs?.landArea?.paisa ?? "",
            daam: l.specs?.landArea?.daam ?? "",
            roadAccessWidth: l.specs?.roadAccess?.widthFeet ?? l.specs?.roadAccessFeet ?? "",
            roadAccessType: l.specs?.roadAccess?.type ?? l.specs?.roadType ?? "",
            facing: l.specs?.facing ?? "",
            yearBuilt: l.specs?.builtYear ?? l.specs?.yearBuilt ?? "",
            
            kitchen: l.specs?.kitchen ?? "",
            diningRoom: l.specs?.diningRoom ?? "",
            livingRoom: l.specs?.livingRoom ?? "",
            totalFloors: l.specs?.totalFloors ?? "",
            floorNumber: l.specs?.floorNumber ?? "",
            balcony: l.specs?.balcony ?? "",
            parking: l.specs?.parking ?? "",
            carParking: l.specs?.carParking ?? l.facilities?.carParking ?? "",
            bikeParking: l.specs?.bikeParking ?? l.facilities?.bikeParking ?? "",
            furnishing: l.specs?.furnishing ?? (l.furnished ? "Fully Furnished" : ""),
            
            waterAvailable: !!l.specs?.water?.available,
            waterSource: l.specs?.water?.source || "",
            hotWater: !!l.specs?.water?.hotWater,
            drinkingWater: !!l.specs?.water?.drinkingWater,

            wifiAvailable: !!l.specs?.wifi?.available || !!l.internet,
            wifiProvider: l.specs?.wifi?.provider || "",
            
            title: l.title || "",
            description: l.description || "",
            highlights: l.highlights?.length ? l.highlights : [""],
            videoUrl: l.videoUrl ?? "",
            
            amenities: l.amenities || []
          });
          const imgs = l.images || [];
          setExistingImages(imgs);
          setKeepExisting(imgs.map(() => true));
        }
      } catch (err) {
        toast.error("Could not load listing details");
        navigate("/membership");
      } finally {
        setFetching(false);
      }
    };
    fetchListing();
  }, [editId, navigate]);

  useEffect(() => {
    return () => {
      mediaFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, [mediaFiles]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (['propertyType', 'facing', 'aana', 'tole', 'municipality', 'type'].includes(field)) {
         if (!next.title || next.title.includes(" facing ") || next.title.includes(" BHK ")) {
           const isHouse = next.propertyType === 'house' || next.propertyType === 'land';
           const ft = next.facing ? `${next.facing}-Facing ` : "";
           const pt = next.propertyType.charAt(0).toUpperCase() + next.propertyType.slice(1);
           const pAana = next.aana ? ` on ${next.aana} Aana` : "";
           const lTole = next.tole ? ` in ${next.tole}` : "";
           
           if (isHouse) {
             next.title = `${ft}${pt}${pAana}${lTole} for ${next.type === 'rent' ? 'Rent' : 'Sale'}`;
           } else {
             const bd = next.bedrooms ? `${next.bedrooms} BHK ` : "";
             next.title = `${bd}${pt}${lTole} for ${next.type === 'rent' ? 'Rent' : 'Sale'}`;
           }
         }
      }
      return next;
    });
  };

  const handleAmenityToggle = (amenity) => {
    setForm(prev => {
      const isSelected = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const uploadImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Size limit 3MB
    const MAX_SIZE = 3 * 1024 * 1024;
    const oversized = files.filter(f => f.size > MAX_SIZE);
    
    if (oversized.length > 0) {
      toast.error(`Please upload a smaller image. Large images slow down the website. Try using an optimized photo in KB size instead of a multi-MB file (${oversized.length} files rejected).`);
    }

    const valid = files.filter(f => f.size <= MAX_SIZE);
    if (!valid.length) return;

    const remaining = 15 - mediaFiles.length - existingImages.filter((_, i) => keepExisting[i]).length;
    if (valid.length > remaining) toast.warn(`Only ${remaining} more images allowed.`);
    
    const newEntries = valid.slice(0, remaining).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name
    }));
    setMediaFiles(prev => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.price || Number(form.price) <= 0) return "Valid Price is required";
    } else if (step === 2) {
      if (!form.province) return "Province is required";
      if (!form.district) return "District is required";
      if (!form.municipality) return "Municipality is required";
      if (!form.tole) return "Locality/Tole is required";
    } else if (step === 5) {
      const totalImages = mediaFiles.length + existingImages.filter((_, i) => keepExisting[i]).length;
      if (totalImages < 3 && !editId) return "Please upload at least 3 high-quality images to build trust.";
    } else if (step === 6) {
      if (!form.description || form.description.trim().length < 20) return "Description is too short. Please provide more detail.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(currentStep);
    if (err) return toast.error(err);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(p => p + 1);
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(p => Math.max(1, p - 1));
  };

  const handleSubmit = async () => {
    const err = validateStep(6);
    if (err) return toast.error(err);

    try {
      setSubmitting(true);
      const fd = new FormData();
      
      const locationJSON = JSON.stringify({
        province: form.province,
        district: form.district,
        municipality: form.municipality,
        ward: form.wardNo ? Number(form.wardNo) : undefined,
        tole: form.tole,
        nearestLandmark: form.nearestLandmark
      });

      const specsJSON = JSON.stringify({
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        kitchen: form.kitchen ? Number(form.kitchen) : undefined,
        diningRoom: form.diningRoom ? Number(form.diningRoom) : undefined,
        livingRoom: form.livingRoom ? Number(form.livingRoom) : undefined,
        totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
        floorNumber: form.floorNumber ? Number(form.floorNumber) : undefined,
        balcony: form.balcony ? Number(form.balcony) : undefined,
        parking: form.parking ? Number(form.parking) : undefined,
        carParking: form.carParking ? Number(form.carParking) : undefined,
        bikeParking: form.bikeParking ? Number(form.bikeParking) : undefined,
        builtUpAreaSqFt: form.builtUpAreaSqFt ? Number(form.builtUpAreaSqFt) : undefined,
        landArea: {
          ropani: form.ropani ? Number(form.ropani) : 0,
          aana: form.aana ? Number(form.aana) : 0,
          paisa: form.paisa ? Number(form.paisa) : 0,
          daam: form.daam ? Number(form.daam) : 0,
        },
        roadAccess: {
          widthFeet: form.roadAccessWidth ? Number(form.roadAccessWidth) : undefined,
          type: form.roadAccessType || undefined
        },
        facing: form.facing || undefined,
        builtYear: form.yearBuilt || undefined,
        furnishing: form.furnishing || undefined,
        water: {
          available: form.waterAvailable,
          source: form.waterSource || undefined,
          hotWater: form.hotWater,
          drinkingWater: form.drinkingWater
        },
        wifi: {
          available: form.wifiAvailable,
          provider: form.wifiProvider || undefined
        }
      });

      fd.append("type", form.type);
      fd.append("propertyType", form.propertyType);
      fd.append("title", form.title.trim() || `${form.propertyType} for ${form.type}`);
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("location", locationJSON);
      fd.append("specs", specsJSON);
      fd.append("amenities", JSON.stringify(form.amenities));
      fd.append("mapsUrl", form.mapsUrl.trim());
      fd.append("videoUrl", form.videoUrl.trim());
      fd.append("highlights", JSON.stringify(form.highlights.filter(h => h.trim())));

      mediaFiles.forEach(({ file }) => fd.append("images", file));
      if (editId) {
        existingImages.forEach((img, i) => {
           if (keepExisting[i]) fd.append("keepImages", img);
        });
      }

      await apiFetch(editId ? `/api/listings/${editId}` : "/api/listings/create", {
        method: editId ? "PUT" : "POST",
        body: fd
      });
      
      toast.success(editId ? "Listing updated successfully!" : "High-quality listing published!");
      navigate("/membership");
    } catch (e) {
      toast.error(e.message || "Failed to post listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = ["Basics", "Location", "Specs", "Facilities", "Media", "Narrative"];

  if (fetching) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center py-20 animate-pulse text-blue-600 font-bold tracking-widest uppercase">Loading editor...</div></div>;

  const isLand = form.propertyType === 'land';
  const isApt = form.propertyType === 'apartment' || form.propertyType === 'flat';
  const isCommercial = form.propertyType === 'commercial';

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-5rem)] py-8 px-4 font-sans text-slate-800">
       <div className="max-w-4xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-4">
               <button onClick={() => navigate("/membership")} className="p-2 bg-white rounded-full shadow-sm hover:text-blue-600 transition-colors">
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                 <h1 className="text-3xl font-extrabold tracking-tight">{editId ? "Edit Listing" : "Post a Premium Listing"}</h1>
                 <p className="text-sm text-slate-500 font-medium">Step {currentStep} of {STEPS.length} — {STEPS[currentStep-1]}</p>
               </div>
             </div>
          </div>

          <div className="bg-white p-4 sm:p-5 text-sm rounded-2xl shadow-sm mb-8 flex justify-between overflow-x-auto gap-4 scrollbar-hide border border-slate-100">
             {STEPS.map((t, i) => {
                const isActive = currentStep === i + 1;
                const isPast = currentStep > i + 1;
                return (
                  <div key={i} className={`font-bold whitespace-nowrap min-w-max flex items-center gap-2 transition-colors ${isActive ? 'text-blue-600' : isPast ? 'text-slate-700' : 'text-slate-300'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-blue-600 text-white shadow-md' : isPast ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 border'}`}>
                       {isPast ? <CheckCircle className="w-4 h-4" /> : (i + 1)}
                    </div>
                    {t}
                  </div>
                )
             })}
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
             
             <div className="relative z-10 mb-10">
               {currentStep === 1 && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                       <h2 className="text-2xl font-extrabold mb-1">The Basics</h2>
                       <p className="text-sm text-slate-500 font-medium">What kind of property are you listing?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Deal Type *</label>
                          <select value={form.type} onChange={handleChange("type")} className="w-full border-2 border-slate-200 outline-none p-4 rounded-xl font-bold focus:border-blue-500 text-slate-800 focus:bg-white bg-slate-50 transition-colors">
                             <option value="sale">For Sale</option>
                             <option value="rent">For Rent</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Property Type *</label>
                          <select value={form.propertyType} onChange={handleChange("propertyType")} className="w-full border-2 border-slate-200 outline-none p-4 rounded-xl font-bold focus:border-blue-500 text-slate-800 focus:bg-white bg-slate-50 transition-colors">
                             <option value="house">House</option>
                             <option value="apartment">Apartment / Flat</option>
                             <option value="land">Land / Plot</option>
                             <option value="commercial">Commercial Space</option>
                             <option value="room">Room</option>
                          </select>
                       </div>
                    </div>
                    <div className="bg-blue-50/70 border border-blue-100 p-6 rounded-2xl relative overflow-hidden mt-6">
                       <label className="text-xs uppercase tracking-widest text-blue-600 font-black block mb-2">{form.type === 'rent' ? 'Monthly Rent *' : 'Total Price *'}</label>
                       <div className="relative z-10 text-slate-800">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl">Rs.</span>
                         <input type="number" min="0" placeholder="e.g. 15000000" value={form.price} onChange={handleChange("price")} className="w-full border-2 border-transparent outline-none focus:border-blue-400 p-4 pl-14 rounded-xl text-2xl font-black bg-white shadow-sm transition-colors" />
                       </div>
                    </div>
                 </div>
               )}

               {currentStep === 2 && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-extrabold mb-1">Deep Location</h2>
                      <p className="text-sm text-slate-500 font-medium">Precise location helps buyers find your property in search.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Province *</label>
                        <select value={form.province} onChange={handleChange("province")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold text-slate-800">
                          <option value="">Select Province</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">District *</label>
                        <select value={form.district} onChange={handleChange("district")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold text-slate-800">
                          <option value="">Select District</option>
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Municipality / VDC *</label>
                        <select value={form.municipality} onChange={handleChange("municipality")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold text-slate-800">
                           <option value="">Select Municipality</option>
                           {(MUNICIPALITIES[form.district] || []).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ward No</label>
                           <input type="number" placeholder="e.g. 10" value={form.wardNo} onChange={handleChange("wardNo")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-medium text-center" />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nearest Landmark</label>
                           <input type="text" placeholder="e.g. Big Mart" value={form.nearestLandmark} onChange={handleChange("nearestLandmark")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-medium" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tole / Chowk *</label>
                      <input type="text" placeholder="e.g. Shantinagar, Shrijana Chowk" value={form.tole} onChange={handleChange("tole")} className="w-full border-2 border-slate-200 p-4 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold text-lg" />
                    </div>

                    <div className="bg-slate-50 p-5 mt-2 border border-slate-200 rounded-xl space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-blue-600" /> Google Maps Pin URL
                      </label>
                      <p className="text-xs text-slate-500 font-medium mb-3">Copy-paste the share URL from Google Maps to help verified buyers visit.</p>
                      <input type="url" placeholder="https://www.google.com/maps/place/..." value={form.mapsUrl} onChange={handleChange("mapsUrl")} className="w-full border border-slate-300 focus:border-blue-400 p-3 rounded-lg text-sm bg-white font-mono shadow-inner outline-none" />
                    </div>
                 </div>
               )}

               {currentStep === 3 && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-extrabold mb-1">Specifications</h2>
                      <p className="text-sm text-slate-500 font-medium">Crucial details for the Nepali buyer/renter.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Ropani/Bigha</label>
                         <input type="number" min="0" placeholder="0" value={form.ropani} onChange={handleChange("ropani")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Aana/Kattha</label>
                         <input type="number" min="0" placeholder="0" value={form.aana} onChange={handleChange("aana")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Paisa/Dhur</label>
                         <input type="number" min="0" placeholder="0" value={form.paisa} onChange={handleChange("paisa")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Daam</label>
                         <input type="number" min="0" placeholder="0" value={form.daam} onChange={handleChange("daam")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                       </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5 border-y border-slate-100 py-6">
                       <div>
                         <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Road Access Width (Ft.)</label>
                         <input type="number" min="0" placeholder="e.g. 13" value={form.roadAccessWidth} onChange={handleChange("roadAccessWidth")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 transition-colors font-bold" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Road Type</label>
                         <select value={form.roadAccessType} onChange={handleChange("roadAccessType")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 transition-colors font-bold text-slate-700">
                           <option value="">Select Type</option>
                           {ROAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Property Facing</label>
                         <select value={form.facing} onChange={handleChange("facing")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 transition-colors font-bold text-slate-700">
                           <option value="">Select Facing</option>
                           {FACING_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                       </div>
                    </div>

                    {!isLand && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div>
                              <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Bedrooms</label>
                              <input type="number" min="0" placeholder="0" value={form.bedrooms} onChange={handleChange("bedrooms")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold text-lg" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Bathrooms</label>
                              <input type="number" min="0" placeholder="0" value={form.bathrooms} onChange={handleChange("bathrooms")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold text-lg" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Kitchens</label>
                              <input type="number" min="0" placeholder="0" value={form.kitchen} onChange={handleChange("kitchen")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Living Rooms</label>
                              <input type="number" min="0" placeholder="0" value={form.livingRoom} onChange={handleChange("livingRoom")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {!isApt && !isCommercial && (
                             <div>
                                <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Total Floors</label>
                                <input type="number" step="0.5" placeholder="2.5" value={form.totalFloors} onChange={handleChange("totalFloors")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                             </div>
                           )}
                           {isApt && (
                             <div>
                                <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Floor No.</label>
                                <input type="number" placeholder="2" value={form.floorNumber} onChange={handleChange("floorNumber")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                             </div>
                           )}
                           <div>
                              <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Balconies</label>
                              <input type="number" min="0" placeholder="0" value={form.balcony} onChange={handleChange("balcony")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Built Area (SqFt)</label>
                              <input type="number" min="0" placeholder="1200" value={form.builtUpAreaSqFt} onChange={handleChange("builtUpAreaSqFt")} className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 text-center font-bold" />
                           </div>
                           <div className="col-span-1 md:col-span-2">
                             <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Furnishing</label>
                             <select value={form.furnishing} onChange={handleChange("furnishing")} className="w-full border-2 border-slate-200 p-3 outline-none rounded-xl bg-slate-50 focus:border-blue-400 transition-colors font-bold text-slate-700">
                                <option value="">Select Furnishing</option>
                                <option value="Unfurnished">Unfurnished</option>
                                <option value="Semi Furnished">Semi Furnished</option>
                                <option value="Fully Furnished">Fully Furnished</option>
                             </select>
                           </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                           <div>
                              <h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Parking</h3>
                              <div className="grid grid-cols-2 gap-3">
                                 <div>
                                   <label className="text-[10px] font-bold text-slate-500 uppercase">Bike Parking</label>
                                   <input type="number" min="0" value={form.bikeParking} onChange={handleChange("bikeParking")} className="w-full border-2 p-2 rounded-lg bg-slate-50 text-center font-bold" placeholder="0" />
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-bold text-slate-500 uppercase">Car Parking</label>
                                   <input type="number" min="0" value={form.carParking} onChange={handleChange("carParking")} className="w-full border-2 p-2 rounded-lg bg-slate-50 text-center font-bold" placeholder="0" />
                                 </div>
                              </div>
                           </div>
                           <div>
                              <h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Utilities</h3>
                              <div className="space-y-3">
                                 <label className="flex items-center gap-3 cursor-pointer">
                                   <input type="checkbox" checked={form.waterAvailable} onChange={handleChange("waterAvailable")} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                   <span className="font-semibold text-slate-700 text-sm">Water Available</span>
                                 </label>
                                 {form.waterAvailable && (
                                   <select value={form.waterSource} onChange={handleChange("waterSource")} className="w-full border-2 border-slate-200 p-2 text-sm outline-none rounded-lg bg-slate-50 focus:border-blue-400 font-medium">
                                      <option value="">Water Source?</option>
                                      <option value="Government">Government (Melamchi, etc.)</option>
                                      <option value="Boring">Boring / Deep Tube Well</option>
                                      <option value="Tanker">Tanker Required</option>
                                      <option value="Well">Well</option>
                                      <option value="Mixed">Mixed</option>
                                   </select>
                                 )}
                                 <label className="flex items-center gap-3 cursor-pointer">
                                   <input type="checkbox" checked={form.wifiAvailable} onChange={handleChange("wifiAvailable")} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                   <span className="font-semibold text-slate-700 text-sm">Internet / WiFi Available</span>
                                 </label>
                              </div>
                           </div>
                        </div>
                      </>
                    )}
                 </div>
               )}

               {currentStep === 4 && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-extrabold mb-1">Amenities & Facilities</h2>
                      <p className="text-sm text-slate-500 font-medium">Select all the extra features your property provides.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                       {AMENITIES_LIST.map((amenity) => {
                          const isSelected = form.amenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              onClick={() => handleAmenityToggle(amenity)}
                              className={`flex items-start text-left p-3 rounded-xl border-2 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                            >
                               <div className={`w-5 h-5 shrink-0 rounded flex items-center justify-center border mt-0.5 mr-3 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                                 {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                               </div>
                               <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>{amenity}</span>
                            </button>
                          );
                       })}
                    </div>
                 </div>
               )}

               {currentStep === 5 && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                       <h2 className="text-2xl font-extrabold mb-1">Upload Media</h2>
                       <p className="text-sm font-medium text-slate-500">Premium listings require high-quality photos to build buyer trust.</p>
                       <div className="mt-3 bg-blue-50 p-4 border border-blue-100 rounded-xl">
                          <p className="text-xs text-blue-800 font-semibold mb-1">Require at least 3 photos to publish!</p>
                          <p className="text-[11px] text-blue-600">The first photo will be the main cover image shown in search results.</p>
                       </div>
                    </div>

                    <div>
                     <div className="flex justify-between items-end mb-4">
                        <h3 className="font-bold text-slate-800">Photos</h3>
                        <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">{mediaFiles.length + existingImages.filter((_, i) => keepExisting[i]).length} / 15 Max</span>
                     </div>
                     
                     {mediaFiles.length + existingImages.filter((_, i) => keepExisting[i]).length < 15 && (
                       <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 rounded-3xl flex flex-col items-center justify-center py-10 px-4 cursor-pointer transition-colors outline-none focus-within:ring-4 focus-within:ring-blue-100 group">
                          <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                             <UploadCloud className="w-7 h-7 text-blue-600" />
                          </div>
                          <span className="text-sm font-extrabold text-blue-700 block bg-white px-5 py-2 rounded-full border border-blue-100">Click to Select Photos</span>
                          <span className="text-xs font-semibold text-slate-400 mt-3">JPG, PNG, WEBP allowed (Max 3MB each)</span>
                          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={uploadImages} />
                       </label>
                     )}

                     {(mediaFiles.length > 0 || existingImages.length > 0) && (
                       <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                          {existingImages.map((src, i) => (
                             <div key={'old-'+i} className="relative aspect-[4/3] group rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                                <img src={src} className={`w-full h-full object-cover transition-all duration-300 ${keepExisting[i] ? 'opacity-100' : 'opacity-20 grayscale'}`} alt="" />
                                <button onClick={() => setKeepExisting(p => p.map((v, idx) => idx===i ? !v : v))} className={`absolute top-2 right-2 p-1.5 shadow-md rounded-full text-white transition-transform hover:scale-110 z-10 ${keepExisting[i] ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                   {keepExisting[i] ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                                {i === 0 && keepExisting[i] && <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">COVER</span>}
                             </div>
                          ))}
                          {mediaFiles.map((m, i) => (
                             <div key={'new-'+i} className="relative aspect-[4/3] group rounded-xl overflow-hidden shadow-sm border-2 border-blue-400 bg-white">
                                <img src={m.previewUrl} className="w-full h-full object-cover" alt="" />
                                <button onClick={() => setMediaFiles(p => p.filter((_, idx)=>idx!==i))} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 shadow-md text-white p-1.5 rounded-full transition-transform hover:scale-110 z-10"><X className="w-3.5 h-3.5" /></button>
                             </div>
                          ))}
                       </div>
                     )}
                    </div>
                 </div>
               )}

               {currentStep === 6 && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                       <h2 className="text-2xl font-extrabold mb-1">Tell the Narrative</h2>
                       <p className="text-sm text-slate-500 font-medium">Auto-generated titles perform better for SEO, but you can override it.</p>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Listing Title</label>
                       <input type="text" placeholder="e.g. 3 BHK Flat in Baluwatar" value={form.title} onChange={handleChange("title")} className="w-full border-2 border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-bold text-lg transition-colors" />
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-200/60 rounded-3xl mt-4">
                       <h2 className="text-xl font-extrabold mb-1 text-amber-900">Feature Highlights</h2>
                       <p className="text-xs font-semibold text-amber-700/80 mb-4">Add up to 5 punchy bullet points</p>
                       <div className="space-y-3">
                         {form.highlights.map((h, i) => (
                            <div key={i} className="flex gap-2 items-center group">
                               <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                               <input type="text" value={h} onChange={e => {
                                 const n = [...form.highlights]; n[i] = e.target.value;
                                 setForm(p => ({...p, highlights: n}));
                               }} placeholder="e.g. 5 mins walk from Ring Road" className="flex-1 border-b-2 border-amber-200 focus:border-amber-500 p-2 text-sm outline-none bg-transparent transition-colors font-bold text-amber-950 placeholder:text-amber-900/40" />
                               <button onClick={() => {
                                 let n = form.highlights.filter((_, idx) => idx !== i);
                                 if(!n.length) n=[""];
                                 setForm(p => ({...p, highlights: n}));
                               }} className="text-amber-300 hover:text-red-500 p-2"><Trash className="w-4 h-4" /></button>
                            </div>
                         ))}
                         {form.highlights.length < 5 && (
                           <button onClick={() => setForm(p => ({...p, highlights: [...p.highlights, ""]}))} className="flex items-center gap-1.5 text-xs text-amber-700 font-bold px-3 py-2 bg-white/60 hover:bg-white rounded-lg shadow-sm mt-3">
                             <Plus className="w-4 h-4 text-amber-500" /> Add Bullet
                           </button>
                         )}
                       </div>
                    </div>

                    <div className="mt-4">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Full Description *</label>
                       <textarea rows="6" placeholder="Describe the atmosphere, community, neighbors, and quality of the build..." value={form.description} onChange={handleChange("description")} className="w-full border-2 border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white leading-relaxed font-medium transition-colors resize-none" />
                    </div>
                 </div>
               )}
             </div>
             
             {/* Dynamic Footer */}
             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between gap-4 relative z-10 w-full">
               <button onClick={prevStep} className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${currentStep > 1 ? 'text-slate-600 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300' : 'opacity-0 pointer-events-none'}`}>
                 <ArrowLeft className="w-4 h-4" /> Back
               </button>
               
               {currentStep < STEPS.length ? (
                 <button onClick={nextStep} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all transform active:scale-95">
                   Next Step <ArrowRight className="w-4 h-4" />
                 </button>
               ) : (
                 <button onClick={handleSubmit} disabled={submitting} className="px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full font-bold shadow-lg shadow-green-500/30 flex items-center gap-2 disabled:opacity-70 disabled:scale-100 transition-all transform active:scale-95">
                   {submitting ? "Publishing..." : (editId ? "Update Listing" : "Go Live!")}
                 </button>
               )}
             </div>
          </div>
       </div>
    </div>
  )
}
