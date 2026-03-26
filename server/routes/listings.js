// routes/listings.js
import express from "express";
import Listing from "../models/Listing.js";
import { uploadListingMedia } from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import sanitizeHtml from "sanitize-html";
// import redis from "../config/redis.js";

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
  const queries = [];

  // Strategy 1: Ultra specific with Nepal suffix
  if (q && city) queries.push(`${q}, ${city}, Nepal`);
  // Strategy 2: Just the specific locality in Nepal
  if (q) queries.push(`${q}, Nepal`);
  // Strategy 3: Just the city in Nepal
  if (city) queries.push(`${city}, Nepal`);

  for (const query of queries) {
    const url = `${GEOCODE_ENDPOINT}&limit=1&countrycodes=np&addressdetails=1&q=${encodeURIComponent(query)}`;
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

    const fetchRes = await fetch(
      `${GEOCODE_ENDPOINT}&limit=5&countrycodes=np&addressdetails=1&q=${encodeURIComponent(fullQuery)}, Nepal`,
      {
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

/* =========================================
   SIMILAR LISTINGS
   GET /api/listings/:id/similar
========================================= */
router.get("/:id/similar", async (req, res) => {
  try {
    const listingId = req.params.id;
    const targetListing = await Listing.findById(listingId);

    if (!targetListing) {
      return res.status(404).json({ error: "Source listing not found" });
    }

    const { type, propertyType, price, location } = targetListing;

    // Build similar match criteria
    const query = {
      _id: { $ne: listingId }, // Exclude self
      status: "active",
      type: type, // Must be same transaction type (rent/sale)
    };

    // Strongly prefer same property type (House with House)
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Must be in the same district or city
    const districtArea = location?.district || targetListing.city;
    if (districtArea) {
      query.$or = [
        { "location.district": districtArea },
        { city: districtArea }
      ];
    }

    // Fetch up to 10 candidates, then sort by price delta to find the closest matches
    const candidates = await Listing.find(query)
      .select("-description -contact") // Exclude heavy text
      .limit(15);

    // Calculate price proximity score 
    const scoredCandidates = candidates.map(c => {
      const priceDiff = Math.abs(c.price - price);
      const priceScore = priceDiff / price; // Lower is better (percentage difference)
      return { ...c.toObject(), score: priceScore };
    });

    // Sort by price proximity and take top 4
    const sorted = scoredCandidates.sort((a, b) => a.score - b.score).slice(0, 4);

    res.json(sorted);
  } catch (err) {
    console.error("Similar properties fetch error:", err);
    res.status(500).json({ error: "Could not fetch similar properties" });
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
        propertyType,
        title,
        description,
        price,
        location: locationRaw,
        specs: specsRaw,
        facilities: facilitiesRaw,
        amenities: amenitiesRaw,
        nearby: nearbyRaw,
        highlights: highlightsRaw,
        video,
        videoUrl,
        mapsUrl,
        contact: contactRaw,

        // Legacy fallback
        beds, baths, sqft, address, city, furnished, internet, parking, petsAllowed
      } = req.body;

      if (!description || !price) {
        return res.status(400).json({ error: "description and price are required" });
      }

      const numericPrice = toNumber(price);
      if (!numericPrice || numericPrice <= 0) {
        return res.status(400).json({ error: "price must be a positive number" });
      }

      let location = {};
      let specs = {};
      let facilities = {};
      let amenities = [];
      let nearby = [];
      let highlights = [];
      let contact = {};

      try {
        if (locationRaw) location = JSON.parse(locationRaw);
        if (specsRaw) specs = JSON.parse(specsRaw);
        if (facilitiesRaw) facilities = JSON.parse(facilitiesRaw);
        if (amenitiesRaw) amenities = JSON.parse(amenitiesRaw);
        if (nearbyRaw) nearby = JSON.parse(nearbyRaw);
        if (highlightsRaw) highlights = JSON.parse(highlightsRaw);
        if (contactRaw) contact = JSON.parse(contactRaw);
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON format for location, specs, facilities, amenities, nearby, highlights, or contact" });
      }

      // Legacy fallback mapping
      if (!location.district && city) location.district = city;
      if (!location.municipality && city) location.municipality = city;
      if (!location.locality && address) location.locality = address;

      if (typeof specs.bedrooms !== 'number' && beds) specs.bedrooms = toNumber(beds);
      if (typeof specs.bathrooms !== 'number' && baths) specs.bathrooms = toNumber(baths);
      if (typeof specs.builtUpAreaSqFt !== 'number' && sqft) specs.builtUpAreaSqFt = toNumber(sqft);
      if (!specs.furnishing && parseBool(furnished)) specs.furnishing = "fully";

      const propTypeDisplay = propertyType ? (propertyType.charAt(0).toUpperCase() + propertyType.slice(1)) : 'Property';
      const typeDisplay = type === 'rent' ? 'Rent' : 'Sale';
      const bedPrefix = specs.bedrooms ? `${specs.bedrooms}BHK ` : '';
      const areaDisplay = location.locality || location.municipality || location.district || 'Nepal';
      const generatedTitle = title || `${bedPrefix}${propTypeDisplay} For ${typeDisplay} in ${areaDisplay}`;

      const uploadedImages = [];
      if (Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          uploadedImages.push(file.path);
        }
      }

      const clientLat = location.lat || toNumber(req.body.lat);
      const clientLng = location.lng || toNumber(req.body.lng);

      // Compute geo
      const geo = (clientLat && clientLng)
        ? { lat: clientLat, lng: clientLng }
        : await forwardGeocode(location.locality || address, location.district || city);

      if (geo) {
        location.type = "Point";
        location.coordinates = [geo.lng, geo.lat];
        location.lat = geo.lat;
        location.lng = geo.lng;
        if (!clientLat && !clientLng) location.isApproximate = true;
      } else if (!location.coordinates) {
        location.type = "Point";
        location.coordinates = [0, 0];
      }

      const listingData = {
        ownerId: userId,
        type: type || "sale",
        propertyType: propertyType || "house",
        title: sanitize(generatedTitle),
        description: sanitize(description),
        price: numericPrice,
        location,
        specs,
        facilities,
        amenities: Array.isArray(amenities) ? amenities.map(a => sanitize(a)) : [],
        nearby: Array.isArray(nearby) ? nearby.map(n => ({
          facility: sanitize(n.facility),
          distance: sanitize(n.distance)
        })) : [],
        highlights: Array.isArray(highlights) ? highlights.map(h => sanitize(h)) : [],
        images: uploadedImages,
        video: video || "",
        videoUrl: videoUrl || "",
        mapsUrl: mapsUrl || "",
        contact: {
          phone: sanitize(contact.phone || ""),
          email: sanitize(contact.email || ""),
          whatsapp: sanitize(contact.whatsapp || ""),
          socialMedia: sanitize(contact.socialMedia || "")
        },
        status: "active",

        // Legacy redundant fields
        address: sanitize(location.locality || address || ""),
        city: sanitize(location.district || city || ""),
        beds: specs.bedrooms,
        baths: specs.bathrooms,
        sqft: specs.builtUpAreaSqFt,
        furnished: parseBool(furnished),
        internet: parseBool(internet),
        parkingFeature: parseBool(parking),
        petsAllowed: parseBool(petsAllowed),
      };

      const listing = new Listing(listingData);
      listing.priceHistory = [{ price: listing.price, changedAt: new Date() }];

      await listing.save();

      // Clear caches
      /*
            await redis.del("listings:stats");
            const keys = await redis.keys("listings:all:*");
            if (keys.length > 0) await redis.del(...keys);
      */

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
        type,
        propertyType,
        title,
        description,
        price,
        location: locationRaw,
        specs: specsRaw,
        facilities: facilitiesRaw,
        amenities: amenitiesRaw,
        nearby: nearbyRaw,
        highlights: highlightsRaw,
        video,
        videoUrl,
        mapsUrl,
        contact: contactRaw,

        // Legacy fallback
        beds, baths, sqft, address, city, furnished, internet, parking, petsAllowed
      } = req.body;

      if (price) {
        const numericPrice = toNumber(price);
        if (!numericPrice || numericPrice <= 0) {
          return res.status(400).json({ error: "price must be a positive number" });
        }
        if (listing.price !== numericPrice) {
          listing.price = numericPrice;
          if (!Array.isArray(listing.priceHistory)) listing.priceHistory = [];
          listing.priceHistory.push({ price: numericPrice, changedAt: new Date() });
        }
      }

      let newLocation = listing.location || {};
      let newSpecs = listing.specs || {};
      let newFacilities = listing.facilities || {};
      let newAmenities = listing.amenities || [];
      let newNearby = listing.nearby || [];
      let locationChanged = false;
      let newContact = listing.contact || {};

      try {
        if (locationRaw) {
          newLocation = { ...newLocation, ...JSON.parse(locationRaw) };
          locationChanged = true;
        }
        if (specsRaw) newSpecs = { ...newSpecs, ...JSON.parse(specsRaw) };
        if (facilitiesRaw) newFacilities = { ...newFacilities, ...JSON.parse(facilitiesRaw) };
        if (amenitiesRaw) newAmenities = JSON.parse(amenitiesRaw).map(a => sanitize(a));
        if (nearbyRaw) newNearby = JSON.parse(nearbyRaw).map(n => ({
          facility: sanitize(n.facility),
          distance: sanitize(n.distance)
        }));
        if (highlightsRaw) listing.highlights = JSON.parse(highlightsRaw).map(h => sanitize(h));
        if (contactRaw) newContact = { ...newContact, ...JSON.parse(contactRaw) };
      } catch (err) { }

      // Legacy updates
      if (address) {
        const trimmed = address.trim();
        if (trimmed !== listing.address) {
          listing.address = trimmed;
          newLocation.locality = trimmed;
          locationChanged = true;
        }
      }
      if (city) {
        const trimmed = city.trim();
        if (trimmed !== listing.city) {
          listing.city = trimmed;
          newLocation.district = trimmed;
          locationChanged = true;
        }
      }

      if (beds) { listing.beds = Number(beds); newSpecs.bedrooms = Number(beds); }
      if (baths) { listing.baths = Number(baths); newSpecs.bathrooms = Number(baths); }
      if (sqft) { listing.sqft = Number(sqft); newSpecs.builtUpAreaSqFt = Number(sqft); }

      if (type) listing.type = type;
      if (propertyType) listing.propertyType = propertyType;
      if (description) listing.description = sanitize(description);
      if (video !== undefined) listing.video = video || "";
      if (videoUrl !== undefined) listing.videoUrl = videoUrl || "";
      if (mapsUrl !== undefined) listing.mapsUrl = mapsUrl || "";

      if (furnished !== undefined) listing.furnished = parseBool(furnished);
      if (internet !== undefined) listing.internet = parseBool(internet);
      if (parking !== undefined) listing.parkingFeature = parseBool(parking);
      if (petsAllowed !== undefined) listing.petsAllowed = parseBool(petsAllowed);

      // Regenerate Title if it wasn't manually overridden
      if (title) {
        listing.title = sanitize(title);
      } else if (listing.propertyType && newSpecs.bedrooms) {
        const propTypeDisplay = listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1);
        const typeDisplay = listing.type === 'rent' ? 'Rent' : 'Sale';
        const areaDisplay = newLocation.locality || newLocation.municipality || newLocation.district || 'Nepal';
        listing.title = `${newSpecs.bedrooms}BHK ${propTypeDisplay} For ${typeDisplay} in ${areaDisplay}`;
      }

      listing.specs = newSpecs;
      listing.facilities = newFacilities;
      listing.amenities = newAmenities;
      listing.nearby = newNearby;

      // Append new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((f) => f.path);
        listing.images = [...(listing.images || []), ...newImages];
      }

      // Re-geocode if location was updated
      if (locationChanged) {
        const clientLat = newLocation.lat || toNumber(req.body.lat);
        const clientLng = newLocation.lng || toNumber(req.body.lng);

        const geo = (clientLat && clientLng)
          ? { lat: clientLat, lng: clientLng }
          : await forwardGeocode(newLocation.locality || listing.address, newLocation.district || listing.city);

        if (geo) {
          newLocation.type = "Point";
          newLocation.coordinates = [geo.lng, geo.lat];
          newLocation.lat = geo.lat;
          newLocation.lng = geo.lng;
        }
      }

      listing.location = newLocation;
      listing.contact = {
        phone: sanitize(newContact.phone || ""),
        email: sanitize(newContact.email || ""),
        whatsapp: sanitize(newContact.whatsapp || ""),
        socialMedia: sanitize(newContact.socialMedia || "")
      };

      await listing.save();

      // Clear caches
      /*
            await redis.del("listings:stats");
            const keys = await redis.keys("listings:all:*");
            if (keys.length > 0) await redis.del(...keys);
      */

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
    /*
        const cachedStats = await redis.get("listings:stats");
        if (cachedStats) {
          return res.json(JSON.parse(cachedStats));
        }
    */

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
    // await redis.setex("listings:stats", 60, JSON.stringify(statsData));

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
    /*
        const cacheKey = `listings:all:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
    */

    const {
      type,        // offer/wanted/sale/rent
      propertyType,
      city,        // generic search mapped to district/municipality/locality
      province,
      district,
      municipality,
      minPrice,
      maxPrice,
      minLandArea, // new
      maxLandArea, // new
      roadAccess,  // new
      facing,      // new
      beds,
      baths,
      furnished,
      internet,
      parking,
      petsAllowed,
      status,
      amenities,
      limit,
      page,
    } = req.query;

    const query = {};

    // Filter by type
    if (type) {
      // e.g. "sale", "rent", or fallback to old "offer"/"wanted"
      query.type = type;
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Location search
    if (province && province.trim()) {
      query["location.province"] = new RegExp(`^${province.trim()}$`, "i");
    }

    if (district && district.trim()) {
      query["location.district"] = new RegExp(`^${district.trim()}$`, "i");
    }

    if (municipality && municipality.trim()) {
      query["location.municipality"] = new RegExp(`^${municipality.trim()}$`, "i");
    }

    // Generic text search (backward compatibility or general search bar)
    if (city && city.trim()) {
      const pattern = new RegExp(city.trim(), "i");
      query.$or = [
        { city: pattern },
        { address: pattern },
        { "location.district": pattern },
        { "location.municipality": pattern },
        { "location.tole": pattern },
      ];
    }

    // Price Range
    const priceQuery = {};
    const minP = toNumber(minPrice);
    const maxP = toNumber(maxPrice);
    if (minP !== undefined) priceQuery.$gte = minP;
    if (maxP !== undefined) priceQuery.$lte = maxP;
    if (Object.keys(priceQuery).length > 0) query.price = priceQuery;

    // Land Area Range
    const landQuery = {};
    const minLa = toNumber(minLandArea);
    const maxLa = toNumber(maxLandArea);
    if (minLa !== undefined) landQuery.$gte = minLa;
    if (maxLa !== undefined) landQuery.$lte = maxLa;
    if (Object.keys(landQuery).length > 0) {
      query["specs.landArea.aana"] = landQuery;
    }

    // Road Access
    const roadR = toNumber(roadAccess);
    if (roadR !== undefined) {
      query["specs.roadAccess.widthFeet"] = { $gte: roadR };
    }

    // Facing
    if (facing && facing.trim()) {
      query["specs.facing"] = new RegExp(`^${facing.trim()}$`, "i");
    }

    // Beds / Baths
    const bedsN = toNumber(beds);
    const bathsN = toNumber(baths);
    if (bedsN !== undefined) {
      query.$or = [{ beds: { $gte: bedsN } }, { "specs.bedrooms": { $gte: bedsN } }];
    }
    if (bathsN !== undefined) {
      query.$or = [{ baths: { $gte: bathsN } }, { "specs.bathrooms": { $gte: bathsN } }];
    }

    // Booleans
    if (furnished === "true") {
      query.$or = [{ furnished: true }, { "specs.furnishing": "fully" }];
    }
    if (internet === "true") query.internet = true;
    if (parking === "true") {
      query.$or = [{ parking: true }, { "specs.parkingFeature": true }, { "specs.parking": { $gte: 1 } }];
    }
    if (petsAllowed === "true") query.petsAllowed = true;

    // Amenities
    if (amenities) {
      const arr = amenities.split(",").map(a => new RegExp(`^${a.trim()}$`, "i"));
      query.amenities = { $all: arr };
    }

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

    // Normalize listings: some documents (from hamro-ghar sub-app) store data in
    // a nested `specs` object. Flatten these into top-level scalar fields so the
    // root frontend never receives an object where it expects a number.
    function normalizeListing(obj) {
      const specs = obj.specs || {};
      // Flatten beds/baths/sqft from specs if the top-level value is an object or missing
      if (typeof obj.beds !== 'number') obj.beds = typeof specs.bedrooms === 'number' ? specs.bedrooms : null;
      if (typeof obj.baths !== 'number') obj.baths = typeof specs.bathrooms === 'number' ? specs.bathrooms : null;
      if (typeof obj.sqft !== 'number') obj.sqft = typeof specs.builtUpAreaSqFt === 'number' ? specs.builtUpAreaSqFt : null;
      // Remove the specs field entirely – it contains nested objects that crash React
      delete obj.specs;
      return obj;
    }

    // Attach owner socials
    const ownerIds = [...new Set(listings.map((l) => l.ownerId?.toString()).filter(Boolean))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('name socials');
    const ownerMap = {};
    for (const o of owners) ownerMap[o._id.toString()] = o;

    const listingsWithOwner = listings.map((l) => {
      const obj = l.toObject();
      const ow = ownerMap[l.ownerId?.toString()];
      obj.owner = ow ? { name: ow.name, socials: ow.socials || {} } : {};
      return normalizeListing(obj);
    });

    const responseData = { listings: listingsWithOwner, totalPages, page: pageN, totalCount };

    // 2. Save result to Cache (TTL 1 minute)
    // await redis.setex(cacheKey, 60, JSON.stringify(responseData));

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
    /*
        await redis.del("listings:stats");
        const keys = await redis.keys("listings:all:*");
        if (keys.length > 0) await redis.del(...keys);
    */

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
    /*
        await redis.del("listings:stats");
        const keys = await redis.keys("listings:all:*");
        if (keys.length > 0) await redis.del(...keys);
    */

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
    /*
        await redis.del("listings:stats");
        const keys = await redis.keys("listings:all:*");
        if (keys.length > 0) await redis.del(...keys);
    */

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

// (Removed duplicate dummy POST /:id/report route)

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

    const [totalListings, activeListings, totalUsers, totalReports, recentListings] = await Promise.all([
      Listing.countDocuments({}),
      Listing.countDocuments({ status: "active" }),
      User.countDocuments({}),
      Report.countDocuments({ status: "pending" }), // Count unresolved reports
      Listing.find({}).sort({ createdAt: -1 }).limit(20).select("title city price status createdAt ownerId type isVerified"),
    ]);

    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(10).select("name email role isVerified createdAt");

    res.json({ totalListings, activeListings, totalUsers, totalReports, recentListings, recentUsers });
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
    /*
        await redis.del("listings:stats");
        const keys = await redis.keys("listings:all:*");
        if (keys.length > 0) await redis.del(...keys);
    */

    res.json({ message: "Listing deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

/* =========================================
   19. GET /admin/reports
   Admin view moderation queue
========================================= */
router.get("/admin/reports", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const reports = await Report.find({})
      .populate("listingId", "title ownerId")
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (err) {
    console.error("Admin reports fetch error:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

/* =========================================
   20. PUT /admin/reports/:id/resolve
   Admin marks report as resolved
========================================= */
router.put("/admin/reports/:id/resolve", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json({ message: "Report resolved", report });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

/* =========================================
   21. PUT /admin/users/:id/verify
   Admin verifies a user directly
========================================= */
router.put("/admin/users/:id/verify", requireAuth, async (req, res) => {
  try {
    const adminId = getUserId(req);
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Toggle verified status
    targetUser.isVerified = !targetUser.isVerified;
    await targetUser.save();

    res.json({ message: "User verification status updated", isVerified: targetUser.isVerified });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user verification" });
  }
});

/* =========================================
   REPORT LISTING
   POST /api/listings/:id/report
========================================= */
import Report from "../models/Report.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/:id/report", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Check if already reported by this user
    const existing = await Report.findOne({ listingId, reporterId: userId });
    if (existing) {
      return res.status(400).json({ error: "You have already reported this listing" });
    }

    const report = new Report({
      listingId,
      reporterId: userId,
    });
    await report.save();

    // Send email to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to site admin
        subject: `[HamroGhar] Listing Reported: ${listing.title}`,
        text: `A user has reported a listing.\n\nListing ID: ${listingId}\nListing Title: ${listing.title}\nReporter ID: ${userId}\nUrl: ${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/?listing=${listingId}\n\nPlease review this listing.`,
      });
    } catch (err) {
      console.error("[REPORT] Failed to send email alert:", err);
    }

    res.json({ success: true, message: "Report submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================================
   MIGRATE SCHEMA V2 (Admin Only / One-time)
   POST /api/listings/migrate-schema-v2
========================================= */
router.post("/migrate-schema-v2", async (req, res) => {
  try {
    const listings = await Listing.find({});
    let migratedCount = 0;

    for (let home of listings) {
      let changed = false;

      // 1. Initialize location if missing
      if (!home.location) {
        home.location = {};
        changed = true;
      }

      // Convert number province to string province enum
      if (typeof home.location.province === "number") {
        const provinceMap = { 1: "Koshi", 2: "Madhesh", 3: "Bagmati", 4: "Gandaki", 5: "Lumbini", 6: "Karnali", 7: "Sudurpashchim" };
        if (provinceMap[home.location.province]) {
          home.location.province = provinceMap[home.location.province];
          changed = true;
        }
      }

      // Merge generic city/address into location object
      if (!home.location.district && home.city) {
        home.location.district = home.city;
        home.location.municipality = home.city;
        changed = true;
      }
      if (!home.location.tole && home.address) {
        home.location.tole = home.address;
        changed = true;
      }

      // 2. Initialize specs if missing
      if (!home.specs) {
        home.specs = {};
        changed = true;
      }

      // Migrate beds/baths/sqft into specs
      if (home.beds && !home.specs.bedrooms) { home.specs.bedrooms = home.beds; changed = true; }
      if (home.baths && !home.specs.bathrooms) { home.specs.bathrooms = home.baths; changed = true; }
      if (home.sqft && !home.specs.landArea?.totalSqFt) {
        if (!home.specs.landArea) home.specs.landArea = {};
        home.specs.landArea.totalSqFt = home.sqft;
        changed = true;
      }
      if (home.furnished && !home.specs.furnishing) { home.specs.furnishing = "Fully Furnished"; changed = true; }

      if (changed) {
        await home.save();
        migratedCount++;
      }
    }

    res.json({ success: true, message: `Migrated ${migratedCount} listings to V2 Schema.` });
  } catch (err) {
    console.error("[Migration Error]", err);
    res.status(500).json({ error: "Failed to migrate schema" });
  }
});

export default router;
