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
      province: { type: String, enum: ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim', ''] },
      district: { type: String, trim: true, index: true },
      municipality: { type: String, trim: true, index: true },
      ward: { type: Number, min: 1 },
      tole: { type: String, trim: true }, // e.g., "Baluwatar", "Thamel"
      nearestLandmark: { type: String, trim: true },
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
      precision: { type: String, enum: ['exact', 'approximate'], default: 'approximate' },
      
      // Legacy backwards-compatible fields
      ringRoad: { type: String, trim: true },
      hospital: { type: String, trim: true },
      school: { type: String, trim: true },
      bhatbhateni: { type: String, trim: true },
      airport: { type: String, trim: true },
      publicTransport: { type: String, trim: true },
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
        ropani: { type: Number, default: 0 },
        aana: { type: Number, default: 0 },
        paisa: { type: Number, default: 0 },
        daam: { type: Number, default: 0 },
        totalSqFt: { type: Number }, // Raw normalized value (sq.ft) for backend sorting
        display: { type: String }    // e.g. "4 Aana 2 Paisa"
      },
      roadAccess: {
        widthFeet: { type: Number },
        type: { type: String, enum: ['Pitched', 'Gravel', 'Soil', 'Alley', 'None', 'Blacktopped', ''] }
      },
      facing: { type: String, enum: ['East', 'West', 'North', 'South', 'North-East', 'South-East', 'North-West', 'South-West', ''] },
      builtYear: { type: Number },
      
      builtUpAreaSqFt: { type: Number },
      bedrooms: { type: Number, min: 0 },
      bathrooms: { type: Number, min: 0 },
      livingRoom: { type: Number, min: 0 },
      kitchen: { type: Number, min: 0 },
      diningRoom: { type: Number, min: 0 },
      totalFloors: { type: Number, min: 0 },
      floorNumber: { type: Number, min: 0 },
      balcony: { type: Number, min: 0 },
      parking: { type: Number }, // total number of cars
      carParking: { type: Number, min: 0 },
      bikeParking: { type: Number, min: 0 },
      furnishing: { type: String, enum: ["unfurnished", "semi", "fully", "Semi Furnished", "Fully Furnished", "Unfurnished", ""] },
      
      water: {
        available: { type: Boolean, default: false },
        source: { type: String, enum: ['Government', 'Boring', 'Tanker', 'Well', 'Mixed', ''] },
        hotWater: { type: Boolean, default: false },
        drinkingWater: { type: Boolean, default: false },
      },
      wifi: {
        available: { type: Boolean, default: false },
        provider: { type: String, trim: true }
      }
    },

    // Legacy fields mapped inside specs going forward
    beds: { type: Number, min: 0 },
    baths: { type: Number, min: 0 },
    sqft: { type: Number, min: 0 },

    // Amenities (Legacy bools + extensible facilities)
    furnished: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    parkingFeature: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    // New Detailed Facilities & Amenities
    amenities: [{ type: String }],
    nearby: [{ 
      facility: { type: String },
      distance: { type: String }
    }],
    facilities: {
      bikeParking: { type: Number, default: 0 },
      carParking: { type: Number, default: 0 },
      boringWater: { type: Boolean, default: false },
      drinkingWater: { type: Boolean, default: false },
    },

    // Media
    images: [{ type: String }],
    video: { type: String, default: "" }, // Can be local or youtube/tiktok
    videoUrl: { type: String, default: "" }, // Explicit field for Youtube/TikTok URLs
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
