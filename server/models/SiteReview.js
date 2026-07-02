// server/models/SiteReview.js
import mongoose from "mongoose";

const siteReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 400 },
  },
  { timestamps: true }
);

// One review per user for the site
siteReviewSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("SiteReview", siteReviewSchema);
