// server/models/User.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["member", "owner", "admin"],
      default: "member",
    },

    // ⭐ Verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    // ⭐ Password reset
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },


    // ⭐ Social links
    socials: {
      facebook:  { type: String, default: "", trim: true },
      instagram: { type: String, default: "", trim: true },
      whatsapp:  { type: String, default: "", trim: true },
      tiktok:    { type: String, default: "", trim: true },
    },

    // ⭐ Wishlist
    savedHomes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;