// src/PostListing.js
import React, { useState } from "react";
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
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckboxChange = (field) => (e) => {
    const checked = e.target.checked;
    setForm((prev) => ({ ...prev, [field]: checked }));
  };

  const handleMediaChange = (e) => {
    setMediaFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.price || !form.address || !form.city) {
      toast.error("Please fill required fields (title, price, address, city).");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        fd.append(key, value);
      }
    });

    mediaFiles.forEach((file) => {
      fd.append("media", file);
    });

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:4000/api/listings/create", {
        method: "POST",
        credentials: "include",
        body: fd, // IMPORTANT: no Content-Type header here
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.info("Please log in to post a home.");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Could not create listing");
        return;
      }

      toast.success("Home posted successfully!");
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
    } catch (err) {
      console.error(err);
      toast.error("Server error while creating listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-blue-100 shadow-md px-6 py-7 sm:px-8 sm:py-9">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
          <div className="flex items-center gap-2">
            <Home className="h-7 w-7 text-blue-600" />
            <p className="text-sm font-semibold text-slate-900">
              Post your home
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5">
          Add details about your home. You can upload images and videos.
          Media is stored securely on the server and linked to your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Title *"
              placeholder="Sunny 2BHK in Baneshwor"
              value={form.title}
              onChange={handleChange("title")}
              required
            />
            <Input
              label="Price (Rs) *"
              type="number"
              placeholder="45000"
              value={form.price}
              onChange={handleChange("price")}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="City *"
              placeholder="Kathmandu"
              value={form.city}
              onChange={handleChange("city")}
              required
            />
            <Input
              label="Address *"
              placeholder="Baneshwor-10, Kathmandu"
              value={form.address}
              onChange={handleChange("address")}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Beds *"
              type="number"
              placeholder="2"
              value={form.beds}
              onChange={handleChange("beds")}
              required
            />
            <Input
              label="Baths *"
              type="number"
              placeholder="1"
              value={form.baths}
              onChange={handleChange("baths")}
              required
            />
            <Input
              label="Area (sqft) *"
              type="number"
              placeholder="900"
              value={form.sqft}
              onChange={handleChange("sqft")}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              placeholder="Describe your home, nearby landmarks, available from date, etc."
              value={form.description}
              onChange={handleChange("description")}
              required
            />
          </div>

          {/* Amenities */}
          <div className="grid gap-3 sm:grid-cols-4 text-xs">
            <Checkbox
              label="Furnished"
              checked={form.furnished}
              onChange={handleCheckboxChange("furnished")}
            />
            <Checkbox
              label="Parking"
              checked={form.parking}
              onChange={handleCheckboxChange("parking")}
            />
            <Checkbox
              label="Internet"
              checked={form.internet}
              onChange={handleCheckboxChange("internet")}
            />
            <Checkbox
              label="Pets allowed"
              checked={form.petsAllowed}
              onChange={handleCheckboxChange("petsAllowed")}
            />
          </div>

          {/* Media upload */}
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold text-slate-900">
                Photos &amp; videos
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              You can upload up to 10 files. Supported: images (.jpg, .png) and
              videos (.mp4, .mov).
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="text-[11px] text-slate-700"
            />
            {mediaFiles.length > 0 && (
              <ul className="mt-2 text-[11px] text-slate-600 max-h-24 overflow-y-auto">
                {mediaFiles.map((file, idx) => (
                  <li key={idx} className="truncate">
                    • {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting…" : "Post home"}
          </button>
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
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        {...props}
      />
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 text-slate-700">
      <input
        type="checkbox"
        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
