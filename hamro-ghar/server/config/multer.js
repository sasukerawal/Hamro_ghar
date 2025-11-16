// config/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// Storage for listing images
const listingStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "hamroghar/listings",
      resource_type: "image", // images only
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
  },
});

export const uploadListingMedia = multer({
  storage: listingStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 10,                 // max 10 images
  },
});
