import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    sponsorName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true, // E.g., Cloudinary URL or direct string
    },
    targetUrl: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      enum: ['hero', 'sidebar', 'feed'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true, // When the ad campaign ends
    },
    metrics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Advertisement', advertisementSchema);
