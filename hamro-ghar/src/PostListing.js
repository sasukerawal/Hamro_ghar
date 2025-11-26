// src/PostListing.js
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Home, UploadCloud, ArrowLeft, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "./api";
import AddressSuggestionsList from "./AddressSuggestionsList";

export default function PostListing() {
  const { id } = useParams(); // /listings/:id/edit → id, /listings/new → undefined
  const editId = id || null;

  const navigate = useNavigate();

  // safe callback for goBack (fixes useEffect dependency error)
  const goBack = useCallback(() => {
    navigate("/membership");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const [form, setForm] = useState({
    type: "offer", // ✅ NEW: Default to offering a home
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

  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Helper to check if we are in "Wanted" mode
  const isWanted = form.type === "wanted";

  // Load listing data for edit mode
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
            beds: l.beds || "",
            baths: l.baths || "",
            sqft: l.sqft || "",
            furnished: !!l.furnished,
            parking: !!l.parking,
            internet: !!l.internet,
            petsAllowed: !!l.petsAllowed,
          });
          setExistingImages(l.images || []);
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
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setMediaFiles(files.slice(0, 10));
  };

  const handleSelectSuggestion = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      address: suggestion.label.split(",").slice(0, 3).join(", ").trim(),
      city: suggestion.city || prev.city,
    }));
    setAddressSuggestions([]);
  };

  // Address Auto-Suggestions
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

        if (!res.ok) {
          setAddressSuggestions([]);
          return;
        }

        const data = await res.json();
        setAddressSuggestions(
          Array.isArray(data.suggestions) ? data.suggestions : []
        );
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setAddressLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [form.address, form.city]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // required fields
    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.address ||
      !form.city
    ) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });
      mediaFiles.forEach((file) => {
        fd.append("images", file);
      });

      const url = editId ? `/api/listings/${editId}` : "/api/listings/create";
      const method = editId ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: fd,
      });

      toast.success(
        editId
          ? "Listing updated!"
          : isWanted
          ? "Request posted!"
          : "Listing posted!"
      );
      goBack();
    } catch (err) {
      console.error(err);
      if (err.message.includes("401")) {
        toast.info("Please log in.");
        navigate("/login");
      } else {
        toast.error(err.message || "Operation failed");
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

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9">
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
          {!editId && (
            <p className="text-sm text-slate-600">
              Post a home you have available, or request a home you&apos;re
              looking for. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          )}
          {editId && (
            <p className="text-sm text-slate-600">
              Update details, price, or amenities. Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          )}
        </div>

        {/* ✅ TYPE TOGGLE SWITCH (only when creating) */}
        {!editId && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  type: "offer",
                }))
              }
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isWanted
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Post a Home (Offer)
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  type: "wanted",
                }))
              }
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isWanted
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Request a Home (Wanted)
            </button>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label={
              isWanted
                ? "Title (e.g., Couple looking for 1BHK in Lazimpat) *"
                : "Title (e.g., Modern 2BHK near New Baneshwor) *"
            }
            placeholder={
              isWanted
                ? "Student looking for room in Kathmandu..."
                : "Modern 2BHK near New Baneshwor"
            }
            value={form.title}
            onChange={handleChange("title")}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isWanted
                ? "Describe what kind of home you need *"
                : "Description *"}
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[90px]"
              placeholder={
                isWanted
                  ? "Briefly explain your situation, preferred location, move-in date, etc."
                  : "Short description about the home..."
              }
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label={
                isWanted ? "Max budget (Rs.) *" : "Monthly rent (Rs.) *"
              }
              type="number"
              placeholder={isWanted ? "40000" : "45000"}
              value={form.price}
              onChange={handleChange("price")}
            />
            <Input
              label={isWanted ? "Min beds" : "Beds"}
              type="number"
              placeholder={isWanted ? "1" : "2"}
              value={form.beds}
              onChange={handleChange("beds")}
            />
            <Input
              label={isWanted ? "Min baths" : "Baths"}
              type="number"
              placeholder={isWanted ? "1" : "1"}
              value={form.baths}
              onChange={handleChange("baths")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="City *"
              placeholder="Kathmandu"
              value={form.city}
              onChange={handleChange("city")}
            />

            {/* Address + shared suggestions UI */}
            <div className="relative z-10">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isWanted
                  ? "Preferred area / address *"
                  : "Address *"}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder={
                  isWanted
                    ? "Sifal, Baneshwor, Lazimpat..."
                    : "Sifal Road, Ward 7..."
                }
                value={form.address}
                onChange={handleChange("address")}
                autoComplete="off"
              />
              {addressLoading && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Searching suggestions…
                </p>
              )}

              <AddressSuggestionsList
                suggestions={addressSuggestions}
                show={addressSuggestions.length > 0}
                onSelect={handleSelectSuggestion}
              />
            </div>
          </div>

          <Input
            label={isWanted ? "Approx. area needed (sqft)" : "Area (sqft)"}
            type="number"
            placeholder="900"
            value={form.sqft}
            onChange={handleChange("sqft")}
          />

          <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
            <p className="col-span-full font-semibold mb-1">
              {isWanted ? "Requirements / Preferences" : "Amenities"}
            </p>
            <Checkbox
              label={isWanted ? "Need furnished" : "Furnished"}
              checked={form.furnished}
              onChange={handleChange("furnished")}
            />
            <Checkbox
              label={isWanted ? "Need parking" : "Parking available"}
              checked={form.parking}
              onChange={handleChange("parking")}
            />
            <Checkbox
              label={isWanted ? "Need internet" : "Internet included"}
              checked={form.internet}
              onChange={handleChange("internet")}
            />
            <Checkbox
              label="Pets allowed"
              checked={form.petsAllowed}
              onChange={handleChange("petsAllowed")}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isWanted
                ? "Photos (optional – e.g., reference home or your profile)"
                : "Photos (up to 10)"}
            </label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50">
              <UploadCloud className="h-6 w-6 text-blue-500" />
              <span>
                {editId
                  ? "Upload new photos to append"
                  : isWanted
                  ? "Click to upload optional reference photos"
                  : "Click to upload home photos"}
              </span>
              <span className="text-[10px] text-slate-400">
                JPG, PNG only. First photo will be used as cover.
              </span>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>

            {mediaFiles.length > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                {mediaFiles.length} new file(s) selected
              </p>
            )}

            {editId && existingImages.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-1">
                {existingImages.length} existing photo(s) will be kept
              </p>
            )}
          </div>

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
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading
                ? editId
                  ? "Updating..."
                  : isWanted
                  ? "Posting request..."
                  : "Posting..."
                : editId
                ? "Update listing"
                : isWanted
                ? "Post request"
                : "Post home"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, type = "text", ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        {...props}
      />
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
