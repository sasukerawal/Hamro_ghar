import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Listing from './models/Listing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hamroghar");
  const listings = await Listing.find({}).select('title address location city');
  for (const l of listings) {
    if (l.location?.lat) {
      console.log(`- ${l.title} (${l.address || l.city}): ${l.location?.lat}, ${l.location?.lng}`);
    } else {
      console.log(`- ${l.title} (${l.address || l.city}): MISSING LOCATION DATA`);
    }
  }
  process.exit(0);
}

run();
