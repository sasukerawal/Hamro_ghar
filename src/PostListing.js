// src/PostListing.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  Home,
  UploadCloud,
  ArrowLeft,
  Loader,
  X,
  ImageIcon,
  AlertCircle,
  MapPin,
  Link,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "./api";
import AddressSuggestionsList from "./AddressSuggestionsList";

export default function PostListing() {
  const { id } = useParams();
  const editId = id || null;
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    navigate("/membership");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const [form, setForm] = useState({
    type: "offer",
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    beds: "",
    baths: "",
    sqft: "",
    furnished: false,
    parking: false,
    internet: false,
    petsAllowed: false,
  });

  // New image files selected by user (with preview URLs)
  const [mediaFiles, setMediaFiles] = useState([]); // [{ file, previewUrl }]
  // Existing images in edit mode
  const [existingImages, setExistingImages] = useState([]);
  // Tracks which existing images to keep (true = keep)
  const [keepExisting, setKeepExisting] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [errors, setErrors] = useState({});

  // Location mode: 'manual' or 'maps'
  const [locationMode, setLocationMode] = useState("manual");
  const [mapsUrl, setMapsUrl] = useState("");
  const [parsedCoords, setParsedCoords] = useState(null); // { lat, lng }

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Parse Google Maps URL client-side
  const parseMapsUrl = (url) => {
    if (!url) return null;
    // Pattern: ...@lat,lng,zoom or ...@lat,lng
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    // Pattern: ?q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    // Pattern: /maps/place/.../lat,lng or ll=lat,lng
    const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    return null;
  };

  const handleMapsUrlChange = (url) => {
    setMapsUrl(url);
    const coords = parseMapsUrl(url);
    setParsedCoords(coords);
  };

  const isWanted = form.type === "wanted";

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
  }, [mediaFiles]);

  // Load listing for edit mode
  useEffect(() => {
    if (!editId) return;
    const fetchListing = async () => {
      try {
        setFetching(true);
        const data = await apiFetch(`/api/listings/${editId}`);
        if (data.listing) {
          const l = data.listing;
          setForm({
            type: l.type || "offer",
            title: l.title || "",
            description: l.description || "",
            price: l.price || "",
            address: l.address || "",
            city: l.city || "",
            beds: l.beds ?? "",
            baths: l.baths ?? "",
            sqft: l.sqft || "",
            furnished: !!l.furnished,
            parking: !!l.parking,
            internet: !!l.internet,
            petsAllowed: !!l.petsAllowed,
          });
          const imgs = l.images || [];
          setExistingImages(imgs);
          setKeepExisting(imgs.map(() => true));
        }
      } catch (err) {
        toast.error("Could not load listing for editing");
        goBack();
      } finally {
        setFetching(false);
      }
    };
    fetchListing();
  }, [editId, goBack]);

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for field on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Add new images — appends to existing selection
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const oversized = files.filter((f) => f.size > MAX_SIZE);
    if (oversized.length > 0) {
      toast.warn(`${oversized.length} file(s) exceed 5 MB and were skipped.`);
    }
    const valid = files.filter((f) => f.size <= MAX_SIZE);
    if (!valid.length) return;

    const remaining = 10 - mediaFiles.length - existingImages.filter((_, i) => keepExisting[i]).length;
    if (remaining <= 0) {
      toast.warn("Maximum 10 images allowed.");
      return;
    }

    const newEntries = valid.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));

    setMediaFiles((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  // Remove a newly added image by index
  const removeNewImage = (idx) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Toggle keeping an existing image
  const toggleExistingImage = (idx) => {
    setKeepExisting((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  // Address suggestions
  const handleSelectSuggestion = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      address: suggestion.label.split(",").slice(0, 3).join(", ").trim(),
      city: suggestion.city || prev.city,
    }));
    setAddressSuggestions([]);
  };

  useEffect(() => {
    const address = form.address?.trim();
    if (!address || address.length < 4) {
      setAddressSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const params = new URLSearchParams();
        params.append("q", address);
        if (form.city?.trim()) params.append("city", form.city.trim());
        const API_BASE =
          process.env.REACT_APP_API_BASE?.trim() || "http://localhost:4000";
        const res = await fetch(
          `${API_BASE}/api/listings/geo/search?${params.toString()}`,
          { signal: controller.signal, credentials: "omit" }
        );
        if (!res.ok) { setAddressSuggestions([]); return; }
        const data = await res.json();
        setAddressSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setAddressLoading(false);
      }
    }, 400);
    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, [form.address, form.city]);

  // Validate and return error map
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price) errs.price = "Price / budget is required";
    if (Number(form.price) <= 0) errs.price = "Price must be greater than 0";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.address.trim()) errs.address = "Address is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));

      // If user provided a Google Maps URL with parsed coords, pass them to backend
      if (locationMode === "maps" && parsedCoords) {
        fd.append("lat", parsedCoords.lat);
        fd.append("lng", parsedCoords.lng);
        if (mapsUrl.trim()) fd.append("mapsUrl", mapsUrl.trim());
      }

      // Attach new image files
      mediaFiles.forEach(({ file }) => fd.append("images", file));

      // In edit mode, send list of existing images to keep
      if (editId) {
        const toKeep = existingImages.filter((_, i) => keepExisting[i]);
        toKeep.forEach((url) => fd.append("keepImages", url));
      }

      const url = editId ? `/api/listings/${editId}` : "/api/listings/create";
      const method = editId ? "PUT" : "POST";

      await apiFetch(url, { method, body: fd });

      toast.success(
        editId ? "Listing updated!" : isWanted ? "Request posted!" : "Listing posted!"
      );
      goBack();
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        toast.info("Please log in to post listings.");
        navigate("/login");
      } else {
        toast.error(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading listing data...</p>
        </div>
      </div>
    );
  }

  const totalImages =
    existingImages.filter((_, i) => keepExisting[i]).length + mediaFiles.length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <Home className="h-8 w-8 text-blue-600" />
        </div>

        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            {editId
              ? form.type === "wanted"
                ? "Edit your request"
                : "Edit your home"
              : "What would you like to do?"}
          </h1>
          <p className="text-sm text-slate-600">
            {editId
              ? "Update details, price, or amenities."
              : "Post a home you have available, or request one you're looking for."}{" "}
            Fields marked with <span className="text-red-500">*</span> are
            required.
          </p>
        </div>

        {/* Type Toggle */}
        {!editId && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            {["offer", "wanted"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  form.type === t
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "offer" ? "Post a Home (Offer)" : "Request a Home (Wanted)"}
              </button>
            ))}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Title */}
          <FormInput
            label={
              isWanted
                ? "Title (e.g., Family looking for 2BHK in Patan) *"
                : "Title (e.g., Modern 2BHK near New Baneshwor) *"
            }
            placeholder={
              isWanted
                ? "Student looking for room in Kathmandu..."
                : "Modern 2BHK near New Baneshwor"
            }
            value={form.title}
            onChange={handleChange("title")}
            error={errors.title}
            maxLength={120}
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isWanted
                ? "Describe what kind of home you need *"
                : "Description *"}
            </label>
            <textarea
              className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[90px] bg-slate-50 ${
                errors.description
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200"
              }`}
              placeholder={
                isWanted
                  ? "Briefly explain your situation, preferred location, move-in date, budget, etc."
                  : "Short description about the home — size, neighbourhood, what's nearby..."
              }
              value={form.description}
              onChange={handleChange("description")}
              maxLength={500}
            />
            <div className="flex justify-between mt-0.5">
              {errors.description ? (
                <FieldError msg={errors.description} />
              ) : (
                <span />
              )}
              <span className="text-[10px] text-slate-400">
                {form.description.length}/500
              </span>
            </div>
          </div>

          {/* Price / Beds / Baths */}
          <div className="grid gap-3 sm:grid-cols-3">
            <FormInput
              label={isWanted ? "Max budget (Rs.) *" : "Monthly rent (Rs.) *"}
              type="number"
              placeholder={isWanted ? "40000" : "45000"}
              value={form.price}
              onChange={handleChange("price")}
              error={errors.price}
              min="0"
            />
            <FormInput
              label={isWanted ? "Min beds" : "Beds"}
              type="number"
              placeholder={isWanted ? "1" : "2"}
              value={form.beds}
              onChange={handleChange("beds")}
              min="0"
            />
            <FormInput
              label={isWanted ? "Min baths" : "Baths"}
              type="number"
              placeholder="1"
              value={form.baths}
              onChange={handleChange("baths")}
              min="0"
            />
          </div>

          {/* Location: tab toggle */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                onClick={() => setLocationMode("manual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  locationMode === "manual"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" /> Manual address
              </button>
              <button
                type="button"
                onClick={() => setLocationMode("maps")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  locationMode === "maps"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Link className="h-3.5 w-3.5" /> Google Maps URL
              </button>
            </div>

            {locationMode === "manual" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  label="City *"
                  placeholder="Kathmandu"
                  value={form.city}
                  onChange={handleChange("city")}
                  error={errors.city}
                />
                <div className="relative z-10">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isWanted ? "Preferred area / address *" : "Address *"}
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 ${
                      errors.address ? "border-red-400 bg-red-50" : "border-slate-200"
                    }`}
                    placeholder={isWanted ? "Sifal, Baneshwor, Lazimpat..." : "Sifal Road, Ward 7..."}
                    value={form.address}
                    onChange={handleChange("address")}
                    autoComplete="off"
                  />
                  {errors.address && <FieldError msg={errors.address} />}
                  {addressLoading && <p className="text-[11px] text-slate-400 mt-1">Searching suggestions…</p>}
                  <AddressSuggestionsList
                    suggestions={addressSuggestions}
                    show={addressSuggestions.length > 0}
                    onSelect={handleSelectSuggestion}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => handleMapsUrlChange(e.target.value)}
                  placeholder="https://www.google.com/maps/place/.../@27.7172,85.3240,..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                {mapsUrl && parsedCoords && (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Coordinates extracted: <strong>{parsedCoords.lat.toFixed(5)}, {parsedCoords.lng.toFixed(5)}</strong>
                  </div>
                )}
                {mapsUrl && !parsedCoords && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Could not extract coordinates. Make sure it's a full Google Maps URL (not a short link).
                  </div>
                )}
                <p className="text-[11px] text-slate-400">You still need to fill in City and Address below for display purposes.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput label="City *" placeholder="Kathmandu" value={form.city} onChange={handleChange("city")} error={errors.city} />
                  <FormInput label="Address (for display) *" placeholder="Eg: Sifal Road" value={form.address} onChange={handleChange("address")} error={errors.address} />
                </div>
              </div>
            )}
          </div>

          {/* Sqft */}
          <FormInput
            label={isWanted ? "Approx. area needed (sqft)" : "Area (sqft)"}
            type="number"
            placeholder="900"
            value={form.sqft}
            onChange={handleChange("sqft")}
            min="0"
          />

          {/* Amenities */}
          <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
            <p className="col-span-full font-semibold mb-1">
              {isWanted ? "Requirements / Preferences" : "Amenities"}
            </p>
            {[
              { field: "furnished", labels: ["Need furnished", "Furnished"] },
              { field: "parking", labels: ["Need parking", "Parking available"] },
              { field: "internet", labels: ["Need internet", "Internet included"] },
              { field: "petsAllowed", labels: ["Pets allowed", "Pets allowed"] },
            ].map(({ field, labels }) => (
              <label key={field} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={form[field]}
                  onChange={handleChange(field)}
                />
                <span>{isWanted ? labels[0] : labels[1]}</span>
              </label>
            ))}
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                {isWanted
                  ? "Photos (optional)"
                  : `Photos (up to 10) — ${totalImages}/10`}
              </label>
            </div>

            {/* Upload drop zone */}
            {totalImages < 10 && (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <UploadCloud className="h-6 w-6 text-blue-500" />
                <span className="text-xs text-slate-600 font-medium">
                  {editId
                    ? "Upload additional photos"
                    : isWanted
                    ? "Click to upload optional photos"
                    : "Click to upload home photos"}
                </span>
                <span className="text-[10px] text-slate-400">
                  JPG, PNG, WEBP • First photo = cover image
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Existing images grid (edit mode) */}
            {editId && existingImages.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Current photos — click ✕ to remove
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Existing ${idx + 1}`}
                        className={`h-20 w-full object-cover rounded-xl border-2 transition-all ${
                          keepExisting[idx]
                            ? "border-blue-400 opacity-100"
                            : "border-red-400 opacity-30"
                        }`}
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/80x80/eff6ff/0f172a?text=Img";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleExistingImage(idx)}
                        className={`absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow ${
                          keepExisting[idx] ? "bg-red-500" : "bg-green-500"
                        }`}
                        title={keepExisting[idx] ? "Remove" : "Keep"}
                      >
                        {keepExisting[idx] ? <X className="h-3 w-3" /> : "✓"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image previews */}
            {mediaFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  New photos — click ✕ to remove
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {mediaFiles.map((entry, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={entry.previewUrl}
                        alt={entry.name}
                        className="h-20 w-full object-cover rounded-xl border-2 border-blue-300"
                      />
                      {idx === 0 && existingImages.filter((_, i) => keepExisting[i]).length === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white shadow hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalImages === 0 && (
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <ImageIcon className="h-3.5 w-3.5" />
                No photos selected yet
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 text-sm bg-white border border-blue-200 rounded-full font-semibold text-blue-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {uploading && <Loader className="h-4 w-4 animate-spin" />}
              {uploading
                ? editId ? "Updating..." : isWanted ? "Posting request..." : "Posting..."
                : editId ? "Update listing"
                : isWanted ? "Post request"
                : "Post home"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Sub-components */

function FormInput({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <input
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-slate-50 ${
          error ? "border-red-400 bg-red-50" : "border-slate-200"
        }`}
        {...props}
      />
      {error && <FieldError msg={error} />}
    </div>
  );
}

function FieldError({ msg }) {
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}
