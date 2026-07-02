import express from 'express';
import Advertisement from '../models/Advertisement.js';

const router = express.Router();

/* =========================================
   1. GET /api/ads/active
   Fetch all currently active ads that haven't expired
========================================= */
router.get('/active', async (req, res) => {
  try {
    const activeAds = await Advertisement.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    // Group ads by zone for easier frontend consumption
    const adsByZone = activeAds.reduce((acc, ad) => {
      if (!acc[ad.zone]) {
        acc[ad.zone] = [];
      }
      acc[ad.zone].push(ad);
      return acc;
    }, {});

    res.json(adsByZone);
  } catch (err) {
    console.error('Error fetching active ads:', err);
    res.status(500).json({ error: 'Failed to load advertisements' });
  }
});

export default router;
