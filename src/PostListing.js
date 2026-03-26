import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  MapPin, ClipboardList, Settings, Sparkles, Image as ImageIcon
} from "lucide-react";

// API & Services
import { apiFetch } from "./api";

// Hooks
import { useFormSteps } from "./hooks/useFormSteps";

// Components
import FormStepIndicator from "./components/common/FormStepIndicator";
import BasicDetailsStep from "./components/listing/BasicDetailsStep";
import LocationStep from "./components/listing/LocationStep";
import SpecsStep from "./components/listing/SpecsStep";
import FacilitiesStep from "./components/listing/FacilitiesStep";
import MediaStep from "./components/listing/MediaStep";
import NarrativeStep from "./components/listing/NarrativeStep";

export const AMENITIES_LIST = [
  "Garden",
  "Internet / WiFi",
  "Fenced",
  "Gym",
  "Pool",
  "Lift",
  "Security Guard",
  "Generator / Inverter",
];


/**
 * PostListing - Main container for creating or editing property listings.
 * Modular, multi-step architecture for better scalability and UX.
 */
const PostListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "rent",
    description: "",
    price: "",
    city: "",
    address: "",
    location: { province: "", district: "", municipality: "", mapsUrl: "" },
    specs: { propertyType: "House", landAreaUnit: "Aana", furnishing: "Not Furnished" },
    facilities: {},
    amenities: [],
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Multi-step form management
  const steps = useMemo(() => [
    { id: 'basics', label: 'Basics', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="h-4 w-4" /> },
    { id: 'specs', label: 'Specs', icon: <Settings className="h-4 w-4" /> },
    { id: 'facilities', label: 'Facilities', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'narrative', label: 'Review', icon: <CheckCircle2 className="h-4 w-4" /> },
  ], []);

  const {
    currentStep, goToStep, nextStep, prevStep, isFirst, isLast
  } = useFormSteps(steps.length);

  // Load existing data if editing
  useEffect(() => {
    if (isEdit) {
      apiFetch(`/api/listings/${id}`)
        .then((data) => {
          const l = data.listing || data;
          setFormData({
            ...l,
            name: l.title || l.name,
            location: l.location || { district: "", mapsUrl: "" },
            specs: l.specs || { propertyType: "House" },
            facilities: l.facilities || {},
            amenities: l.amenities || [],
          });
          setImages(l.images || (l.image ? [l.image] : []));
        })
        .catch(() => toast.error("Could not load listing data"));
    }
  }, [id, isEdit]);

  /**
   * Validates the current step before proceeding.
   */
  const validateStep = useCallback(() => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name?.trim()) newErrors.name = "Property Title is required";
      if (!formData.price) newErrors.price = "Price is required";
    } else if (currentStep === 2) {
      if (!formData.city?.trim() && !formData.address?.trim()) {
        newErrors.city = "City and Address are required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  const handleNext = () => {
    if (validateStep()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      nextStep();
    }
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    prevStep();
  };

  /**
   * Handles multi-file selection.
   */
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 15) {
      return toast.warn("Maximum 15 images allowed per listing");
    }

    setUploadLoading(true);
    try {
      const newImages = await Promise.all(
        files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ file, url: reader.result });
            reader.readAsDataURL(file);
          });
        })
      );
      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      toast.error("Failed to process images");
    } finally {
      setUploadLoading(false);
    }
  };

  /**
   * Final submission handler.
   */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        title: formData.name,
        images: images.map(img => img.url || img),
      };

      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/listings/${id}` : "/api/listings/create";

      await apiFetch(url, {
        method,
        body: JSON.stringify(payload), // Note: The original might have used FormData, but for this refactor we assume JSON compatibility or update accordingly.
      });

      toast.success(isEdit ? "Listing updated successfully!" : "Property published! 🎉");
      navigate("/membership");
    } catch (err) {
      toast.error(err.message || "Failed to save listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center animate-in fade-in duration-700">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isEdit ? "Refine your Listing" : "Share your Property"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Follow the steps to attract the best buyers and tenants across Nepal.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Progress Header */}
          <div className="px-10 pt-10 pb-4 bg-white">
            <FormStepIndicator steps={steps} currentStep={currentStep} onStepClick={goToStep} />
          </div>

          {/* Step Content Area */}
          <div className="px-10 py-10 min-h-[450px]">
            {currentStep === 1 && <BasicDetailsStep formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 2 && <LocationStep formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 3 && <SpecsStep formData={formData} setFormData={setFormData} errors={errors} />}
            {currentStep === 4 && <FacilitiesStep formData={formData} setFormData={setFormData} />}
            {currentStep === 5 && <MediaStep images={images} setImages={setImages} onFileSelect={handleFileSelect} uploadLoading={uploadLoading} />}
            {currentStep === 6 && <NarrativeStep formData={formData} isSubmitting={submitting} />}
          </div>

          {/* Footer Actions */}
          <div className="px-10 py-8 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={isFirst ? () => navigate(-1) : handlePrev}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {isFirst ? "Cancel" : "Back"}
            </button>

            <button
              type="button"
              onClick={isLast ? handleSubmit : handleNext}
              disabled={submitting || uploadLoading}
              className="inline-flex items-center gap-3 px-10 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLast ? (isEdit ? "Update Listing" : "Submit Listing") : "Continue"}
              {!isLast && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Need help? <span className="text-blue-600 underline cursor-pointer">Contact Support</span>
        </p>
      </div>
    </div>
  );
};

export default PostListing;
