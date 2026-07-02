// server/routes/messages.js
import express from "express";
import Message from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Small helper to get current user ID safely
function getUserId(req) {
  if (req.user?.id) return req.user.id;
  if (req.user?._id) return req.user._id.toString();
  return null;
}

// GET /api/messages/history/:otherUserId?limit=50
router.get("/history/:otherUserId", requireAuth, async (req, res) => {
  try {
    const myId = getUserId(req);
    const { otherUserId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!myId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!otherUserId || !otherUserId.trim()) {
      return res.status(400).json({ error: "Missing other user id" });
    }

    // All messages between Me and Other
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 }) // oldest first
      .limit(limit);

    res.json(messages);
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
