// server/server.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";      // ✅ NEW: HTTP server wrapper
import { Server } from "socket.io";       // ✅ NEW: Socket.io
import jwt from "jsonwebtoken";           // ✅ For auth in sockets
import cookie from "cookie";              // ✅ To read cookie from headers

// --- Routes & Models ---
import authRoutes from "./routes/auth.js";
import membershipRoutes from "./routes/membership.js";
import listingsRoutes from "./routes/listings.js";
import userRoutes from "./routes/user.js";
import seedRoutes from "./routes/seed.js";
import messageRoutes from "./routes/messages.js"; // ✅ New messages API
import Message from "./models/Message.js";        // ✅ Message model

const app = express();
const httpServer = createServer(app); // ✅ Wrap Express in HTTP server

// --- Middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000", // your React dev server
  credentials: true,               // allow cookies
};
app.use(cors(corsOptions));

// --- DB
const { MONGO_URI, PORT = 4000, JWT_SECRET } = process.env;

mongoose
  .connect(MONGO_URI, { dbName: "hamroghar" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// --- Routes
app.use("/api/auth", authRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api", seedRoutes);
app.use("/api/users", userRoutes);

// serve uploaded files
app.use("/uploads", express.static("uploads"));

// listings routes
app.use("/api/listings", listingsRoutes);

// ✅ messages routes
app.use("/api/messages", messageRoutes);

// --- Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --------------------------------------------------
// 🔌 SOCKET.IO CHAT SETUP
// --------------------------------------------------
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Socket auth using the same JWT cookie as HTTP
io.use((socket, next) => {
  try {
    const cookieStr = socket.handshake.headers.cookie;
    if (!cookieStr) return next(new Error("Authentication error"));

    const cookies = cookie.parse(cookieStr);
    const token = cookies.token;
    if (!token) return next(new Error("Authentication error"));

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.user = decoded; // { id, email, ... } from your JWT
      next();
    });
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  if (!socket.user?.id) {
    console.warn("Socket connected without user.id");
    socket.disconnect();
    return;
  }

  console.log(`⚡ User connected: ${socket.user.id}`);

  // Each user joins a room with their own ID (for private messages)
  socket.join(socket.user.id);

  // Listen for outgoing messages
  socket.on("sendMessage", async ({ to, content }) => {
    try {
      if (!to || !content || !content.trim()) return;

      // 1. Save message to DB
      const message = new Message({
        senderId: socket.user.id,
        receiverId: to,
        content: content.trim(),
      });

      await message.save();

      // 2. Deliver to receiver (if online)
      io.to(to).emit("receiveMessage", message);

      // 3. Also send back to sender so UI gets final saved version
      socket.emit("receiveMessage", message);
    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.id}`);
  });
});

// ✅ Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
