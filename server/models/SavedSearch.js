// server/models/SavedSearch.js
import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Human-readable label the user gives their search
        name: {
            type: String,
            trim: true,
            default: "My Search",
        },
        // Snapshot of all active filter values at time of save
        filters: {
            city: { type: String, trim: true },
            district: { type: String, trim: true },
            municipality: { type: String, trim: true },
            province: { type: String, trim: true },
            minPrice: { type: Number },
            maxPrice: { type: Number },
            beds: { type: Number },
            propertyType: { type: String, trim: true },
            listingType: { type: String, trim: true }, // sale/rent
            petsAllowed: { type: Boolean },
            furnished: { type: Boolean },
            amenities: [{ type: String }],
        },
        // How often to notify (daily, weekly, or off)
        alertFrequency: {
            type: String,
            enum: ["daily", "weekly", "off"],
            default: "weekly",
        },
        lastNotifiedAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// One user can have at most 10 saved searches
savedSearchSchema.index({ userId: 1, createdAt: -1 });

const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);
export default SavedSearch;
