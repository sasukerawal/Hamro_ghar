// routes/listings.js
import express from "express";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadListingMedia } from "../config/multer.js";

const router = express.Router();

/* -------------------------------------------------
   Helpers
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

// 🔍 Geocode address using OpenStreetMap Nominatim
async function geocodeAddress(address, city) {
  if (!address || !city) return null;

  try {
    const query = encodeURIComponent(`${address}, ${city}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=1`;

    const res = await fetch(url, {
      headers: {
        // (optional) put your email here
        "User-Agent": "HamroGharDev/1.0 (contact@example.com)",
      },
    });

    if (!res.ok) {
      console.error("Geocoding HTTP error:", res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const best = data[0];
    return {
      lat: parseFloat(best.lat),
      lng: parseFloat(best.lon),
      displayName: best.display_name,
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

/* -------------------------------------------------
   CREATE LISTING
--------------------------------------------------- */
router.post(
  "/create",
  requireAuth,
  uploadListingMedia.array("media", 10),
  async (req, res) => {
    try {
      const ownerId = req.user.id;

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
        petsAllowed,
        video,
      } = req.body;

      if (!title || !description || !price || !address || !city) {
        return res.status(400).json({
          error:
            "Title, description, price, address, and city are required.",
        });
      }

      // 🌍 Validate address via geocoding
      const geo = await geocodeAddress(address, city);
      if (!geo) {
        return res.status(400).json({
          error:
            "We couldn't verify this address. Please check the spelling or add more details (area, ward, nearby landmark).",
        });
      }

      const images = (req.files || []).map((file) => {
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
        petsAllowed: toBoolean(petsAllowed),
        video: video || "",
        images,
        location: {
          lat: geo.lat,
          lng: geo.lng,
        },
      };

      const listing = new Listing(listingData);
      await listing.save();

      res.status(201).json({
        message: "Listing created",
        listing,
        geocoded: {
          lat: geo.lat,
          lng: geo.lng,
          label: geo.displayName,
        },
      });
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
    console.error("Fetch listing error:", err);
    res.status(500).json({ error: "Error fetching listing" });
  }
});

/* -------------------------------------------------
   GET LISTINGS CREATED BY CURRENT USER
   /api/listings/mine  (because of order, put before /:id)
--------------------------------------------------- */
router.get("/mine/all", requireAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ ownerId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ listings });
  } catch (err) {
    console.error("Load my listings error:", err);
    res.status(500).json({ error: "Failed to load your listings" });
  }
});

/* -------------------------------------------------
   SAVE LISTING TO WISHLIST (ADD)
--------------------------------------------------- */
router.post("/save/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const listingId = req.params.id;

    if (!user.savedHomes.includes(listingId)) {
      user.savedHomes.push(listingId);
      await user.save();
    }

    res.json({ message: "Saved to wishlist", saved: true });
  } catch (err) {
    console.error("Save home error:", err);
    res.status(500).json({ error: "Failed to save home" });
  }
});

/* -------------------------------------------------
   REMOVE LISTING FROM WISHLIST (UNSAVE)
--------------------------------------------------- */
router.delete("/save/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const listingId = req.params.id;
    const before = user.savedHomes.length;

    user.savedHomes = user.savedHomes.filter(
      (id) => id.toString() !== listingId
    );

    if (user.savedHomes.length !== before) {
      await user.save();
    }

    res.json({ message: "Removed from wishlist", saved: false });
  } catch (err) {
    console.error("Unsave home error:", err);
    res.status(500).json({ error: "Failed to remove home" });
  }
});

/* -------------------------------------------------
   GET USER SAVED HOMES
--------------------------------------------------- */
router.get("/saved/me/all", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedHomes");
    res.json({ saved: user.savedHomes || [] });
  } catch (err) {
    console.error("Load saved homes error:", err);
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
      return res.status(403).json({ error: "You can only delete your own listing" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Error deleting listing" });
  }
});

export default router;
