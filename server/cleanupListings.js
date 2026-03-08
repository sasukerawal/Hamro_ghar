import mongoose from 'mongoose';
import Listing from './models/Listing.js';
import User from './models/User.js';
import 'dotenv/config';

const run = async () => {
  try {
    console.log('🔌 Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'hamroghar' });
    console.log('✅ Connected');

    // 1. Get all user IDs
    const users = await User.find({}, '_id');
    const userIds = users.map(u => u._id.toString());
    console.log(`Found ${userIds.length} valid users.`);

    // 2. Find listings with ownerId NOT in userIds
    const orphanedListings = await Listing.find({
      ownerId: { $nin: userIds }
    });

    console.log(`Found ${orphanedListings.length} orphaned listings.`);

    if (orphanedListings.length > 0) {
      // 3. Delete them
      const res = await Listing.deleteMany({
        ownerId: { $nin: userIds }
      });
      console.log(`🗑️ Deleted ${res.deletedCount} listings.`);
    } else {
      console.log('✨ No orphaned listings found. Database is clean.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
};

run();