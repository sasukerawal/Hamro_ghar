import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/membership
router.get('/', requireAuth, (req, res) => {
  // Only logged-in users can see this content
  res.json({
    message: `Welcome, ${req.user.email}! This is your membership content.`,
    tips: [
      'Early access to listings',
      'Saved searches & alerts',
      'Priority support'
    ]
  });
});

export default router;
