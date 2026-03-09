// models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 1. Meta & Status
    type: {
      type: String,
      enum: ["sale", "rent", "offer", "wanted"], // Kept offer/wanted for backward compatibility for now
      required: true,
      default: "sale"
    },
    propertyType: {
      type: String,
      enum: ["land", "house", "apartment", "flat", "room", "commercial"],
      default: "house"
    },
    status: {
      type: String,
      enum: ["draft", "pending_approval", "active", "sold", "rented", "archived", "unavailable"],
      default: "draft",
      index: true,
    },

    // 2. Structured Content
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    highlights: [{ type: String, trim: true }], // Array of bullet points

    // 3. Nepal Location Model (Embedded)
    location: {
      province: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7] },
      district: { type: String, trim: true, index: true },
      municipality: { type: String, trim: true, index: true },
      wardNo: { type: Number, min: 1 },
      locality: { type: String, trim: true }, // e.g., "Bhaisepati"
      landmark: { type: String, trim: true },
      distanceToRingRoadKm: { type: Number },
      // GeoJSON location for map + "near me"
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      isApproximate: { type: Boolean, default: false },
      // Optional explicit lat/lng for easier legacy frontend access
      lat: { type: Number },
      lng: { type: Number },
    },
    // Keep raw backwards-compatible string address fields
    address: { type: String, trim: true },
    city: { type: String, trim: true },

    // 4. Financials
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    priceNegotiable: { type: Boolean, default: true },
    priceHistory: [
      {
        price: { type: Number, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // 5. Property Specs
    specs: {
      landArea: {
        valueSqFt: { type: Number }, // Raw normalized value (sq.ft) for sorting
        display: { type: String }    // e.g. "4 Aana 2 Paisa"
      },
      builtUpAreaSqFt: { type: Number },
      bedrooms: { type: Number, min: 0 },
      bathrooms: { type: Number, min: 0 },
      parking: { type: Number }, // number of cars
      floors: { type: Number },
      facing: { type: String, enum: ["North", "East", "South", "West", "NE", "NW", "SE", "SW", ""] },
      roadAccessFeet: { type: Number },
      roadType: { type: String, enum: ["paved", "gravel", "dirt", "alley", ""] },
      furnishing: { type: String, enum: ["unfurnished", "semi", "fully", ""] }
    },

    // Legacy fields mapped inside specs going forward
    beds: { type: Number, min: 0 },
    baths: { type: Number, min: 0 },
    sqft: { type: Number, min: 0 },

    // Amenities (Legacy bools + extensible)
    furnished: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    parkingFeature: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },

    // Media
    images: [{ type: String }],
    video: { type: String, default: "" },
    mapsUrl: { type: String, default: "" },

    // 6. Trust & Analytics
    isVerified: { type: Boolean, default: false },
    completenessScore: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

  },
  {
    timestamps: true,
  }
);

// ✅ Full 2D geospatial index for "near me" / map search
listingSchema.index({ "location.coordinates": "2dsphere" });

// 🔥 Compound indexes for scaling / scaling advanced V2 search
listingSchema.index({ status: 1, type: 1, propertyType: 1 });
listingSchema.index({ "location.district": 1, "location.municipality": 1, status: 1 });
listingSchema.index({ price: 1, status: 1 });
listingSchema.index({ ownerId: 1, status: 1 });

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
