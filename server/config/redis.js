import Redis from "ioredis";

// Use REDIS_URL from env if available, fallback to localhost default
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let isConnected = false;

const redisClient = new Redis(redisUrl, {
  // Retry strategy limits reconnect attempts if Redis is really down
  retryStrategy(times) {
    if (times > 3) {
      console.warn("⚠️ Redis connection failed. Caching will be disabled.");
      return null;
    }
    return Math.min(times * 100, 2000);
  },
  maxRetriesPerRequest: 1,
});

redisClient.on("error", (err) => {
  // suppress spammy connection refused errors
  if (err.code !== "ECONNREFUSED") {
    console.error("Redis client error:", err.message);
  }
});

redisClient.on("connect", () => {
  isConnected = true;
  console.log("🟢 Connected to Redis");
});

redisClient.on("end", () => {
  isConnected = false;
});

// Create a safe wrapper that simply does nothing if Redis isn't connected
const redis = {
  get: async (key) => {
    if (!isConnected) return null;
    try { return await redisClient.get(key); } catch (e) { return null; }
  },
  setex: async (key, seconds, value) => {
    if (!isConnected) return "OK";
    try { return await redisClient.setex(key, seconds, value); } catch (e) { return "OK"; }
  },
  del: async (...keys) => {
    if (!isConnected || keys.length === 0) return 0;
    try { return await redisClient.del(...keys); } catch (e) { return 0; }
  },
  keys: async (pattern) => {
    if (!isConnected) return [];
    try { return await redisClient.keys(pattern); } catch (e) { return []; }
  }
};

export default redis;
