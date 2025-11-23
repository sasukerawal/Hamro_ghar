// models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic info
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

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Every time price changes we append a new entry here
    priceHistory: [
      {
        price: { type: Number, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // Property details
    beds: {
      type: Number,
      required: true,
      min: 0,
    },
    baths: {
      type: Number,
      required: true,
      min: 0,
    },
    sqft: {
      type: Number,
      min: 0,
    },

    // Address / location
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Amenities
    furnished: {
      type: Boolean,
      default: false,
    },
    internet: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },

    // Media
    images: [
      {
        type: String,
      },
    ],
    video: {
      type: String,
      default: "",
    },

    // Status / meta
    status: {
      type: String,
      enum: ["active", "unavailable"],
      default: "active",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// For future "near me" and map features
listingSchema.index({ "location.lat": 1, "location.lng": 1 });

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
