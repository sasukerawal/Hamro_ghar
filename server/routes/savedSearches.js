// server/routes/savedSearches.js
import express from "express";
import SavedSearch from "../models/SavedSearch.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper to extract userId from request
function getUserId(req) {
    return req.user?.id || req.user?._id || req.userId;
}

/* =========================================
   POST /api/saved-searches
   Save a new search with filters
========================================= */
router.post("/", requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });

        // Check limit (max 10 saved searches per user)
        const count = await SavedSearch.countDocuments({ userId });
        if (count >= 10) {
            return res.status(400).json({
                error: "You can save up to 10 searches. Please delete an old one first.",
            });
        }

        const { name, filters, alertFrequency } = req.body;

        const saved = new SavedSearch({
            userId,
            name: name || "My Search",
            filters: filters || {},
            alertFrequency: alertFrequency || "weekly",
        });

        await saved.save();
        res.status(201).json({ message: "Search saved", savedSearch: saved });
    } catch (err) {
        console.error("Save search error:", err);
        res.status(500).json({ error: "Failed to save search" });
    }
});

/* =========================================
   GET /api/saved-searches
   List all saved searches for the user
========================================= */
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });

        const searches = await SavedSearch.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ savedSearches: searches });
    } catch (err) {
        console.error("List saved searches error:", err);
        res.status(500).json({ error: "Failed to load saved searches" });
    }
});

/* =========================================
   PATCH /api/saved-searches/:id
   Update name, frequency, or active status
========================================= */
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const search = await SavedSearch.findOne({
            _id: req.params.id,
            userId,
        });
        if (!search) return res.status(404).json({ error: "Saved search not found" });

        const { name, alertFrequency, isActive } = req.body;
        if (name !== undefined) search.name = name;
        if (alertFrequency !== undefined) search.alertFrequency = alertFrequency;
        if (isActive !== undefined) search.isActive = isActive;

        await search.save();
        res.json({ message: "Updated", savedSearch: search });
    } catch (err) {
        console.error("Update saved search error:", err);
        res.status(500).json({ error: "Failed to update saved search" });
    }
});

/* =========================================
   DELETE /api/saved-searches/:id
   Remove a saved search
========================================= */
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await SavedSearch.findOneAndDelete({
            _id: req.params.id,
            userId,
        });
        if (!result) return res.status(404).json({ error: "Saved search not found" });

        res.json({ message: "Saved search deleted" });
    } catch (err) {
        console.error("Delete saved search error:", err);
        res.status(500).json({ error: "Failed to delete saved search" });
    }
});

export default router;
