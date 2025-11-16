// src/PostListing.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Home, UploadCloud, ArrowLeft } from "lucide-react";

export default function PostListing({ onGoHome }) {
  const [form, setForm] = useState({
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
  const [uploading, setUploading] = useState(false);

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
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
      address: suggestion.label,
      city: suggestion.city || prev.city,
    }));
    setAddressSuggestions([]);
  };

  // 🔍 Address auto-suggestions
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
        if (form.city?.trim()) {
          params.append("city", form.city.trim());
        }

        const res = await fetch(
          `http://localhost:4000/api/listings/geo/search?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setAddressSuggestions([]);
          return;
        }

        const data = await res.json();
        setAddressSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Address suggestions error", err);
        }
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

    if (!form.title || !form.description || !form.price || !form.address || !form.city) {
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
        fd.append("media", file);
      });

      const res = await fetch("http://localhost:4000/api/listings/create", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (res.status === 401) {
        toast.info("Please log in to post a home.");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not create listing");
        return;
      }

      toast.success(data.message || "Listing posted successfully");

      setForm({
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
      setMediaFiles([]);
      setAddressSuggestions([]);
    } catch (err) {
      console.error(err);
      toast.error("Server error while posting listing");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
          <Home className="h-8 w-8 text-blue-600" />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Post a home
          </h1>
          <p className="text-sm text-slate-600">
            Share your flat, room or house with verified renters. Fields marked
            with <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Title *"
            placeholder="Modern 2BHK near New Baneshwor"
            value={form.title}
            onChange={handleChange("title")}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[90px]"
              placeholder="Short description about the home, nearby landmarks, who it is suitable for..."
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Monthly rent (Rs.) *"
              type="number"
              placeholder="45000"
              value={form.price}
              onChange={handleChange("price")}
            />
            <Input
              label="Beds"
              type="number"
              placeholder="2"
              value={form.beds}
              onChange={handleChange("beds")}
            />
            <Input
              label="Baths"
              type="number"
              placeholder="1"
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

            {/* Address + suggestions */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Address *{" "}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="Sifal Road, Ward 7, near police station"
                value={form.address}
                onChange={handleChange("address")}
                autoComplete="off"
              />
              {addressLoading && (
                <p className="mt-1 text-[10px] text-slate-400">
                  Searching suggestions…
                </p>
              )}
              {addressSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-auto">
                  {addressSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      <p className="text-slate-800">{s.label}</p>
                      {s.city && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {s.city}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[10px] text-slate-400">
                Tip: include road/tole + ward + city. Example: &quot;New
                Baneshwor, Ward 10, near BICC, Kathmandu&quot;.
              </p>
            </div>
          </div>

          <Input
            label="Area (sqft)"
            type="number"
            placeholder="900"
            value={form.sqft}
            onChange={handleChange("sqft")}
          />

          {/* Amenities */}
          <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
            <Checkbox
              label="Furnished"
              checked={form.furnished}
              onChange={handleChange("furnished")}
            />
            <Checkbox
              label="Parking available"
              checked={form.parking}
              onChange={handleChange("parking")}
            />
            <Checkbox
              label="Internet included"
              checked={form.internet}
              onChange={handleChange("internet")}
            />
            <Checkbox
              label="Pets allowed"
              checked={form.petsAllowed}
              onChange={handleChange("petsAllowed")}
            />
          </div>

          {/* Media upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photos (up to 10)
            </label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-xs text-slate-500 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40">
              <UploadCloud className="h-6 w-6 text-blue-500" />
              <span>Click to upload home photos</span>
              <span className="text-[10px] text-slate-400">
                JPG, PNG. First photo will be used as cover.
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
              <p className="mt-1 text-[11px] text-slate-500">
                {mediaFiles.length} file
                {mediaFiles.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading ? "Posting…" : "Post home"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------ Reusable inputs ------------------------ */

function Input({ label, type = "text", ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
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
