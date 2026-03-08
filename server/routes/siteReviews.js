// server/routes/siteReviews.js
import express from "express";
import SiteReview from "../models/SiteReview.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* GET /api/site-reviews — public */
router.get("/", async (req, res) => {
  try {
    const reviews = await SiteReview.find().sort({ createdAt: -1 }).lean();
    const avgRating =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
          ) / 10
        : null;
    res.json({ reviews, avgRating, count: reviews.length });
  } catch (err) {
    console.error("Get site reviews error:", err);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

/* POST /api/site-reviews — auth, one per user (upsert) */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be 1–5" });
    if (!comment || comment.trim().length < 5)
      return res.status(400).json({ error: "Comment must be at least 5 characters" });
    if (comment.trim().length > 400)
      return res.status(400).json({ error: "Comment must be under 400 characters" });

    const reviewer = await User.findById(req.user.id).select("name");
    const userName = reviewer?.name || "Anonymous";

    const review = await SiteReview.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, userName, rating: Number(rating), comment: comment.trim() },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json({ review });
  } catch (err) {
    console.error("Post site review error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

/* DELETE /api/site-reviews/:id — own review only */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const review = await SiteReview.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Not found" });
    if (String(review.userId) !== String(req.user.id))
      return res.status(403).json({ error: "Not your review" });
    await review.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
