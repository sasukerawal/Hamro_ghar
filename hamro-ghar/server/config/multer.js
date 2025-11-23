// config/multer.js
import multer from "multer";
// We need to import v2 explicitly for storage setup
import { v2 as cloudinary } from "cloudinary"; 
import { CloudinaryStorage } from "multer-storage-cloudinary"; 
import cloudinaryConfig from "./cloudinary.js"; // Import the configured instance

// NOTE: The previous disk storage logic is replaced by the Cloudinary Storage engine.
// This is more robust as it bypasses local disk saving and handles cleanup automatically.

// Use the cloudinary instance configured in cloudinary.js
const cloudinaryInstance = cloudinary;

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryInstance,
  params: {
    folder: "hamroghar/listings", // Define a dedicated folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, crop: "limit" }], // Optimize image size
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    // Return error if file is not an image
    cb(new Error("Only image files are allowed"), false);
  }
};

export const uploadListingMedia = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});