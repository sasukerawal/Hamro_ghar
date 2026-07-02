import ListingService from "../services/ListingService.js";
import Listing from "../models/Listing.js";
import redis from "../config/redis.js";

/**
 * ListingController - Handles HTTP requests for listing operations.
 */
class ListingController {
    /**
     * Invalidates listing-related caches.
     */
    async #clearCaches() {
        try {
            await redis.del("listings:stats");
            const keys = await redis.keys("listings:all:*");
            if (keys.length > 0) await redis.del(...keys);
        } catch (err) {
            console.warn("Redis cache clear failed:", err);
        }
    }

    /**
     * GET /api/listings/:id/similar
     */
    getSimilar = async (req, res) => {
        try {
            const similar = await ListingService.getSimilarListings(req.params.id);
            res.json(similar);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch similar properties" });
        }
    };

    /**
     * GET /api/listings/stats
     */
    getStats = async (req, res) => {
        try {
            const cached = await redis.get("listings:stats");
            if (cached) return res.json(JSON.parse(cached));

            const totalActive = await Listing.countDocuments({ status: "active" });
            const stats = { totalActive, totalListings: totalActive };

            await redis.setex("listings:stats", 300, JSON.stringify(stats));
            res.json(stats);
        } catch (err) {
            res.status(500).json({ error: "Failed to load stats" });
        }
    };

    /**
     * GET /api/listings/:id
     */
    getOne = async (req, res) => {
        try {
            const listing = await Listing.findById(req.params.id);
            if (!listing) return res.status(404).json({ error: "Listing not found" });

            const [withOwner] = await ListingService.attachOwnersToListings([listing]);
            res.json({ listing: withOwner });
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch listing" });
        }
    };

    /**
     * GET /api/listings/all
     */
    getAll = async (req, res) => {
        try {
            const cacheKey = `listings:all:${Buffer.from(JSON.stringify(req.query)).toString("base64")}`;
            const cached = await redis.get(cacheKey);
            if (cached) return res.json(JSON.parse(cached));

            const data = await ListingService.getAllListings(req.query);
            await redis.setex(cacheKey, 60, JSON.stringify(data));

            res.json(data);
        } catch (err) {
            res.status(500).json({ error: "Failed to load listings" });
        }
    };

    /**
     * POST /api/listings/create
     */
    create = async (req, res) => {
        try {
            const userId = req.user?.id || req.body.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const listing = await ListingService.createListing(req.body, userId);
            await this.#clearCaches();

            res.status(201).json({ message: "Listing created", listing });
        } catch (err) {
            res.status(500).json({ error: "Creation failed: " + err.message });
        }
    };

    /**
     * PATCH /api/listings/:id/view
     */
    incrementView = async (req, res) => {
        try {
            await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({ error: "Failed to update view count" });
        }
    };

    /**
     * DELETE /api/listings/:id
     */
    delete = async (req, res) => {
        try {
            const userId = req.user?.id;
            const listing = await Listing.findById(req.params.id);

            if (!listing) return res.status(404).json({ error: "Not found" });
            if (String(listing.ownerId) !== String(userId)) return res.status(403).json({ error: "Unauthorized" });

            await listing.deleteOne();
            await this.#clearCaches();

            res.json({ message: "Listing deleted" });
        } catch (err) {
            res.status(500).json({ error: "Deletion failed" });
        }
    };
}

export default new ListingController();
