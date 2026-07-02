// server/routes/reviews.js
import express from "express";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* =========================================
   GET /api/reviews/:listingId
   Public — get all reviews + avg rating
========================================= */
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .sort({ createdAt: -1 })
      .lean();

    const avgRating =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
          ) / 10
        : null;

    res.json({ reviews, avgRating, count: reviews.length });
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

/* =========================================
   POST /api/reviews/:listingId
   Auth — create or update own review
========================================= */
router.post("/:listingId", requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!comment || comment.trim().length < 5) {
      return res
        .status(400)
        .json({ error: "Comment must be at least 5 characters" });
    }
    if (comment.trim().length > 500) {
      return res
        .status(400)
        .json({ error: "Comment must be under 500 characters" });
    }

    // Fetch reviewer name from DB
    const reviewer = await User.findById(reviewerId).select("name");
    const reviewerName = reviewer?.name || "Anonymous";
    const review = await Review.findOneAndUpdate(
      { listingId: req.params.listingId, reviewerId },
      {
        listingId: req.params.listingId,
        reviewerId,
        reviewerName,
        rating: Number(rating),
        comment: comment.trim(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(201).json({ review });
  } catch (err) {
    console.error("Post review error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

/* =========================================
   DELETE /api/reviews/:id
   Auth — reviewer can delete own review
========================================= */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (String(review.reviewerId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Not your review" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
