import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
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
import adsRoutes from './routes/ads.js';
import savedSearchRoutes from './routes/savedSearches.js';
import messagesRoutes from './routes/messages.js';
import Message from './models/Message.js';
import './services/listingExpiry.js'; // starts cron on boot

const app = express();
app.set('trust proxy', 1);

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

// Explicit origin allowlist. `origin: true` (reflect-any-origin) combined
// with credentials:true would let ANY website read authenticated API
// responses using a victim's cookies — this restricts credentialed
// cross-origin requests to known frontends only.
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://hamro-ghar.vercel.app',
  ...(process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : []),
];
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header, e.g. curl/health checks)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
// These three check a brute-forceable 6-digit code — same limiter as
// login/register, since an unthrottled code-check endpoint is exactly
// as exploitable as an unthrottled password check.
app.use('/api/auth/verify', authLimiter);
app.use('/api/auth/resend-code', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/reviews', apiLimiter, reviewsRoutes);
app.use('/api/site-reviews', apiLimiter, siteReviewsRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/listings", apiLimiter, listingsRoutes);
app.use("/api/ads", apiLimiter, adsRoutes);
app.use("/api/saved-searches", apiLimiter, savedSearchRoutes);
app.use("/api/messages", apiLimiter, messagesRoutes);

// --- Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- HTTP + Socket.IO server
// Express 5 doesn't need an explicit http server for plain HTTP, but
// socket.io needs to hook into the raw http server to upgrade connections.
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// Authenticate every socket connection with the same JWT the REST API uses,
// so this isn't an open unauthenticated relay. Token can come from the
// handshake `auth` payload (preferred, sent by src/socket.js) or the
// `token` cookie (same convention as requireAuth in middleware/auth.js).
io.use((socket, next) => {
  try {
    const bearer = socket.handshake.headers?.authorization;
    const token =
      socket.handshake.auth?.token ||
      (bearer && bearer.startsWith('Bearer ') ? bearer.split(' ')[1] : null) ||
      socket.handshake.headers?.cookie
        ?.split('; ')
        .find((c) => c.startsWith('token='))
        ?.split('=')[1];

    if (!token) return next(new Error('Not authenticated'));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = String(payload.id);
    socket.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  // Each user gets a private room keyed by their own id, so we can push
  // messages to them regardless of how many tabs/devices they have open.
  socket.join(socket.userId);

  socket.on('sendMessage', async ({ to, content } = {}) => {
    try {
      const receiverId = to && String(to).trim();
      const text = content && String(content).trim();
      if (!receiverId || !text) return;

      const saved = await Message.create({
        senderId: socket.userId,
        receiverId,
        content: text,
      });

      // Deliver to the recipient (if online) and echo back to the sender
      // so their own outgoing message renders immediately.
      io.to(receiverId).emit('receiveMessage', saved);
      io.to(socket.userId).emit('receiveMessage', saved);
    } catch (err) {
      console.error('sendMessage error:', err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });
});

httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Export createLimiter so routes can use it
export { createLimiter };

