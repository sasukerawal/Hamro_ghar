import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Home, UploadCloud, ArrowLeft, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "./api";
import AddressSuggestionsList from "./AddressSuggestionsList";
import {
  getDistrictOptions,
  getMunicipalityOptions,
  getProvinceOptions,
  HOSTEL_TYPE_LABELS,
  HOSTEL_TYPE_OPTIONS,
  isValidNepalLocation,
} from "./data/nepalLocations";

const EMPTY_FORM = {
  type: "offer",
  category: "home",
  hostelType: "",
  title: "",
  description: "",
  price: "",
  address: "",
  city: "",
  province: "",
  district: "",
  municipality: "",
  beds: "",
  baths: "",
  sqft: "",
  furnished: false,
  parking: false,
  internet: false,
  petsAllowed: false,
};

export default function PostListing() {
  const { id } = useParams();
  const editId = id || null;
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    navigate("/membership");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(editId));
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const provinceOptions = useMemo(() => getProvinceOptions(), []);
  const districtOptions = useMemo(
    () => getDistrictOptions(form.province),
    [form.province]
  );
  const municipalityOptions = useMemo(
    () => getMunicipalityOptions(form.province, form.district),
    [form.province, form.district]
  );

  const isWanted = form.type === "wanted";
  const isHostel = form.category === "hostel";
  const needsFullAddress = !isHostel;

  useEffect(() => {
    if (!editId) {
      return;
    }

    const fetchListing = async () => {
      try {
        setFetching(true);
        const data = await apiFetch(`/api/listings/${editId}`);

        if (data.listing) {
          const listing = data.listing;
          setForm({
            type: listing.type || "offer",
            category: listing.category || "home",
            hostelType: listing.hostelType || "",
            title: listing.title || "",
            description: listing.description || "",
            price: listing.price || "",
            address: listing.address || "",
            city: listing.city || listing.municipality || "",
            province: listing.province || "",
            district: listing.district || "",
            municipality: listing.municipality || listing.city || "",
            beds: listing.beds || "",
            baths: listing.baths || "",
            sqft: listing.sqft || "",
            furnished: Boolean(listing.furnished),
            parking: Boolean(listing.parking),
            internet: Boolean(listing.internet),
            petsAllowed: Boolean(listing.petsAllowed),
          });
          setExistingImages(listing.images || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load listing for editing");
        goBack();
      } finally {
        setFetching(false);
      }
    };

    fetchListing();
  }, [editId, goBack]);

  useEffect(() => {
    const query = form.address.trim();
    if (!query || query.length < 4) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const params = new URLSearchParams();
        params.append("q", query);
        if (form.municipality.trim()) {
          params.append("city", form.municipality.trim());
        }

        const API_BASE =
          process.env.REACT_APP_API_BASE?.trim() || "http://localhost:4000";

        const response = await fetch(
          `${API_BASE}/api/listings/geo/search?${params.toString()}`,
          { signal: controller.signal, credentials: "omit" }
        );

        if (!response.ok) {
          setAddressSuggestions([]);
          return;
        }

        const data = await response.json();
        setAddressSuggestions(
          Array.isArray(data.suggestions) ? data.suggestions : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setAddressLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [form.address, form.municipality]);

  const updateForm = (updater) => {
    setForm((prev) =>
      typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
    );
  };

  const handleFieldChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    updateForm({ [field]: value });
  };

  const handleProvinceChange = (event) => {
    const nextProvince = event.target.value;
    updateForm((prev) => ({
      ...prev,
      province: nextProvince,
      district: "",
      municipality: "",
      city: "",
    }));
    setAddressSuggestions([]);
  };

  const handleDistrictChange = (event) => {
    const nextDistrict = event.target.value;
    updateForm((prev) => ({
      ...prev,
      district: nextDistrict,
      municipality: "",
      city: "",
    }));
    setAddressSuggestions([]);
  };

  const handleMunicipalityChange = (event) => {
    const nextMunicipality = event.target.value;
    updateForm({
      municipality: nextMunicipality,
      city: nextMunicipality,
    });
  };

  const handleModeChange = (mode) => {
    if (mode === "offer") {
      updateForm((prev) => ({
        ...prev,
        type: "offer",
        category: "home",
        hostelType: "",
      }));
      return;
    }

    if (mode === "wanted") {
      updateForm((prev) => ({
        ...prev,
        type: "wanted",
        category: "home",
        hostelType: "",
      }));
      return;
    }

    updateForm((prev) => ({
      ...prev,
      type: "offer",
      category: "hostel",
      hostelType: prev.hostelType || "",
    }));
  };

  const handleHostelTypeChange = (nextHostelType) => {
    updateForm({ hostelType: nextHostelType });
  };

  const handleMediaChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setMediaFiles(files.slice(0, 10));
  };

  const handleSelectSuggestion = (suggestion) => {
    updateForm((prev) => ({
      ...prev,
      address: suggestion.label.split(",").slice(0, 3).join(", ").trim(),
    }));
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      toast.error("Please fill in the title, description, and price");
      return false;
    }

    if (!form.province || !form.district || !form.municipality) {
      toast.error("Province, district, and municipality are required");
      return false;
    }

    if (
      !isValidNepalLocation({
        province: form.province,
        district: form.district,
        municipality: form.municipality,
      })
    ) {
      toast.error("Please choose a matching province, district, and municipality");
      return false;
    }

    if (needsFullAddress && !form.address.trim()) {
      toast.error("Please enter the full address");
      return false;
    }

    if (isHostel && !form.hostelType) {
      toast.error("Please choose whether the hostel is for boys, girls, or mix");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);

      const payload = {
        ...form,
        city: form.municipality,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      mediaFiles.forEach((file) => {
        formData.append("images", file);
      });

      const url = editId ? `/api/listings/${editId}` : "/api/listings/create";
      const method = editId ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: formData,
      });

      toast.success(
        editId
          ? "Listing updated!"
          : isHostel
          ? "Hostel listed!"
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
        return;
      }

      toast.error(err.message || "Operation failed");
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

  const pageTitle = editId
    ? isHostel
      ? "Edit your hostel"
      : isWanted
      ? "Edit your request"
      : "Edit your home"
    : "What would you like to list?";

  const introText = editId
    ? "Update details, price, or location. Fields marked with * are required."
    : "Choose a listing type, then fill in the details. Fields marked with * are required.";

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
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-600">{introText}</p>
        </div>

        {!editId && (
          <div className="grid gap-2 rounded-2xl bg-slate-100 p-1 mb-6 sm:grid-cols-3">
            <ModeButton
              active={!isWanted && !isHostel}
              label="Post a Home"
              onClick={() => handleModeChange("offer")}
            />
            <ModeButton
              active={isWanted}
              label="Request a Home"
              onClick={() => handleModeChange("wanted")}
            />
            <ModeButton
              active={isHostel}
              label="List a Hostel"
              onClick={() => handleModeChange("hostel")}
            />
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isHostel && (
            <div>
              <p className="block text-xs font-semibold text-slate-700 mb-2">
                Hostel category *
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {HOSTEL_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleHostelTypeChange(option)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      form.hostelType === option
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {HOSTEL_TYPE_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label={
              isHostel
                ? "Title (e.g., Clean girls hostel near Pulchowk) *"
                : isWanted
                ? "Title (e.g., Couple looking for 1BHK in Lazimpat) *"
                : "Title (e.g., Modern 2BHK near New Baneshwor) *"
            }
            placeholder={
              isHostel
                ? "Safe mix hostel near college area"
                : isWanted
                ? "Student looking for room in Kathmandu"
                : "Modern 2BHK near New Baneshwor"
            }
            value={form.title}
            onChange={handleFieldChange("title")}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isHostel
                ? "Describe the hostel *"
                : isWanted
                ? "Describe what kind of home you need *"
                : "Description *"}
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-[90px]"
              placeholder={
                isHostel
                  ? "Mention rooms, food, timings, security, and nearby landmarks."
                  : isWanted
                  ? "Briefly explain your situation, preferred location, move-in date, and requirements."
                  : "Short description about the home..."
              }
              value={form.description}
              onChange={handleFieldChange("description")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label={
                isHostel
                  ? "Monthly fee (Rs.) *"
                  : isWanted
                  ? "Max budget (Rs.) *"
                  : "Monthly rent (Rs.) *"
              }
              type="number"
              placeholder={isHostel ? "18000" : isWanted ? "40000" : "45000"}
              value={form.price}
              onChange={handleFieldChange("price")}
            />
            <Input
              label={isWanted ? "Min beds" : isHostel ? "Beds / rooms" : "Beds"}
              type="number"
              placeholder={isWanted ? "1" : "2"}
              value={form.beds}
              onChange={handleFieldChange("beds")}
            />
            <Input
              label={isWanted ? "Min bathrooms" : "Bathrooms"}
              type="number"
              placeholder="1"
              value={form.baths}
              onChange={handleFieldChange("baths")}
            />
          </div>

          <div className="rounded-2xl border border-blue-100 bg-slate-50/70 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Location *
              </p>
              <p className="text-[11px] text-slate-500">
                Province, district, and municipality must match.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SelectInput
                label="Province *"
                value={form.province}
                onChange={handleProvinceChange}
                options={provinceOptions}
                placeholder="Select province"
              />
              <SelectInput
                label="District *"
                value={form.district}
                onChange={handleDistrictChange}
                options={districtOptions}
                placeholder={
                  form.province ? "Select district" : "Choose province first"
                }
                disabled={!form.province}
              />
              <SelectInput
                label="Municipality *"
                value={form.municipality}
                onChange={handleMunicipalityChange}
                options={municipalityOptions}
                placeholder={
                  form.district
                    ? "Select municipality"
                    : "Choose district first"
                }
                disabled={!form.district}
              />
            </div>

            <div className="relative z-20">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {needsFullAddress
                  ? isWanted
                    ? "Preferred area / full address *"
                    : "Full address *"
                  : "Full address (optional)"}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder={
                  isHostel
                    ? "Optional landmark or street name"
                    : isWanted
                    ? "Sifal, Baneshwor, Lazimpat..."
                    : "Sifal Road, Ward 7..."
                }
                value={form.address}
                onChange={(event) => {
                  handleFieldChange("address")(event);
                  setShowAddressSuggestions(true);
                }}
                onFocus={() => setShowAddressSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowAddressSuggestions(false), 180)
                }
                autoComplete="off"
              />
              {addressLoading && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Searching suggestions...
                </p>
              )}
              <AddressSuggestionsList
                suggestions={addressSuggestions}
                show={showAddressSuggestions && addressSuggestions.length > 0}
                onSelect={handleSelectSuggestion}
              />
            </div>
          </div>

          <Input
            label={
              isHostel
                ? "Approx. total area (sqft)"
                : isWanted
                ? "Approx. area needed (sqft)"
                : "Area (sqft)"
            }
            type="number"
            placeholder="900"
            value={form.sqft}
            onChange={handleFieldChange("sqft")}
          />

          <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
            <p className="col-span-full font-semibold mb-1">
              {isWanted ? "Requirements / preferences" : "Amenities"}
            </p>
            <Checkbox
              label={isWanted ? "Need furnished" : "Furnished"}
              checked={form.furnished}
              onChange={handleFieldChange("furnished")}
            />
            <Checkbox
              label={isWanted ? "Need parking" : "Parking available"}
              checked={form.parking}
              onChange={handleFieldChange("parking")}
            />
            <Checkbox
              label={isWanted ? "Need internet" : "Internet included"}
              checked={form.internet}
              onChange={handleFieldChange("internet")}
            />
            <Checkbox
              label="Pets allowed"
              checked={form.petsAllowed}
              onChange={handleFieldChange("petsAllowed")}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isWanted
                ? "Photos (optional)"
                : isHostel
                ? "Hostel photos (up to 10)"
                : "Photos (up to 10)"}
            </label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50">
              <UploadCloud className="h-6 w-6 text-blue-500" />
              <span>
                {editId
                  ? "Upload new photos to append"
                  : isWanted
                  ? "Click to upload optional reference photos"
                  : isHostel
                  ? "Click to upload hostel photos"
                  : "Click to upload home photos"}
              </span>
              <span className="text-[10px] text-slate-400">
                JPG and PNG only. First photo is used as the cover.
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
                  : isHostel
                  ? "Posting hostel..."
                  : isWanted
                  ? "Posting request..."
                  : "Posting..."
                : editId
                ? "Update listing"
                : isHostel
                ? "List hostel"
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

function ModeButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-white text-blue-600 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
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

function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
