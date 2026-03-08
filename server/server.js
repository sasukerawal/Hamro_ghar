import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import membershipRoutes from './routes/membership.js';
import listingsRoutes from "./routes/listings.js";
import userRoutes from './routes/user.js';
import reviewsRoutes from './routes/reviews.js';
import siteReviewsRoutes from './routes/siteReviews.js';
import './services/listingExpiry.js'; // starts cron on boot

const app = express();

// --- Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// --- DB
const { MONGO_URI, PORT = 4000 } = process.env;
mongoose
  .connect(MONGO_URI, { dbName: 'hamroghar' })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

// --- Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', apiLimiter, reviewsRoutes);
app.use('/api/site-reviews', apiLimiter, siteReviewsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/listings", apiLimiter, listingsRoutes);

// --- Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Export createLimiter so routes can use it
export { createLimiter };

