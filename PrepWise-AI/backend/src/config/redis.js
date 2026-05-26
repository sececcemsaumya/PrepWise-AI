const Redis = require("ioredis");

let redisClient = null;
const fallbackMap = new Map();
const fallbackTimers = new Map();

const connectRedis = () => {
  if (process.env.REDIS_ENABLED === "false") {
    console.log("ℹ️ Redis is disabled via REDIS_ENABLED. Seamlessly using local in-memory map for caching.");
    return;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  console.log(`📡 Connecting to Redis at ${redisUrl}...`);
  
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("⚠️ Redis connection failed 3 times. Seamlessly falling back to local in-memory map.");
          return null; // Stop retrying and fallback
        }
        const delay = Math.min(times * 100, 1000);
        return delay;
      }
    });

    let wasConnected = false;
    let connectionErrorLogged = false;

    redisClient.on("connect", () => {
      // ioredis is trying to connect
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis server ready and connected!");
      wasConnected = true;
      connectionErrorLogged = false;
    });

    redisClient.on("error", (error) => {
      if (error.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED")) {
        if (!connectionErrorLogged) {
          console.warn(`⚠️ Redis server is not running or unreachable at ${redisUrl}. Checking connection...`);
          connectionErrorLogged = true;
        }
      } else {
        console.error("❌ Redis connection error:", error.message);
      }
    });

    redisClient.on("close", () => {
      if (wasConnected) {
        console.warn("⚠️ Redis connection closed.");
        wasConnected = false;
      }
    });
  } catch (err) {
    console.error("❌ Failed to instantiate Redis client:", err.message);
  }
};

const getRedisClient = () => redisClient;

/**
 * Get a cached value by key
 */
const redisGet = async (key) => {
  if (redisClient && redisClient.status === "ready") {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error(`❌ redisGet error for key "${key}":`, error.message);
    }
  }
  
  // Fallback to in-memory map
  const entry = fallbackMap.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    fallbackMap.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * Set a value with TTL in seconds
 */
const redisSet = async (key, value, ttlSeconds = 3600) => {
  if (redisClient && redisClient.status === "ready") {
    try {
      if (ttlSeconds) {
        await redisClient.set(key, value, "EX", ttlSeconds);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`❌ redisSet error for key "${key}":`, error.message);
    }
  }

  // Fallback to in-memory map
  if (fallbackTimers.has(key)) {
    clearTimeout(fallbackTimers.get(key));
  }
  fallbackMap.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  const timer = setTimeout(() => {
    fallbackMap.delete(key);
    fallbackTimers.delete(key);
  }, ttlSeconds * 1000);
  fallbackTimers.set(key, timer);
  return true;
};

/**
 * Delete a cached value
 */
const redisDel = async (key) => {
  let deletedFromRedis = false;
  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.del(key);
      deletedFromRedis = true;
    } catch (error) {
      console.error(`❌ redisDel error for key "${key}":`, error.message);
    }
  }

  // Fallback to in-memory map
  if (fallbackTimers.has(key)) {
    clearTimeout(fallbackTimers.get(key));
    fallbackTimers.delete(key);
  }
  const deletedFromMap = fallbackMap.delete(key);
  return deletedFromRedis || deletedFromMap;
};

module.exports = { connectRedis, getRedisClient, redisGet, redisSet, redisDel };
