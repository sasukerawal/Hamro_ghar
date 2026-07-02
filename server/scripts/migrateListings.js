import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Listing from "../models/Listing.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} existing listings to process.`);

    let migratedCount = 0;

    for (const listing of listings) {
      let needsSave = false;
      const updates = {};

      // 1. Move old 'beds', 'baths', 'sqft' to specs
      if (!listing.specs) {
        listing.specs = {};
        needsSave = true;
      }

      if (listing.beds !== undefined && listing.specs.bedrooms === undefined) {
        listing.specs.bedrooms = listing.beds;
        needsSave = true;
      }
      if (listing.baths !== undefined && listing.specs.bathrooms === undefined) {
        listing.specs.bathrooms = listing.baths;
        needsSave = true;
      }
      if (listing.sqft !== undefined && listing.specs.builtUpAreaSqFt === undefined) {
        listing.specs.builtUpAreaSqFt = listing.sqft;
        needsSave = true;
      }

      // Map furnished, parking, etc.
      if (listing.furnished && listing.specs.furnishing === undefined) {
        listing.specs.furnishing = "fully";
        needsSave = true;
      }
      if (listing.parking && listing.specs.parking === undefined) {
        listing.specs.parking = 1; // Arbitrarily set to 1 if boolean was true
        needsSave = true;
      }

      // 2. Map old 'city' to 'location.district' and 'location.municipality' roughly
      if (!listing.location) {
        listing.location = {
            type: "Point",
            coordinates: [0, 0]
        };
        needsSave = true;
      }

      if (listing.city && (!listing.location.district || !listing.location.municipality)) {
        // Just plop the city into both to satisfy structure for now
        listing.location.district = listing.city;
        // fallback municipality
        listing.location.municipality = listing.city;
        needsSave = true;
      }
      
      if (listing.address && !listing.location.locality) {
        listing.location.locality = listing.address.substring(0, 50); // Just a slice
        needsSave = true;
      }

      if (needsSave) {
        await listing.save();
        migratedCount++;
        console.log(`Migrated: ${listing._id} - ${listing.title}`);
      }
    }

    console.log(`\n🎉 Migration Complete! Successfully migrated ${migratedCount} listings.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
