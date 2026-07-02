import express from "express";
import Listing from "../models/Listing.js";

const router = express.Router();

router.get("/seed", async (req, res) => {
  try {
    const demo = [
      {
        ownerId: "673b32215237babfaabc1234", // <-- PUT YOUR USER ID HERE
        title: "Modern Apartment, Lazimpat",
        description: "Beautiful apartment in the heart of Kathmandu",
        price: 45000,
        address: "Lazimpat Road",
        city: "Kathmandu",
        beds: 3,
        baths: 2,
        sqft: 1450,
        images: ["https://via.placeholder.com/600x400"],
      },
    ];

    await Listing.insertMany(demo);

    res.json({ message: "Seeded!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Seed failed" });
  }
});

export default router;
