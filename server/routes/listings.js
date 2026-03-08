// routes/listings.js
import express from "express";
import Listing from "../models/Listing.js";
import { uploadListingMedia } from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import sanitizeHtml from "sanitize-html";
import redis from "../config/redis.js";

const router = express.Router();

// Strip all HTML — plain text only
const sanitize = (str) =>
  typeof str === "string"
    ? sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }).trim()
    : str;

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

const GEOCODE_ENDPOINT =
  "https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&accept-language=en";

// Server-side geocoding with Nepal bias and city fallback
async function forwardGeocode(address, city) {
  const q = [address, city].filter(Boolean).join(", ");
  if (!q) return null;

  // Try: full address first, then city-only as fallback
  const queries = [q];
  if (city && city.trim() && city.trim() !== q) queries.push(city.trim());

  for (const query of queries) {
    const url = `${GEOCODE_ENDPOINT}&limit=1&q=${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "HamroGhar/1.0 (educational project; nepal)" },
      });
      if (!res.ok) { console.error("Geocode HTTP error:", res.status); continue; }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;
      const first = data[0];
      const lat = Number(first.lat);
      const lon = Number(first.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      console.log(`Geocoded "${query}" → ${lat},${lon}`);
      return { lat, lng: lon };
    } catch (err) {
      console.error("Geocode error:", err);
    }
  }
  return null;
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

    const url = `${GEOCODE_ENDPOINT}&limit=5&q=${encodeURIComponent(
      fullQuery
    )}`;

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
      city:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        null,
      lat: Number(item.lat),
      lng: Number(item.lon),
    }));

    res.json({ suggestions });
  } catch (err) {
    console.error("Geosearch route error:", err);
    res
      .status(500)
      .json({ error: "Server failed to process geocoding request" });
  }
});

// Helper to convert FormData string booleans to real booleans
const parseBool = (v) => v === true || v === "true" || v === "1";

/* =========================================
   2. POST /create
   Create a new listing (with images)
========================================= */
router.post("/create", requireAuth, (req, res) => {
  // Wrap multer in a callback so upload errors are caught gracefully
  uploadListingMedia.array("images", 10)(req, res, async (multerErr) => {
    if (multerErr) {
      console.error("Multer/Cloudinary upload error:", multerErr);
      return res.status(400).json({
        error: multerErr.message || "Image upload failed",
      });
    }

    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const {
        type,
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
      const numericBeds = toNumber(beds, 0);
      const numericBaths = toNumber(baths, 0);
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
            uploadedImages.push(file.path);
          }
        }
      }

      // Use pre-parsed coords from Google Maps URL, or geocode the address
      const clientLat = toNumber(req.body.lat);
      const clientLng = toNumber(req.body.lng);
      const clientMapsUrl = (req.body.mapsUrl || "").trim();
      const geo =
        clientLat && clientLng
          ? { lat: clientLat, lng: clientLng }
          : await forwardGeocode(address, city);

      const listingData = {
        ownerId: userId,
        type: type === "wanted" ? "wanted" : "offer",
        title: sanitize(title) || "Untitled listing",
        description: sanitize(description),
        price: numericPrice,
        beds: numericBeds,
        baths: numericBaths,
        sqft: numericSqft,
        address: sanitize(address),
        city: sanitize(city),
        furnished: parseBool(furnished),
        internet: parseBool(internet),
        parking: parseBool(parking),
        petsAllowed: parseBool(petsAllowed),
        images: uploadedImages,
        video: video || "",
        mapsUrl: clientMapsUrl,
        status: "active",

      };


      if (geo) {
        listingData.location = {
          type: "Point",
          coordinates: [geo.lng, geo.lat],
          lat: geo.lat,
          lng: geo.lng,
        };
      }


      const listing = new Listing(listingData);

      if (typeof listing.price === "number" && !listing.priceHistory?.length) {
        listing.priceHistory = [{ price: listing.price, changedAt: new Date() }];
      }

      await listing.save();

      // Clear caches
      await redis.del("listings:stats");
      const keys = await redis.keys("listings:all:*");
      if (keys.length > 0) await redis.del(...keys);

      res.status(201).json({ message: "Listing created", listing });
    } catch (err) {
      console.error("Create listing error:", err);
      res.status(500).json({ error: "Failed to create listing: " + err.message });
    }
  });
});

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
        video,
      } = req.body;

      let addressChanged = false;
      let cityChanged = false;

      // Parse numbers
      if (price) {
        const numericPrice = toNumber(price);
        if (!numericPrice || numericPrice <= 0) {
          return res
            .status(400)
            .json({ error: "price must be a positive number" });
        }
        listing.price = numericPrice;

        // record price change
        if (!Array.isArray(listing.priceHistory)) {
          listing.priceHistory = [];
        }
        listing.priceHistory.push({
          price: numericPrice,
          changedAt: new Date(),
        });
      }
      if (beds) listing.beds = Number(beds);
      if (baths) listing.baths = Number(baths);
      if (sqft) listing.sqft = Number(sqft);

      // Update strings
      if (title) listing.title = title.trim();
      if (description) listing.description = description.trim();
      if (address) {
        const trimmedAddress = address.trim();
        if (trimmedAddress && trimmedAddress !== listing.address) {
          addressChanged = true;
        }
        listing.address = trimmedAddress;
      }
      if (city) {
        const trimmedCity = city.trim();
        if (trimmedCity && trimmedCity !== listing.city) {
          cityChanged = true;
        }
        listing.city = trimmedCity;
      }

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

      if (video !== undefined) {
        listing.video = video || "";
      }

      // Append new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((f) => f.path);
        listing.images = [...(listing.images || []), ...newImages];
      }

      // If address or city changed, re-geocode
      if ((addressChanged || cityChanged) && listing.address && listing.city) {
        const geo = await forwardGeocode(listing.address, listing.city);
        if (geo) {
          listing.location = {
            type: "Point",
            coordinates: [geo.lng, geo.lat],
            lat: geo.lat,
            lng: geo.lng,
          };
        }
      }

      await listing.save();

      // Clear caches
      await redis.del("listings:stats");
      const keys = await redis.keys("listings:all:*");
      if (keys.length > 0) await redis.del(...keys);

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
    // 1. Check Redis Cache
    const cachedStats = await redis.get("listings:stats");
    if (cachedStats) {
      return res.json(JSON.parse(cachedStats));
    }

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

    const statsData = {
      totalActive,
      totalListings: totalActive, // alias — frontend reads this key
      avgPrice,
      avgViews,
    };

    // 2. Save to Cache (TTL 1 minute)
    await redis.setex("listings:stats", 60, JSON.stringify(statsData));

    res.json(statsData);
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
    // 1. Check Redis Cache using uniquely hashed query string
    const cacheKey = `listings:all:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const {
      type,        // ✅ NEW: filter by offer/wanted
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
      page,
    } = req.query;

    const query = {};

    // Filter by listing type
    if (type === "wanted") {
      query.type = "wanted";
    } else if (type === "offer") {
      query.type = "offer";
    } else {
      // If you want homepage to show only offers by default, uncomment:
      // query.type = "offer";
      // Otherwise, leaving it unset will return both.
    }

    // City + address search
    if (city && city.trim()) {
      const pattern = new RegExp(city.trim(), "i");
      query.$or = [{ city: pattern }, { address: pattern }];
    }

    const priceQuery = {};
    const minP = toNumber(minPrice);
    const maxP = toNumber(maxPrice);
    if (minP !== undefined) priceQuery.$gte = minP;
    if (maxP !== undefined) priceQuery.$lte = maxP;
    if (Object.keys(priceQuery).length > 0) query.price = priceQuery;

    const bedsN = toNumber(beds);
    const bathsN = toNumber(baths);
    if (bedsN !== undefined) query.beds = { $gte: bedsN };
    if (bathsN !== undefined) query.baths = { $gte: bathsN };

    if (furnished === "true") query.furnished = true;
    if (internet === "true") query.internet = true;
    if (parking === "true") query.parking = true;
    if (petsAllowed === "true") query.petsAllowed = true;

    query.status = status || "active";

    // Pagination
    const limitN = Math.min(toNumber(limit, 12), 50);
    const pageN = Math.max(toNumber(page, 1), 1);
    const skip = (pageN - 1) * limitN;

    const totalCount = await Listing.countDocuments(query);
    const totalPages = Math.max(Math.ceil(totalCount / limitN), 1);

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitN);

    // Attach owner socials
    const ownerIds = [...new Set(listings.map((l) => l.ownerId?.toString()).filter(Boolean))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('name socials');
    const ownerMap = {};
    for (const o of owners) ownerMap[o._id.toString()] = o;

    const listingsWithOwner = listings.map((l) => {
      const obj = l.toObject();
      const ow = ownerMap[l.ownerId?.toString()];
      obj.owner = ow ? { name: ow.name, socials: ow.socials || {} } : {};
      return obj;
    });

    const responseData = { listings: listingsWithOwner, totalPages, page: pageN, totalCount };

    // 2. Save result to Cache (TTL 1 minute)
    await redis.setex(cacheKey, 60, JSON.stringify(responseData));

    res.json(responseData);
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

    // Attach owner socials
    const obj = listing.toObject();
    if (listing.ownerId) {
      const owner = await User.findById(listing.ownerId).select('name socials');
      obj.owner = owner ? { name: owner.name, socials: owner.socials || {} } : {};
    }

    res.json({ listing: obj });
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

    // Clear caches
    await redis.del("listings:stats");
    const keys = await redis.keys("listings:all:*");
    if (keys.length > 0) await redis.del(...keys);

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

    // Clear caches
    await redis.del("listings:stats");
    const keys = await redis.keys("listings:all:*");
    if (keys.length > 0) await redis.del(...keys);

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

    // Clear caches
    await redis.del("listings:stats");
    const keys = await redis.keys("listings:all:*");
    if (keys.length > 0) await redis.del(...keys);

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

/* =========================================
   16. POST /:id/report
   Report a listing as spam/scam
========================================= */
router.post("/:id/report", async (req, res) => {
  try {
    const listingId = req.params.id;
    // Log the report — extend with email/DB storage as needed
    console.log(`[REPORT] Listing ${listingId} reported at ${new Date().toISOString()}`);
    res.json({ message: "Report received. Thank you." });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

/* =========================================
   17. GET /admin/overview
   Admin dashboard data — requires admin role
========================================= */
router.get("/admin/overview", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [totalListings, activeListings, totalUsers, recentListings] = await Promise.all([
      Listing.countDocuments({}),
      Listing.countDocuments({ status: "active" }),
      User.countDocuments({}),
      Listing.find({}).sort({ createdAt: -1 }).limit(20).select("title city price status createdAt ownerId type"),
    ]);

    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(10).select("name email role createdAt");

    res.json({ totalListings, activeListings, totalUsers, recentListings, recentUsers });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ error: "Failed to load admin data" });
  }
});

/* =========================================
   18. DELETE /admin/listings/:id
   Admin delete any listing
========================================= */
router.delete("/admin/listings/:id", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    await Listing.findByIdAndDelete(req.params.id);

    // Clear caches
    await redis.del("listings:stats");
    const keys = await redis.keys("listings:all:*");
    if (keys.length > 0) await redis.del(...keys);

    res.json({ message: "Listing deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
