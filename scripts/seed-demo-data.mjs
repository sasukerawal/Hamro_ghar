// scripts/seed-demo-data.mjs
//
// Seeds 5 real accounts + 1 listing + 1 review each on the LIVE production
// site (https://hamro-ghar.vercel.app / https://hamroghar-api.onrender.com).
//
// YOU run this yourself: `node scripts/seed-demo-data.mjs`
//
// Resend's sandbox mode rejects all 5 test-alias addresses (confirmed via
// direct API test — it only delivers to the exact account-owner address,
// not +alias variants), so no verification email will ever arrive. Rather
// than wait on an email that can't come, this script reads each account's
// verificationCode straight from MongoDB (server/.env's MONGO_URI) right
// after registering it, then calls /verify with that code — same flow a
// real user goes through, just sourcing the code from the DB instead of
// an inbox. This is a narrow workaround for seeding; it does not fix
// email delivery for real users, who still need a verified Resend domain.
//
// Requires server/.env (for MONGO_URI) to be present at ../server/.env
// relative to this script — i.e. run from within the hamro-ghar project.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "../server/node_modules/mongodb/lib/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://hamroghar-api.onrender.com/api";
const IMAGE_DIR = path.join(__dirname, "seed-images");

function loadMongoUri() {
  const envPath = path.join(__dirname, "..", "server", ".env");
  const envText = fs.readFileSync(envPath, "utf8");
  const match = envText.match(/^MONGO_URI=(.+)$/m);
  if (!match) throw new Error("MONGO_URI not found in server/.env");
  return match[1].trim();
}

const BASE_EMAIL = "rawaludit777@gmail.com";
const [LOCAL, DOMAIN] = BASE_EMAIL.split("@");
const PASSWORD = "SeedDemo!2026"; // shared throwaway password for all 5 test accounts

const ACCOUNTS = [
  {
    alias: `${LOCAL}+test1@${DOMAIN}`,
    name: "Sabina Shrestha",
    listing: {
      type: "rent",
      propertyType: "apartment",
      category: "home",
      price: 18000,
      description:
        "Bright 2BHK flat in Baneshwor with a private balcony, 24/7 water supply, and easy access to Ring Road. Ideal for a small family or working professionals.",
      location: { province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kathmandu Metropolitan City", locality: "Baneshwor" },
      specs: { bedrooms: 2, bathrooms: 1, builtUpAreaSqFt: 850, furnishing: "semi" },
      contact: { phone: "9800000001", name: "Sabina Shrestha" },
      images: ["house1.jpg", "house2.jpg", "house3.jpg"],
    },
    review: { rating: 5, comment: "Found a genuine listing within two days, no broker fees. Owner was responsive and the flat matched the photos exactly." },
  },
  {
    alias: `${LOCAL}+test2@${DOMAIN}`,
    name: "Bikash Gurung",
    listing: {
      type: "sale",
      propertyType: "house",
      category: "home",
      price: 15000000,
      description:
        "3-storey family home in Pokhara with a private garden and mountain views. Recently renovated kitchen and bathrooms, quiet residential lane.",
      location: { province: "Gandaki Pradesh", district: "Kaski", municipality: "Pokhara Metropolitan City", locality: "Lakeside" },
      specs: { bedrooms: 4, bathrooms: 3, builtUpAreaSqFt: 2400, furnishing: "unfurnished" },
      contact: { phone: "9800000002", name: "Bikash Gurung" },
      images: ["house4.jpg", "house5.jpg", "house6.jpg"],
    },
    review: { rating: 4, comment: "Good selection of verified listings for Pokhara, which is usually hard to find online. Search filters could use a map view on mobile." },
  },
  {
    alias: `${LOCAL}+test3@${DOMAIN}`,
    name: "Anita Koirala",
    listing: {
      type: "rent",
      propertyType: "room",
      category: "hostel",
      hostelType: "girls",
      price: 7500,
      description:
        "Girls-only hostel room near Kirtipur campus, includes wifi, laundry, and a shared kitchen. Walking distance to Tribhuvan University.",
      location: { province: "Bagmati Pradesh", district: "Kathmandu", municipality: "Kirtipur Municipality", locality: "Panga" },
      specs: { bedrooms: 1, bathrooms: 1, builtUpAreaSqFt: 180, furnishing: "fully" },
      contact: { phone: "9800000003", name: "Anita Koirala" },
      images: ["house7.jpg", "house8.jpg", "house9.jpg"],
    },
    review: { rating: 5, comment: "As a student, the hostel listings with verified badges made it so much easier to avoid scam ads. Highly recommend for anyone searching near campus." },
  },
  {
    alias: `${LOCAL}+test4@${DOMAIN}`,
    name: "Rajesh Maharjan",
    listing: {
      type: "rent",
      propertyType: "apartment",
      category: "home",
      price: 25000,
      description:
        "Modern 3BHK apartment in Lalitpur with covered parking, elevator access, and a rooftop terrace. Close to Patan Durbar Square.",
      location: { province: "Bagmati Pradesh", district: "Lalitpur", municipality: "Lalitpur Metropolitan City", locality: "Jawalakhel" },
      specs: { bedrooms: 3, bathrooms: 2, builtUpAreaSqFt: 1350, furnishing: "semi" },
      contact: { phone: "9800000004", name: "Rajesh Maharjan" },
      images: ["house10.jpg", "house11.jpg", "house12.jpg"],
    },
    review: { rating: 4, comment: "Listing process as an owner was quick — uploaded photos and had my apartment live in under ten minutes." },
  },
  {
    alias: `${LOCAL}+test5@${DOMAIN}`,
    name: "Sunita Tamang",
    listing: {
      type: "sale",
      propertyType: "land",
      category: "home",
      price: 8000000,
      description:
        "8 aana residential plot in a developing area of Bhaktapur, road access on two sides, close to schools and a local market.",
      location: { province: "Bagmati Pradesh", district: "Bhaktapur", municipality: "Bhaktapur Municipality", locality: "Suryabinayak" },
      specs: {},
      contact: { phone: "9800000005", name: "Sunita Tamang" },
      images: ["house13.jpg", "house14.jpg", "house15.jpg"],
    },
    review: { rating: 5, comment: "Great to see land listings alongside rentals — most sites only cover one or the other. Verification badge gave me confidence to inquire." },
  },
];

async function registerAccount(usersCollection, account) {
  // Idempotent: a prior run may have already created this account (in
  // an unverified or verified state) — reuse it instead of failing.
  let existing = await usersCollection.findOne(
    { email: account.alias.toLowerCase() },
    { projection: { isVerified: 1, verificationCode: 1 } }
  );

  if (!existing) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: account.name, email: account.alias, password: PASSWORD }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`  ✗ Register failed for ${account.alias}: ${data.error || res.status}`);
      return null;
    }
    console.log(`  ✓ Registered ${account.alias} (email delivery expected to fail — reading code from DB instead)`);
    existing = await usersCollection.findOne(
      { email: account.alias.toLowerCase() },
      { projection: { isVerified: 1, verificationCode: 1 } }
    );
  } else {
    console.log(`  · Account already exists in DB (isVerified: ${existing.isVerified}) — reusing it`);
  }

  if (existing.isVerified) {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: account.alias, password: PASSWORD }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error(`  ✗ Login failed for already-verified ${account.alias}: ${loginData.error || loginRes.status}`);
      return null;
    }
    console.log(`  ✓ Logged in ${account.alias}`);
    return loginData.token;
  }

  if (!existing.verificationCode) {
    console.error(`  ✗ Could not find verificationCode in DB for ${account.alias}`);
    return null;
  }

  const verifyRes = await fetch(`${API_BASE}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: account.alias, code: existing.verificationCode }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) {
    console.error(`  ✗ Verify failed for ${account.alias}: ${verifyData.error || verifyRes.status}`);
    return null;
  }
  console.log(`  ✓ Verified ${account.alias}`);
  return verifyData.token;
}

async function createListing(token, listing) {
  const form = new FormData();
  form.append("type", listing.type);
  form.append("propertyType", listing.propertyType);
  form.append("category", listing.category);
  if (listing.hostelType) form.append("hostelType", listing.hostelType);
  form.append("description", listing.description);
  form.append("price", String(listing.price));
  form.append("location", JSON.stringify(listing.location));
  form.append("specs", JSON.stringify(listing.specs));
  form.append("contact", JSON.stringify(listing.contact));

  for (const filename of listing.images) {
    const filePath = path.join(IMAGE_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    form.append("images", new Blob([buffer], { type: "image/jpeg" }), filename);
  }

  const res = await fetch(`${API_BASE}/listings/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  ✗ Listing creation failed: ${data.error || res.status}`);
    return null;
  }
  console.log(`  ✓ Listing created: "${data.listing?.title || listing.description.slice(0, 40)}"`);
  return data.listing;
}

async function postReview(token, review) {
  const res = await fetch(`${API_BASE}/site-reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(review),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  ✗ Review failed: ${data.error || res.status}`);
    return null;
  }
  console.log(`  ✓ Review posted (${review.rating}★)`);
  return data.review;
}

async function main() {
  console.log(`Seeding 5 demo accounts against ${API_BASE}\n`);

  const mongoUri = loadMongoUri();
  const client = new MongoClient(mongoUri);
  await client.connect();
  const usersCollection = client.db("hamroghar").collection("users");

  const results = [];
  for (const account of ACCOUNTS) {
    console.log(`\n=== ${account.name} <${account.alias}> ===`);
    const token = await registerAccount(usersCollection, account);
    if (!token) { results.push({ account: account.alias, ok: false }); continue; }

    const listing = await createListing(token, account.listing);
    const review = await postReview(token, account.review);
    results.push({ account: account.alias, ok: true, listing: !!listing, review: !!review });
  }

  await client.close();

  console.log("\n\n=== Summary ===");
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.account}${r.ok ? ` (listing: ${r.listing ? "ok" : "FAILED"}, review: ${r.review ? "ok" : "FAILED"})` : " — account setup failed"}`);
  }
  console.log(`\nShared password for all 5 test accounts: ${PASSWORD}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
