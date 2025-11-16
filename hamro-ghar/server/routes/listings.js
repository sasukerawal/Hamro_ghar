// routes/listings.js
import express from "express";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadListingMedia } from "../config/multer.js";

const router = express.Router();

/* ------------------------ Helpers ------------------------ */

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

// Safely get user id from JWT payload
const getUserId = (req) => req.user?.id || req.user?._id || null;

// 🌍 Geocode single address (used when creating listing)
async function geocodeAddress(address, city) {
  if (!address || !city) return null;

  try {
    const query = encodeURIComponent(`${address}, ${city}, Nepal`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "HamroGharDev/1.0 (support@hamroghar.local)",
      },
    });

    if (!res.ok) {
      console.error("Geocoding HTTP error:", res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

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

// 🌍 Search suggestions for address autocomplete
async function geoSearchSuggestions(q, city) {
  const trimmed = (q || "").trim();
  if (!trimmed || trimmed.length < 3) return [];

  const cityPart = (city || "").trim();
  const searchTerm = cityPart
    ? `${trimmed}, ${cityPart}, Nepal`
    : `${trimmed}, Nepal`;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchTerm
    )}&addressdetails=1&limit=5`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "HamroGharDev/1.0 (support@hamroghar.local)",
      },
    });

    if (!res.ok) {
      console.error("Geo search HTTP error:", res.status);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item, idx) => {
      const addr = item.address || {};
      const parts = [
        addr.road,
        addr.neighbourhood || addr.suburb || addr.village || addr.town,
        addr.city || addr.county,
      ].filter(Boolean);

      const label = parts.join(", ") || item.display_name;
      const cityName =
        addr.city || addr.town || addr.village || addr.county || "";

      return {
        id: item.place_id || idx,
        label,
        city: cityName,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });
  } catch (err) {
    console.error("Geo search error:", err);
    return [];
  }
}

/* ------------------------ GEO SUGGESTIONS ------------------------ */
// GET /api/listings/geo/search?q=...&city=...
router.get("/geo/search", async (req, res) => {
  try {
    const { q, city } = req.query;
    const suggestions = await geoSearchSuggestions(q, city);
    res.json({ suggestions });
  } catch (err) {
    console.error("Geo suggestions route error:", err);
    res.status(500).json({ error: "Failed to load suggestions" });
  }
});

/* ------------------------ CREATE LISTING ------------------------ */
// POST /api/listings/create
router.post(
  "/create",
  requireAuth,
  uploadListingMedia.array("media", 10),
  async (req, res) => {
    try {
      const ownerId = getUserId(req);
      if (!ownerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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
            "Title, description, price, address, and city are required fields.",
        });
      }

      // Try to validate / enrich address – but don't block if it fails
      const geo = await geocodeAddress(address, city);

      const images = (req.files || []).map((file) => {
        return file.path || file.secure_url || file.url;
      });

      const listing = new Listing({
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
        location: geo
          ? {
              lat: geo.lat,
              lng: geo.lng,
            }
          : undefined,
        status: "active",
      });

      await listing.save();

      res.status(201).json({
        message: geo
          ? "Listing created and address verified."
          : "Listing created. We couldn't auto-verify the address, but it was still saved.",
        listing,
        geocoded: geo
          ? {
              lat: geo.lat,
              lng: geo.lng,
              label: geo.displayName,
            }
          : null,
      });
    } catch (err) {
      console.error("Create listing error:", err);
      res.status(500).json({ error: "Server error creating listing" });
    }
  }
);

/* ------------------------ PUBLIC LISTINGS + FILTERS ------------------------ */
// GET ALL LISTINGS (with optional text search on address/city)
router.get("/all", async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, "i"); // case-insensitive

      filter.$or = [
        { city: regex },
        { address: regex },
        { title: regex },
      ];
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    console.error("Load listings error:", err);
    res.status(500).json({ error: "Failed to load listings" });
  }
});

// GET STATS FOR HERO CARD
router.get("/stats", async (req, res) => {
  try {
    const totalListings = await Listing.countDocuments();

    // distinct cities
    const cities = await Listing.distinct("city", { city: { $ne: null } });

    // average views (if you store views on each listing)
    const agg = await Listing.aggregate([
      { $group: { _id: null, avgViews: { $avg: "$views" } } },
    ]);

    const avgViews = agg[0]?.avgViews || 0;

    res.json({
      totalListings,
      citiesCount: cities.length,
      avgViews,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to load listing stats" });
  }
});


/* ------------------------ MY LISTINGS (OWNER) ------------------------ */
// GET /api/listings/mine/all
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
    console.error("Load my listings error:", err);
    res.status(500).json({ error: "Failed to load your listings" });
  }
});

/* ------------------------ SAVE / UNSAVE (WISHLIST) ------------------------ */
// POST /api/listings/save/:id
router.post("/save/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const listingId = req.params.id.toString();
    const already = user.savedHomes.map((id) => id.toString());

    if (!already.includes(listingId)) {
      user.savedHomes.push(listingId);
      await user.save();
    }

    res.json({ message: "Saved to wishlist", saved: true });
  } catch (err) {
    console.error("Save home error:", err);
    res.status(500).json({ error: "Failed to save home" });
  }
});

// DELETE /api/listings/save/:id
router.delete("/save/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const listingId = req.params.id.toString();

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

// GET /api/listings/saved/me
router.get("/saved/me", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId).populate("savedHomes");

    if (!user) {
      return res.status(404).json({ saved: [] });
    }

    return res.json({ saved: user.savedHomes || [] });
  } catch (err) {
    console.error("Load saved homes error:", err);
    return res.status(500).json({ error: "Failed to load saved homes" });
  }
});

/* ------------------------ VIEW COUNTS ------------------------ */
// POST /api/listings/:id/view  -> increment and return new value
router.post("/:id/view", async (req, res) => {
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
    res.status(500).json({ error: "Failed to increment views" });
  }
});

/* ------------------------ UPDATE STATUS ------------------------ */
// PATCH /api/listings/:id/status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { status } = req.body;
    const allowed = ["active", "unavailable"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed values: active, unavailable",
      });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.ownerId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update your own listing" });
    }

    listing.status = status;
    await listing.save();

    res.json({ message: "Status updated", listing });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Error updating status" });
  }
});

/* ------------------------ DELETE LISTING ------------------------ */
// DELETE /api/listings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.ownerId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own listing" });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Error deleting listing" });
  }
});

/* ------------------------ SINGLE LISTING ------------------------ */
// GET /api/listings/:id
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

export default router;
