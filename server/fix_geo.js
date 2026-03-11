import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const GEOCODE_ENDPOINT = "https://nominatim.openstreetmap.org/search?format=json";

async function forwardGeocode(q, city) {
  if (!q && !city) return null;
  const queries = [];
  if (q && city) queries.push(`${q}, ${city}, Nepal`);
  if (q) queries.push(`${q}, Nepal`);
  if (city) queries.push(`${city}, Nepal`);

  for (const query of queries) {
    const url = `${GEOCODE_ENDPOINT}&limit=1&countrycodes=np&addressdetails=1&q=${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "HamroGharFix/1.0" } });
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;
      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lng: lon };
    } catch (err) {
      console.error(err);
    }
  }
  return null;
}

import Listing from './models/Listing.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hamroghar");
  console.log("Connected to MongoDB");

  const listings = await Listing.find({});
  let fixedCount = 0;

  for (const l of listings) {
    if (!l.location || !l.location.lat || l.location.lat === 0 || !l.location.lng) {
      console.log(`Geocoding missing coords for: ${l.title} (${l.address})`);
      const geo = await forwardGeocode(l.location?.tole || l.address, l.location?.district || l.city);
      if (geo) {
        if (!l.location) l.location = {};
        l.location.lat = geo.lat;
        l.location.lng = geo.lng;
        l.location.type = "Point";
        l.location.coordinates = [geo.lng, geo.lat];
        await l.save();
        fixedCount++;
        console.log(`✅ Fixed: ${geo.lat}, ${geo.lng}`);
      } else {
        console.log(`❌ Failed: Could not find coords`);
      }
      // rate limit OpenStreetMap intentionally
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Also fix "National Academy" or wildly inaccurate ones (outside Nepal bounds roughly lat 26-31, lng 80-89)
  for (const l of listings) {
    if (l.location?.lat && l.location?.lng) {
       if (l.location.lat < 26 || l.location.lat > 31 || l.location.lng < 80 || l.location.lng > 89) {
          console.log(`Fixing out-of-bounds coords for: ${l.title} (Currently ${l.location.lat}, ${l.location.lng})`);
          const geo = await forwardGeocode(l.location?.tole || l.address, l.location?.district || l.city);
          if (geo) {
            l.location.lat = geo.lat;
            l.location.lng = geo.lng;
            l.location.coordinates = [geo.lng, geo.lat];
            await l.save();
            fixedCount++;
            console.log(`✅ Re-Fixed: ${geo.lat}, ${geo.lng}`);
          }
          await new Promise(r => setTimeout(r, 1000));
       }
    }
  }
  
  console.log(`Finished fixing ${fixedCount} listings!`);
  process.exit(0);
}

run();
