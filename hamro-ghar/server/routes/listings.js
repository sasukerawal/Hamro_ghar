// routes/listings.js
import express from "express";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadListingMedia } from "../config/multer.js";

const router = express.Router();

/* -------------------------------------------------
    Helper: parse body types from multipart/form-data
--------------------------------------------------- */
const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const v = String(value).toLowerCase();
  return v === "true" || v === "1" || v === "on" || v === "yes";
};

/* -------------------------------------------------
    CREATE LISTING (OWNER OR MEMBER)
    Accepts multipart/form-data from PostListing.js
    - Text fields in req.body
    - Files in req.files (field name: "media")
--------------------------------------------------- */
router.post(
  "/create",
  requireAuth,
  uploadListingMedia.array("media", 10),
  async (req, res) => {
    try {
      const ownerId = req.user.id; // from requireAuth

      const {
        title,
        description,
        price,
        address,
        city,
        beds,
        baths,
        sqft,
        furnished,
        parking,
        internet,
        petsAllowed,   // NEW
        video,
        lat,
        lng,
      } = req.body;

      if (!title || !description || !price || !address || !city) {
        return res
          .status(400)
          .json({
            error:
              "Title, description, price, address, and city are required.",
          });
      }

      // Extract image URLs from Cloudinary-uploaded files
      const images = (req.files || []).map((file) => {
        // multer-storage-cloudinary usually sets file.path to the URL
        return file.path || file.secure_url || file.url;
      });

      const listingData = {
        ownerId,
        title,
        description,
        price: toNumber(price),
        address,
        city,
        beds: toNumber(beds, 1),
        baths: toNumber(baths, 1),
        sqft: toNumber(sqft, 0),
        furnished: toBoolean(furnished),
        parking: toBoolean(parking),
        internet: toBoolean(internet),
        petsAllowed: toBoolean(petsAllowed), // NEW
        video: video || "",
        images,
        location: {
          lat: lat !== undefined ? toNumber(lat, null) : null,
          lng: lng !== undefined ? toNumber(lng, null) : null,
        },
      };

      const listing = new Listing(listingData);
      await listing.save();

      res.status(201).json({ message: "Listing created", listing });
    } catch (err) {
      console.error("Create listing error:", err);
      res.status(500).json({ error: "Server error creating listing" });
    }
  }
);

/* -------------------------------------------------
    GET ALL LISTINGS
--------------------------------------------------- */
router.get("/all", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    console.error("Load listings error:", err);
    res.status(500).json({ error: "Failed to load listings" });
  }
});

/* -------------------------------------------------
    GET SINGLE LISTING
--------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: "Error fetching listing" });
  }
});

/* -------------------------------------------------
    SAVE LISTING TO WISHLIST
--------------------------------------------------- */
router.post("/save/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.savedHomes.includes(req.params.id)) {
      user.savedHomes.push(req.params.id);
      await user.save();
    }

    res.json({ message: "Saved to wishlist" });
  } catch (err) {
    console.error("Save home error:", err);
    res.status(500).json({ error: "Failed to save home" });
  }
});

/* -------------------------------------------------
    GET USER SAVED HOMES
--------------------------------------------------- */
router.get("/saved/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedHomes");

    res.json({ saved: user.savedHomes || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to load saved homes" });
  }
});

/* -------------------------------------------------
    DELETE LISTING (OWNER ONLY)
--------------------------------------------------- */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting listing" });
  }
});

export default router;
