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

    title: { type: String, required: true },
    description: { type: String, required: true },

    price: { type: Number, required: true },

    address: { type: String, required: true },
    city: { type: String, required: true },

    // Geo location (lat/lon)
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    beds: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    sqft: { type: Number, default: 0 },

    furnished: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },

    // NEW: pets allowed field
    petsAllowed: { type: Boolean, default: false },

    images: [
      {
        type: String, // Cloudinary or static URL
      },
    ],

    video: {
      type: String, // Optional video link
      default: "",
    },

    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
