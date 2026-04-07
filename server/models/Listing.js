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
    category: {
      type: String,
      enum: ["home", "hostel"],
      default: "home",
      index: true,
    },
    hostelType: {
      type: String,
      enum: ["boys", "girls", "mix", ""],
      default: "",
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
      province: { type: String, enum: ['Koshi Pradesh', 'Madhesh Pradesh', 'Bagmati Pradesh', 'Gandaki Pradesh', 'Lumbini Pradesh', 'Karnali Pradesh', 'Sudurpashchim Pradesh', ''] },
      district: { type: String, trim: true, index: true },
      municipality: { type: String, trim: true, index: true },
      ward: { type: Number, min: 1 },
      tole: { type: String, trim: true }, // e.g., "Baluwatar", "Thamel"
      nearestLandmark: { type: String, trim: true },
      nearestChowk: { type: String, trim: true },
      roadName: { type: String, trim: true },
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
        // Hill units (Ropani system)
        ropani: { type: Number, default: 0 },
        aana: { type: Number, default: 0 },
        paisa: { type: Number, default: 0 },
        daam: { type: Number, default: 0 },
        // Terai units (Bigha system)
        bigha: { type: Number, default: 0 },
        katha: { type: Number, default: 0 },
        dhur: { type: Number, default: 0 },
        // Which system the owner used
        unitSystem: { type: String, enum: ['hills', 'terai', ''], default: '' },
        totalSqFt: { type: Number }, // Normalized value (sq.ft) for backend sorting/filtering
        display: { type: String }    // e.g. "4 Aana 2 Paisa" or "2 Bigha 5 Katha"
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
      attachedBathrooms: { type: Number, min: 0 },
      commonBathrooms: { type: Number, min: 0 },
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
        waterSupply247: { type: Boolean, default: false },
        waterTank: { type: Boolean, default: false },
      },
      electricity: { type: Boolean, default: false },
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

    // Contact Information
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      socialMedia: { type: String, trim: true } // Facebook/Insta link
    },

    // 6. House Rules (structured)
    houseRules: {
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      partiesAllowed: { type: Boolean, default: false },
      guestsLimit: { type: Number, min: 0 },
      quietHoursStart: { type: String, trim: true }, // e.g. "22:00"
      quietHoursEnd: { type: String, trim: true },   // e.g. "06:00"
      shoesOff: { type: Boolean, default: false },
      customRules: [{ type: String, trim: true }],
    },

    // 7. Trust & Analytics
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending_review', 'verified', 'rejected'],
      default: 'unverified',
    },
    verificationNote: { type: String, trim: true }, // Admin context
    completenessScore: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

  },
  {
    timestamps: true,
  }
);

// ── Pre-save: auto-compute completeness score & normalize totalSqFt ──────────
listingSchema.pre('save', function (next) {
  // 1. Compute totalSqFt from whichever unit system is used
  const la = this.specs?.landArea;
  if (la) {
    if (la.unitSystem === 'terai' && (la.bigha > 0 || la.katha > 0 || la.dhur > 0)) {
      // 1 Bigha = 72,900 sqft, 1 Katha = 3,645 sqft, 1 Dhur = 182.25 sqft
      la.totalSqFt = (la.bigha || 0) * 72900 + (la.katha || 0) * 3645 + (la.dhur || 0) * 182.25;
    } else if (la.ropani > 0 || la.aana > 0 || la.paisa > 0 || la.daam > 0) {
      // 1 Ropani = 5476 sqft, 1 Aana = 342.25 sqft, 1 Paisa = 85.56 sqft, 1 Daam = 21.39 sqft
      la.totalSqFt = (la.ropani || 0) * 5476 + (la.aana || 0) * 342.25 + (la.paisa || 0) * 85.56 + (la.daam || 0) * 21.39;
    }
  }

  // 2. Compute completeness score (0–100)
  let score = 0;
  if (this.images && this.images.length > 0) score += 25;
  if (this.description && this.description.length > 50) score += 15;
  if (this.location?.coordinates?.[0] !== 0 || this.location?.coordinates?.[1] !== 0) score += 15;
  if (this.amenities && this.amenities.length > 0) score += 10;
  if (this.contact?.phone || this.contact?.whatsapp || this.contact?.email) score += 10;
  if (this.video || this.videoUrl) score += 10;
  if (this.location?.nearestLandmark || this.location?.nearestChowk) score += 5;
  if (this.specs?.bedrooms > 0 && this.specs?.bathrooms > 0) score += 10;
  this.completenessScore = score;

  next();
});

// ✅ Full 2D geospatial index for "near me" / map search
listingSchema.index({ "location.coordinates": "2dsphere" });

// 🔥 Compound indexes for scaling / scaling advanced V2 search
listingSchema.index({ status: 1, type: 1, propertyType: 1 });
listingSchema.index({ "location.district": 1, "location.municipality": 1, status: 1 });
listingSchema.index({ price: 1, status: 1 });
listingSchema.index({ ownerId: 1, status: 1 });
listingSchema.index({ completenessScore: -1, status: 1 });

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
