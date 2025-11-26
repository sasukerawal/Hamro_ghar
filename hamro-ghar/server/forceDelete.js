import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config'; // Load .env variables

// 👇 REPLACE THIS with the email you are stuck on
const EMAIL_TO_DELETE = 'rawaludit777@gmail.com'; 

const run = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGO_URI); // Verify it's reading the URI

    await mongoose.connect(process.env.MONGO_URI, { dbName: 'hamroghar' });
    console.log('✅ Connected to DB');

    // 1. Find the user first to confirm existence
    const existingUser = await User.findOne({ email: EMAIL_TO_DELETE });
    
    if (existingUser) {
      console.log(`🔎 Found user: ${existingUser.email} (ID: ${existingUser._id})`);
      
      // 2. Delete the user
      const result = await User.deleteOne({ email: EMAIL_TO_DELETE });
      
      if (result.deletedCount === 1) {
        console.log('🗑️ SUCCESS: User deleted permanently.');
      } else {
        console.log('❌ ERROR: Delete command ran but returned 0 deleted count.');
      }
    } else {
      console.log(`❓ User with email "${EMAIL_TO_DELETE}" NOT FOUND in database.`);
    }

  } catch (err) {
    console.error('❌ SCRIPT ERROR:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
};

run();