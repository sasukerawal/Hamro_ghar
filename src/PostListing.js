/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, CheckCircle, Home, MapPin, UploadCloud, X, Plus, Trash
} from "lucide-react";
import { apiFetch } from "./api";
import { DISTRICTS_OF_NEPAL, MUNICIPALITIES, FACING_DIRECTIONS } from "./utils/nepalLocations";

export default function PostListing() {
  const { id } = useParams();
  const editId = id || null;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [fetching, setFetching] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "sale",
    propertyType: "house",
    title: "",
    description: "",
    price: "",
    district: "",
    municipality: "",
    wardNo: "",
    locality: "",
    mapsUrl: "",
    bedrooms: "",
    bathrooms: "",
    builtUpAreaSqFt: "",
    landAreaAana: "",
    roadAccessFeet: "",
    facing: "",
    furnishing: false,
    parking: false,
    internet: false,
    petsAllowed: false,
    highlights: [""] // Default one empty highlight
  });
  
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [keepExisting, setKeepExisting] = useState([]);
  const fileInputRef = useRef(null);

  // loading edit mode
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
            title: l.title || "",
            description: l.description || "",
            price: l.price || "",
            district: l.location?.district || l.city || "",
            municipality: l.location?.municipality || "",
            wardNo: l.location?.wardNo || "",
            locality: l.location?.locality || l.address || "",
            mapsUrl: l.mapsUrl || "",
            bedrooms: l.specs?.bedrooms ?? l.beds ?? "",
            bathrooms: l.specs?.bathrooms ?? l.baths ?? "",
            builtUpAreaSqFt: l.specs?.builtUpAreaSqFt ?? l.sqft ?? "",
            landAreaAana: l.specs?.landAreaAana ?? "",
            roadAccessFeet: l.specs?.roadAccessFeet ?? "",
            facing: l.specs?.facing ?? "",
            furnishing: !!l.furnished || (l.specs?.furnishing === 'fully'),
            parking: !!l.parking || !!l.specs?.parkingFeature,
            internet: !!l.internet,
            petsAllowed: !!l.petsAllowed,
            highlights: l.highlights?.length ? l.highlights : [""]
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

  // Clean preview blob URLs
  useEffect(() => {
    return () => {
      mediaFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, [mediaFiles]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const setHighlight = (idx, val) => {
    setForm(prev => {
      const newH = [...prev.highlights];
      newH[idx] = val;
      return { ...prev, highlights: newH };
    });
  };

  const addHighlight = () => setForm(p => ({ ...p, highlights: [...p.highlights, ""] }));
  const removeHighlight = (idx) => setForm(p => {
    const newH = p.highlights.filter((_, i) => i !== idx);
    if (!newH.length) newH.push("");
    return { ...p, highlights: newH };
  });

  const uploadImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    const valid = files.filter(f => f.size <= MAX_SIZE);
    
    const remaining = 10 - mediaFiles.length - existingImages.filter((_, i) => keepExisting[i]).length;
    if (valid.length > remaining) toast.warn(`Only ${remaining} images allowed.`);
    
    const newEntries = valid.slice(0, remaining).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name
    }));
    setMediaFiles(prev => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (idx) => setMediaFiles(prev => prev.filter((_, i) => i !== idx));
  const toggleExistingImage = (idx) => setKeepExisting(prev => prev.map((v, i) => i === idx ? !v : v));

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.description.trim()) return "Description is required";
    }
    if (step === 2) {
      if (!form.district) return "District is required";
      if (!form.municipality) return "Municipality is required";
      if (!form.locality) return "Locality/Tole is required";
    }
    if (step === 3) {
      if (!form.price || Number(form.price) <= 0) return "Valid Price is required";
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
    const err = validateStep(3); // validate current step before submitting
    if (err) return toast.error(err);

    try {
      setSubmitting(true);
      const fd = new FormData();
      
      const locationJSON = JSON.stringify({
        district: form.district,
        municipality: form.municipality,
        wardNo: form.wardNo ? Number(form.wardNo) : undefined,
        locality: form.locality
      });
      const specsJSON = JSON.stringify({
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        builtUpAreaSqFt: form.builtUpAreaSqFt ? Number(form.builtUpAreaSqFt) : undefined,
        landAreaAana: form.landAreaAana ? Number(form.landAreaAana) : undefined,
        roadAccessFeet: form.roadAccessFeet ? Number(form.roadAccessFeet) : undefined,
        facing: form.facing,
        furnishing: form.furnishing ? 'fully' : 'unfurnished',
        parking: form.parking ? 1 : 0
      });

      fd.append("type", form.type);
      fd.append("propertyType", form.propertyType);
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("location", locationJSON);
      fd.append("specs", specsJSON);
      fd.append("mapsUrl", form.mapsUrl.trim());
      fd.append("highlights", JSON.stringify(form.highlights.filter(h => h.trim())));
      fd.append("internet", form.internet);
      fd.append("petsAllowed", form.petsAllowed);

      // Add files
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
      toast.success(editId ? "Listing updated!" : "Listing live!");
      navigate("/membership");
    } catch (e) {
      toast.error(e.message || "Failed to post listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center py-20 animate-pulse text-blue-600 font-bold tracking-widest uppercase">Loading editor...</div></div>;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-5rem)] py-8 px-4 font-sans text-slate-800">
       <div className="max-w-3xl mx-auto">

          {/* Header & Breadcrumb */}
          <div className="flex items-center gap-4 mb-6">
             <button onClick={() => navigate("/membership")} className="p-2 bg-white rounded-full shadow-sm hover:text-blue-600 transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
               <h1 className="text-2xl font-extrabold tracking-tight">{editId ? "Edit Listing" : "Post a New Listing"}</h1>
               <p className="text-sm text-slate-500 font-medium">Provide high-quality details for higher conversions.</p>
             </div>
          </div>

          {/* Timeline / Progress */}
          <div className="bg-white p-4 sm:p-5 text-sm rounded-2xl shadow-sm mb-6 flex justify-between overflow-x-auto gap-4 scrollbar-hide border border-slate-100">
             {["Basics", "Location", "Specs", "Media"].map((t, i) => {
                const isActive = currentStep === i + 1;
                const isPast = currentStep > i + 1;
                return (
                  <div key={i} className={`font-bold whitespace-nowrap min-w-max flex items-center gap-2 transition-colors ${isActive ? 'text-blue-600' : isPast ? 'text-slate-700' : 'text-slate-300'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-blue-600 text-white shadow-md' : isPast ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 border'}`}>
                       {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : (i + 1)}
                    </div>
                    {t}
                  </div>
                )
             })}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
             
             {/* Content Area */}
             <div className="relative z-10">
               {currentStep === 1 && (
                 <Step1Basics form={form} handleChange={handleChange} />
               )}
               {currentStep === 2 && (
                 <Step2Location form={form} handleChange={handleChange} />
               )}
               {currentStep === 3 && (
                 <Step3Specs form={form} handleChange={handleChange} />
               )}
               {currentStep === 4 && (
                 <Step4Media 
                   form={form} addHighlight={addHighlight} removeHighlight={removeHighlight} setHighlight={setHighlight}
                   mediaFiles={mediaFiles} existingImages={existingImages} keepExisting={keepExisting}
                   uploadImages={uploadImages} removeNewImage={removeNewImage} toggleExistingImage={toggleExistingImage}
                   fileRef={fileInputRef}
                 />
               )}
             </div>
             
             {/* Footer Nav */}
             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between gap-4 relative z-10">
               {currentStep > 1 ? (
                 <button onClick={prevStep} className="px-6 py-3 rounded-full font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
                   <ArrowLeft className="w-4 h-4" /> Back
                 </button>
               ) : <div />}
               
               {currentStep < 4 ? (
                 <button onClick={nextStep} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all transform active:scale-95">
                   Next Step <ArrowRight className="w-4 h-4" />
                 </button>
               ) : (
                 <button onClick={handleSubmit} disabled={submitting} className="px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:scale-100 transition-all transform active:scale-95">
                   {submitting ? "Publishing..." : (editId ? "Update Listing" : "Go Live!")}
                 </button>
               )}
             </div>
          </div>
       </div>
    </div>
  )
}

function Step1Basics({ form, handleChange }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
         <h2 className="text-2xl font-extrabold mb-1">The Basics</h2>
         <p className="text-sm text-slate-500 font-medium">Let's start with the fundamental structure of your listing.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Deal Type *</label>
            <select value={form.type} onChange={handleChange("type")} className="w-full border-2 border-slate-200 outline-none p-3.5 rounded-xl font-bold focus:border-blue-500 text-slate-800 focus:bg-white bg-slate-50 transition-colors">
               <option value="sale">For Sale (Sell)</option>
               <option value="rent">For Rent</option>
            </select>
         </div>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Property Type *</label>
            <select value={form.propertyType} onChange={handleChange("propertyType")} className="w-full border-2 border-slate-200 outline-none p-3.5 rounded-xl font-bold focus:border-blue-500 text-slate-800 focus:bg-white bg-slate-50 transition-colors">
               <option value="house">House</option>
               <option value="apartment">Apartment / Flat</option>
               <option value="land">Land / Plot</option>
               <option value="commercial">Commercial Space</option>
               <option value="room">Room</option>
            </select>
         </div>
      </div>

      <div>
         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Custom Title (Optional)</label>
         <input type="text" placeholder="Leave blank to auto-generate from specs (Recommended)" value={form.title} onChange={handleChange("title")} className="w-full border-2 border-slate-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-medium transition-colors" />
      </div>

      <div>
         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Description *</label>
         <p className="text-xs text-slate-400 mb-2 font-medium">Highlight key selling points, neighborhood atmosphere, etc.</p>
         <textarea rows="5" placeholder="Step into this beautifully maintained..." value={form.description} onChange={handleChange("description")} className="w-full border-2 border-slate-200 p-3.5 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white leading-relaxed font-medium transition-colors resize-none" />
      </div>
    </div>
  );
}

function Step2Location({ form, handleChange }) {
  const municipalities = MUNICIPALITIES[form.district] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div>
         <h2 className="text-2xl font-extrabold mb-1">Exact Location</h2>
         <p className="text-sm text-slate-500 font-medium">Buyers filter heavily by location. Try to be as precise as possible.</p>
       </div>
       
       <div className="grid md:grid-cols-2 gap-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">District *</label>
           <select value={form.district} onChange={handleChange("district")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold text-slate-800">
             <option value="">Select District</option>
             {DISTRICTS_OF_NEPAL.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
         </div>
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Municipality / City *</label>
           {municipalities.length > 0 ? (
             <select value={form.municipality} onChange={handleChange("municipality")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-bold text-slate-800">
               <option value="">Select City</option>
               {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
           ) : (
             <input type="text" placeholder="Type city name" value={form.municipality} onChange={handleChange("municipality")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-medium" />
           )}
         </div>
       </div>

       <div className="grid grid-cols-3 gap-4">
         <div className="col-span-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Ward No</label>
           <input type="number" min="1" max="35" placeholder="Eg. 10" value={form.wardNo} onChange={handleChange("wardNo")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-medium text-center" />
         </div>
         <div className="col-span-2">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Locality / Tole *</label>
           <input type="text" placeholder="Eg. Shantinagar, Shrijana Chowk" value={form.locality} onChange={handleChange("locality")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-medium" />
         </div>
       </div>

       <div className="bg-slate-50 p-5 mt-2 border border-slate-100 rounded-xl space-y-2">
         <label className="text-sm font-bold flex items-center gap-2 text-slate-700">
           <span className="bg-blue-100/50 p-1.5 rounded-lg"><MapPin className="w-4 h-4 text-blue-600" /></span> 
           Google Maps URL (Optional but recommended)
         </label>
         <p className="text-xs text-slate-500 font-medium mb-3">Paste a link, and we'll extract the exact coordinates to show a map.</p>
         <input type="url" placeholder="https://www.google.com/maps/place/..." value={form.mapsUrl} onChange={handleChange("mapsUrl")} className="w-full border-2 border-slate-300 focus:border-blue-400 p-3 rounded-lg text-sm outline-none bg-white font-mono shadow-sm transition-colors" />
       </div>
    </div>
  );
}

function Step3Specs({ form, handleChange }) {
  const isLand = form.propertyType === "land";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div>
         <h2 className="text-2xl font-extrabold mb-1">Property Specifications</h2>
         <p className="text-sm text-slate-500 font-medium">Accurate details help match you with serious buyers.</p>
       </div>
       
       <div className="bg-blue-50/70 border border-blue-100 p-6 rounded-2xl relative overflow-hidden">
         <label className="text-xs uppercase tracking-widest text-blue-600 font-black block mb-2">{form.type === 'rent' ? 'Monthly Rent (Rs.) *' : 'Total Price (Rs.) *'}</label>
         <div className="relative z-10">
           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">Rs.</span>
           <input type="number" min="0" placeholder="e.g. 5000000" value={form.price} onChange={handleChange("price")} className="w-full border-2 border-transparent outline-none focus:border-blue-400 p-4 pl-14 rounded-xl text-2xl font-black text-slate-800 bg-white shadow-sm transition-colors" />
         </div>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
         {!isLand && (
           <>
             <div>
               <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Bedrooms</label>
               <input type="number" min="0" placeholder="0" value={form.bedrooms} onChange={handleChange("bedrooms")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 focus:bg-white transition-colors text-lg font-bold text-center" />
             </div>
             <div>
               <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Bathrooms</label>
               <input type="number" min="0" placeholder="0" value={form.bathrooms} onChange={handleChange("bathrooms")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 focus:bg-white transition-colors text-lg font-bold text-center" />
             </div>
             <div>
               <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Built Area (SqFt)</label>
               <input type="number" min="0" placeholder="e.g. 1500" value={form.builtUpAreaSqFt} onChange={handleChange("builtUpAreaSqFt")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 focus:bg-white transition-colors font-bold" />
             </div>
           </>
         )}
         
         <div>
           <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Land Area (Aana/Dhur)</label>
           <input type="number" step="0.1" min="0" placeholder="e.g. 4.5" value={form.landAreaAana} onChange={handleChange("landAreaAana")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 focus:bg-white transition-colors font-bold" />
         </div>
         <div>
           <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Road Access (Feet)</label>
           <input type="number" min="0" placeholder="e.g. 13" value={form.roadAccessFeet} onChange={handleChange("roadAccessFeet")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 focus:bg-white transition-colors font-bold" />
         </div>
         <div>
           <label className="text-[10px] font-bold block mb-1.5 text-slate-400 uppercase tracking-widest">Facing</label>
           <select value={form.facing} onChange={handleChange("facing")} className="w-full border-2 border-slate-200 p-3.5 outline-none rounded-xl bg-slate-50 focus:border-blue-400 focus:bg-white transition-colors font-bold text-slate-700">
             <option value="">Any / Unsure</option>
             {FACING_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
         </div>
       </div>

       <div className="pt-2 grid grid-cols-2 gap-3 text-sm mt-4">
         {!isLand && (
           <label className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold">
             <input type="checkbox" checked={form.furnishing} onChange={handleChange("furnishing")} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
             <span>Fully Furnished</span>
           </label>
         )}
         <label className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold">
           <input type="checkbox" checked={form.parking} onChange={handleChange("parking")} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
           <span>Parking Area</span>
         </label>
         <label className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold">
           <input type="checkbox" checked={form.internet} onChange={handleChange("internet")} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
           <span>Internet Access</span>
         </label>
         <label className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold">
           <input type="checkbox" checked={form.petsAllowed} onChange={handleChange("petsAllowed")} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
           <span>Pets Allowed</span>
         </label>
       </div>
    </div>
  );
}

function Step4Media({ form, setHighlight, addHighlight, removeHighlight, mediaFiles, existingImages, keepExisting, uploadImages, removeNewImage, toggleExistingImage, fileRef }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
       <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-7 border border-amber-200/60 rounded-3xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-amber-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
         <h2 className="text-xl font-extrabold mb-1 text-amber-900 relative z-10">Selling Highlights</h2>
         <p className="text-xs font-semibold text-amber-700/80 mb-5 max-w-sm relative z-10">Add up to 5 punchy bullet points to instantly grab attention.</p>
         
         <div className="space-y-3 relative z-10">
           {form.highlights.map((h, i) => (
              <div key={i} className="flex gap-2 items-center group">
                 <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0 shadow-sm" />
                 <input type="text" value={h} onChange={e => setHighlight(i, e.target.value)} placeholder="e.g. 5 mins walk to Ring Road" className="flex-1 border-b-2 border-amber-200 focus:border-amber-500 p-2 text-sm outline-none bg-transparent transition-colors font-bold text-amber-950 placeholder:text-amber-900/40" />
                 <button onClick={() => removeHighlight(i)} className="text-amber-300 hover:text-red-500 p-2 transition-colors duration-200"><Trash className="w-4 h-4" /></button>
              </div>
           ))}
           {form.highlights.length < 5 && (
             <button onClick={addHighlight} className="flex items-center gap-1.5 text-xs text-amber-700 font-bold px-3 py-2 bg-white/60 hover:bg-white rounded-lg shadow-sm transition-colors mt-3">
               <Plus className="w-4 h-4 text-amber-500" /> Add Another
             </button>
           )}
         </div>
       </div>

       <div className="pt-2">
         <div className="flex justify-between items-end mb-4 px-1">
            <div>
               <h2 className="text-xl font-extrabold mb-1">Upload Photos</h2>
               <p className="text-sm font-medium text-slate-500">The first photo will be the main cover image.</p>
            </div>
            <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">{mediaFiles.length + existingImages.filter((_, i) => keepExisting[i]).length} / 10 Max</span>
         </div>
         
         {mediaFiles.length + existingImages.filter((_, i) => keepExisting[i]).length < 10 && (
           <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 rounded-3xl flex flex-col items-center justify-center py-10 px-4 cursor-pointer transition-colors outline-none focus-within:ring-4 focus-within:ring-blue-100 group">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                 <UploadCloud className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-sm font-extrabold text-blue-700 block bg-white px-5 py-2 rounded-full border border-blue-100">Click to Select Photos</span>
              <span className="text-xs font-semibold text-slate-400 mt-3">JPG, PNG, WEBP allowed (Max 5MB each)</span>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileRef} onChange={uploadImages} />
           </label>
         )}

         {(mediaFiles.length > 0 || existingImages.length > 0) && (
           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {existingImages.map((src, i) => (
                 <div key={'old-'+i} className="relative aspect-[4/3] group rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                    <img src={src} className={`w-full h-full object-cover transition-all duration-300 ${keepExisting[i] ? 'opacity-100' : 'opacity-20 grayscale'}`} alt="" />
                    <button onClick={() => toggleExistingImage(i)} className={`absolute top-2 right-2 p-1.5 shadow-md rounded-full text-white transition-transform hover:scale-110 z-10 ${keepExisting[i] ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                       {keepExisting[i] ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                    {i === 0 && keepExisting[i] && <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">COVER</span>}
                 </div>
              ))}
              {mediaFiles.map((m, i) => (
                 <div key={'new-'+i} className="relative aspect-[4/3] group rounded-xl overflow-hidden shadow-sm border-2 border-blue-400 bg-white">
                    <img src={m.previewUrl} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => removeNewImage(i)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 shadow-md text-white p-1.5 rounded-full transition-transform hover:scale-110 z-10"><X className="w-3.5 h-3.5" /></button>
                    {i === 0 && existingImages.filter((_, id) => keepExisting[id]).length === 0 && <span className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded backdrop-blur-sm shadow-sm opacity-100">COVER</span>}
                 </div>
              ))}
           </div>
         )}
       </div>
    </div>
  );
}
