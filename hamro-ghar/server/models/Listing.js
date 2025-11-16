// models/Listing.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic info
    title: { type: String, required: true },
    description: { type: String, required: true },

    price: { type: Number, required: true }, // monthly rent

    address: { type: String, required: true },
    city: { type: String, required: true },

    beds: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    sqft: { type: Number, default: 0 },

    // Amenities
    furnished: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },

    // Listing status
    status: {
      type: String,
      enum: ["active", "unavailable"],
      default: "active",
      index: true,
    },

    // Geo location (from geocoding, if available)
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Images (Cloudinary URLs)
    images: [
      {
        type: String,
      },
    ],

    // Optional video URL
    video: {
      type: String,
      default: "",
    },

    featured: { type: Boolean, default: false },

    // 🔢 View counter
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
