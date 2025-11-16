import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import membershipRoutes from './routes/membership.js';
import listingsRoutes from "./routes/listings.js";
import userRoutes from './routes/user.js';
import seedRoutes from "./routes/seed.js";


const app = express();

// --- Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000', // your React dev server
    credentials: true,                // allow cookies
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
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use("/api", seedRoutes);
app.use('/api/users', userRoutes);
// serve uploaded files
app.use("/uploads", express.static("uploads"));

// listings routes
app.use("/api/listings", listingsRoutes);

// --- Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
