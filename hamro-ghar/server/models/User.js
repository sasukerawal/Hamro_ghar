// server/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },

    // hashed password (set in auth routes)
    passwordHash: { type: String, required: true },

    // basic role system (you already had this)
    role: {
      type: String,
      enum: ['user', 'member', 'admin'],
      default: 'member',
    },

    // 🔹 NEW FIELDS for profile page
    phone: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String, // URL to avatar/profile image
      trim: true,
    },

    // 🔹 saved homes (we’ll actually use this later)
    savedHomes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing', // we'll create Listing model later
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
