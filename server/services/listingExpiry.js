// server/services/listingExpiry.js
// Runs daily at 2 AM — marks listings older than 90 days as unavailable
import cron from 'node-cron';
import Listing from '../models/Listing.js';

const EXPIRY_DAYS = 90;

async function expireOldListings() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);

    const result = await Listing.updateMany(
      {
        status: 'active',
        createdAt: { $lt: cutoff },
      },
      { $set: { status: 'unavailable' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Expiry] Deactivated ${result.modifiedCount} listings older than ${EXPIRY_DAYS} days`);
    }
  } catch (err) {
    console.error('[Expiry] Error running expiry job:', err.message);
  }
}

// Run once at startup (catch any missed runs), then daily at 02:00
expireOldListings();
cron.schedule('0 2 * * *', expireOldListings);

console.log('✅ Listing expiry cron scheduled');
