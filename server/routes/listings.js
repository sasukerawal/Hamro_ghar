import express from "express";
import ListingController from "../controllers/ListingController.js";
import { uploadListingMedia } from "../config/multer.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Listing Routes - Modularized using Controller/Service pattern.
 * All long-running business logic is handled in the ListingService.
 * HTTP request/response handling is managed by the ListingController.
 */

// --- Public Routes ---

/**
 * @route   GET /api/listings/stats
 * @desc    Get aggregate listing statistics (cached)
 */
router.get("/stats", ListingController.getStats);

/**
 * @route   GET /api/listings/all
 * @desc    Search and filter listings with pagination
 */
router.get("/all", ListingController.getAll);

/**
 * @route   GET /api/listings/featured
 * @desc    Get a subset of featured listings
 */
router.get("/featured", ListingController.getFeatured || ((req, res) => res.status(501).send("Pending implementation")));

/**
 * @route   GET /api/listings/:id
 * @desc    Get full details for a single property
 */
router.get("/:id", ListingController.getOne);

/**
 * @route   GET /api/listings/:id/similar
 * @desc    Find properties similar to the target ID
 */
router.get("/:id/similar", ListingController.getSimilar);

/**
 * @route   GET /api/listings/geo/search
 * @desc    Address suggestions via Nominatim
 */
router.get("/geo/search", ListingController.geoSearch || ((req, res) => res.status(501).send("Pending implementation")));


// --- Protected Routes (Owner/Authenticated only) ---

/**
 * @route   POST /api/listings/create
 * @desc    Create a new property listing with media uploads
 */
router.post("/create", requireAuth, ListingController.create);

/**
 * @route   PUT /api/listings/:id
 * @desc    Batch update an existing listing
 */
router.put("/:id", requireAuth, ListingController.update || ((req, res) => res.status(501).send("Pending implementation")));

/**
 * @route   PATCH /api/listings/:id/view
 * @desc    Optimistic view count increment
 */
router.patch("/:id/view", ListingController.incrementView);

/**
 * @route   DELETE /api/listings/:id
 * @desc    Remove a listing (owner only)
 */
router.delete("/:id", requireAuth, ListingController.delete);

export default router;
