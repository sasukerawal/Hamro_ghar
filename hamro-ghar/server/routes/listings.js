// routes/listings.js
import express from "express";
import Listing from "../models/Listing.js";
import { uploadListingMedia } from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================================
   Helpers
========================================= */

// Safely parse numbers
function toNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Get user id from request (supports multiple auth styles)
function getUserId(req) {
  if (req.user && req.user.id) return req.user.id;
  if (req.user && req.user._id) return req.user._id;
  if (req.auth && req.auth.id) return req.auth.id;
  return req.body.userId || req.headers["x-user-id"] || null;
}

/* =========================================
   Geocoding (Nominatim / OSM)
========================================= */

const GEOCODE_ENDPOINT = "https://nominatim.openstreetmap.org/search?format=json";

// Server-side geocoding used when creating a listing (limit = 1)
async function forwardGeocode(address, city) {
  const q = [address, city].filter(Boolean).join(", ");
  if (!q) return null;

  const url = `${GEOCODE_ENDPOINT}&limit=1&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HamroGhar/1.0 (educational project)",
      },
    });

    if (!res.ok) {
      console.error("Geocode HTTP error:", res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const first = data[0];
    const lat = Number(first.lat);
    const lon = Number(first.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    return { lat, lng: lon };
  } catch (err) {
    console.error("Geocode error:", err);
    return null;
  }
}

/* =========================================
   1. GET /geo/search
   Address suggestions (limit = 5)
========================================= */

router.get("/geo/search", async (req, res) => {
  try {
    const { q, city } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const fullQuery = [q, city].filter(Boolean).join(", ");

    // For frontend suggestions, we want multiple results
    const url = `${GEOCODE_ENDPOINT}&limit=5&q=${encodeURIComponent(fullQuery)}`;

    const fetchRes = await fetch(url, {
      headers: {
        "User-Agent": "HamroGhar/1.0 (educational project)",
      },
    });

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({
        error: "Geocoding service unavailable or query failed.",
      });
    }

    const data = await fetchRes.json();

    const suggestions = data.map((item) => ({
      id: item.place_id,
      label: item.display_name,
      city: item.address?.city || item.address?.town || item.address?.village,
      lat: Number(item.lat),
      lng: Number(item.lon),
    }));

    res.json({ suggestions });
  } catch (err) {
    console.error("Geosearch route error:", err);
    res.status(500).json({ error: "Server failed to process geocoding request" });
  }
});

/* =========================================
   2. POST /create
   Create a new listing (with images)
========================================= */

router.post(
  "/create",
  requireAuth,
  uploadListingMedia.array("images", 10),
  async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const {
        title,
        description,
        price,
        beds,
        baths,
        sqft,
        address,
        city,
        furnished,
        internet,
        parking,
        petsAllowed,
        video,
      } = req.body;

      if (!description || !address || !city || !price) {
        return res.status(400).json({
          error: "description, address, city, and price are required",
        });
      }

      // Convert to numbers safely
      const numericPrice = toNumber(price);
      const numericBeds = toNumber(beds, 1);
      const numericBaths = toNumber(baths, 1);
      const numericSqft = toNumber(sqft);

      if (!numericPrice || numericPrice <= 0) {
        return res
          .status(400)
          .json({ error: "price must be a positive number" });
      }

      // Images handled by Multer + CloudinaryStorage
      const uploadedImages = [];
      if (Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          if (file.path) {
            uploadedImages.push(file.path); // file.path is secure_url from Cloudinary
          }
        }
      }

      // Geo-code the address (best-effort)
      const geo = await forwardGeocode(address, city);

      const listing = new Listing({
        ownerId: userId,
        title: title?.trim() || "Untitled listing",
        description: description?.trim(),
        price: numericPrice,
        beds: numericBeds,
        baths: numericBaths,
        sqft: numericSqft,
        address: address?.trim(),
        city: city?.trim(),
        location: geo
          ? {
              lat: geo.lat,
              lng: geo.lng,
            }
          : undefined,
        // booleans – kept same as your working setup
        furnished: !!furnished,
        internet: !!internet,
        parking: !!parking,
        petsAllowed:
          petsAllowed !== undefined && petsAllowed !== "false" && !!petsAllowed,
        images: uploadedImages,
        video: video || "",
        status: "active",
      });

      // Initialize price history with the first price entry
      if (typeof listing.price === "number" && !listing.priceHistory?.length) {
        listing.priceHistory = [
          {
            price: listing.price,
            changedAt: new Date(),
          },
        ];
      }

      await listing.save();

      res.status(201).json({
        message: "Listing created",
        listing,
      });
    } catch (err) {
      console.error("Create listing error:", err);
      res.status(500).json({ error: "Failed to create listing" });
    }
  }
);

/* =========================================
   3. PUT /:id
   Update an existing listing (owner only)
========================================= */

router.put(
  "/:id",
  requireAuth,
  uploadListingMedia.array("images", 10),
  async (req, res) => {
    try {
      const userId = getUserId(req);
      const listingId = req.params.id;

      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      if (String(listing.ownerId) !== String(userId)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const {
        title,
        description,
        price,
        beds,
        baths,
        sqft,
        address,
        city,
        furnished,
        internet,
        parking,
        petsAllowed,
      } = req.body;

      // Parse numbers
      if (price) listing.price = Number(price);
      if (beds) listing.beds = Number(beds);
      if (baths) listing.baths = Number(baths);
      if (sqft) listing.sqft = Number(sqft);

      // Update strings
      if (title) listing.title = title.trim();
      if (description) listing.description = description.trim();
      if (address) listing.address = address.trim();
      if (city) listing.city = city.trim();

      // Update booleans
      if (furnished !== undefined)
        listing.furnished = furnished === "true" || furnished === true;
      if (internet !== undefined)
        listing.internet = internet === "true" || internet === true;
      if (parking !== undefined)
        listing.parking = parking === "true" || parking === true;
      if (petsAllowed !== undefined)
        listing.petsAllowed =
          petsAllowed === "true" || petsAllowed === true;

      // Append new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((f) => f.path);
        listing.images = [...listing.images, ...newImages];
      }

      await listing.save();
      res.json({ message: "Listing updated", listing });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: "Update failed" });
    }
  }
);

/* =========================================
   4. GET /stats
   Simple stats for hero card etc.
========================================= */

router.get("/stats", async (req, res) => {
  try {
    const activeFilter = { status: "active" };

    const totalActive = await Listing.countDocuments(activeFilter);

    const recent = await Listing.find(activeFilter)
      .sort({ createdAt: -1 })
      .limit(50);

    const avgPrice =
      recent.length > 0
        ? Math.round(
            recent.reduce((sum, l) => sum + (l.price || 0), 0) / recent.length
          )
        : 0;

    const avgViews =
      recent.length > 0
        ? Math.round(
            recent.reduce((sum, l) => sum + (l.views || 0), 0) / recent.length
          )
        : 0;

    res.json({
      totalActive,
      avgPrice,
      avgViews,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to load listing stats" });
  }
});

/* =========================================
   5. GET /all
   Public listings with filters
========================================= */

router.get("/all", async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      beds,
      baths,
      furnished,
      internet,
      parking,
      petsAllowed,
      status,
      limit,
    } = req.query;

    const query = {};

    // 🔍 Address + city search using same input (supports full address text too)
    if (city && city.trim()) {
      const pattern = new RegExp(city.trim(), "i");
      query.$or = [
        { city: pattern },
        { address: pattern },
      ];
    }

    const priceQuery = {};
    const minP = toNumber(minPrice);
    const maxP = toNumber(maxPrice);

    if (minP !== undefined) priceQuery.$gte = minP;
    if (maxP !== undefined) priceQuery.$lte = maxP;
    if (Object.keys(priceQuery).length > 0) {
      query.price = priceQuery;
    }

    const bedsN = toNumber(beds);
    const bathsN = toNumber(baths);

    if (bedsN !== undefined) query.beds = { $gte: bedsN };
    if (bathsN !== undefined) query.baths = { $gte: bathsN };

    if (furnished === "true") query.furnished = true;
    if (internet === "true") query.internet = true;
    if (parking === "true") query.parking = true;
    if (petsAllowed === "true") query.petsAllowed = true;

    query.status = status || "active";

    const limitN = toNumber(limit, 30);

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(limitN);

    res.json({ listings });
  } catch (err) {
    console.error("Get all listings error:", err);
    res.status(500).json({ error: "Failed to load listings" });
  }
});

/* =========================================
   6. GET /featured
========================================= */

router.get("/featured", async (req, res) => {
  try {
    const listings = await Listing.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(9);

    res.json({ listings });
  } catch (err) {
    console.error("Get featured listings error:", err);
    res.status(500).json({ error: "Failed to load featured listings" });
  }
});

/* =========================================
   7. GET /:id
   Single listing
========================================= */

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ listing });
  } catch (err) {
    console.error("Get listing error:", err);
    res.status(500).json({ error: "Failed to load listing" });
  }
});

/* =========================================
   8. PATCH /:id/view
   Increment views
========================================= */

router.patch("/:id/view", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ views: listing.views });
  } catch (err) {
    console.error("Increment view error:", err);
    res.status(500).json({ error: "Failed to update views" });
  }
});

/* =========================================
   9. GET /saved/me
   Get saved listings for current user
========================================= */

router.get("/saved/me", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId).populate("savedHomes");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ saved: user.savedHomes || [] });
  } catch (err) {
    console.error("Get saved homes error:", err);
    res.status(500).json({ error: "Failed to load saved homes" });
  }
});

/* =========================================
   10. POST /save/:id
   Save listing to wishlist
========================================= */

router.post("/save/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const listingId = req.params.id;

    // Use String comparison for safety (ObjectId vs string)
    const alreadySaved = user.savedHomes
      .map((id) => String(id))
      .includes(String(listingId));

    if (!alreadySaved) {
      user.savedHomes.push(listingId);
      await user.save();
    }

    res.json({ message: "Saved to wishlist", saved: true });
  } catch (err) {
    console.error("Save home error:", err);
    res.status(500).json({ error: "Failed to save home" });
  }
});

/* =========================================
   11. DELETE /save/:id
   Remove listing from wishlist
========================================= */

router.delete("/save/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const before = user.savedHomes.length;
    user.savedHomes = user.savedHomes.filter(
      (id) => id.toString() !== req.params.id
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

/* =========================================
   12. GET /mine/all
   Listings created by current user
========================================= */

router.get("/mine/all", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const listings = await Listing.find({ ownerId: userId }).sort({
      createdAt: -1,
    });

    res.json({ listings });
  } catch (err) {
    console.error("Get my listings error:", err);
    res.status(500).json({ error: "Failed to load your listings" });
  }
});

/* =========================================
   13. PATCH /:id/status
   Toggle active/unavailable
========================================= */

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { status } = req.body;
    if (!["active", "unavailable"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be 'active' or 'unavailable'" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (String(listing.ownerId) !== String(userId)) {
      return res
        .status(403)
        .json({ error: "You can only update your own listing" });
    }

    listing.status = status;
    await listing.save();

    res.json({
      message: "Status updated",
      listing,
    });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update listing status" });
  }
});

/* =========================================
   14. PATCH /:id/price
   Update price + record price history
========================================= */

router.patch("/:id/price", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { price } = req.body;
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res
        .status(400)
        .json({ error: "A valid positive price is required" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (String(listing.ownerId) !== String(userId)) {
      return res.status(403).json({
        error: "You can only update the price of your own listing",
      });
    }

    listing.price = numericPrice;

    if (!Array.isArray(listing.priceHistory)) {
      listing.priceHistory = [];
    }

    listing.priceHistory.push({
      price: numericPrice,
      changedAt: new Date(),
    });

    await listing.save();

    res.json({
      message: "Price updated",
      listing,
    });
  } catch (err) {
    console.error("Error updating listing price:", err);
    res.status(500).json({ error: "Failed to update price" });
  }
});

/* =========================================
   15. DELETE /:id
   Delete listing (owner only)
========================================= */

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (String(listing.ownerId) !== String(userId)) {
      return res
        .status(403)
        .json({ error: "You can only delete your own listing" });
    }

    await listing.deleteOne();

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

export default router;
