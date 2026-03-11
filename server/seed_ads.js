import mongoose from "mongoose";
import dotenv from "dotenv";
import Advertisement from "./models/Advertisement.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hamroghar";

const seedAds = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing
    await Advertisement.deleteMany({});
    
    // Future date
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const mockupAds = [
      {
        sponsorName: "Sunrise Bank Home Loans",
        imageUrl: "https://placehold.co/1200x200/2563eb/ffffff?text=Get+Your+Dream+Home!+-+Sunrise+Bank+Home+Loans+(8.5%+PA)",
        targetUrl: "https://example.com/sunrise-bank",
        zone: "hero",
        isActive: true,
        expiresAt: nextMonth,
      },
      {
        sponsorName: "Berger Paints Nepal",
        imageUrl: "https://placehold.co/1200x200/ef4444/ffffff?text=Paint+Your+New+House+-+Berger+Paints+Special+Discount",
        targetUrl: "https://example.com/berger",
        zone: "feed",
        isActive: true,
        expiresAt: nextMonth,
      },
      {
        sponsorName: "Index Furniture",
        imageUrl: "https://placehold.co/600x1200/10b981/ffffff?text=Furnish+Your+New+Properties+-+Index+Furniture+Nepal",
        targetUrl: "https://example.com/furnish",
        zone: "sidebar",
        isActive: true,
        expiresAt: nextMonth,
      }
    ];

    await Advertisement.insertMany(mockupAds);
    console.log("Successfully inserted 3 Mockup Ads (Hero, Feed, Sidebar)!");
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAds();
