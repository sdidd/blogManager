const { RedisMemoryServer } = require("redis-memory-server");
const redis = require("redis");
require('dotenv').config();

let RedisClient;
let PubSubClient;

(async () => {
  try {
    let redisConfig = {};

    if (process.env.NODE_ENV === "production") {
      // Production Configuration
      const host = process.env.REDIS_URL || "127.0.0.1";
      const port = process.env.REDIS_PORT || 6379;

      console.log(`[INFO] Production Redis running at ${host}:${port}`);

      redisConfig = {
        socket: { host, port: Number(port) },
      };
    } else {
      // Development Configuration with In-Memory Redis
      const redisServer = new RedisMemoryServer();
      const host = await redisServer.getHost();
      const port = await redisServer.getPort();

      console.log(`[DEBUG] In-memory Redis running at ${host}:${port}`);

      redisConfig = {
        socket: { host, port },
      };
    }

    // Create the regular Redis client for non-Pub/Sub commands
    RedisClient = redis.createClient(redisConfig);

    // Create a separate Pub/Sub Redis client
    PubSubClient = redis.createClient(redisConfig);

    // Handle Connection Events
    RedisClient.on("connect", () => {
      console.log("[INFO] Redis client connected");
    });

    PubSubClient.on("connect", () => {
      console.log("[INFO] Redis Pub/Sub client connected");
    });

    RedisClient.on("error", (err) => {
      console.error("[ERROR] Redis connection error:", err);
    });

    PubSubClient.on("error", (err) => {
      console.error("[ERROR] Redis Pub/Sub connection error:", err);
    });

    // Connect both clients
    await RedisClient.connect();
    await PubSubClient.connect();
  } catch (err) {
    console.error("[ERROR] Failed to initialize Redis:", err);
  }
})();

const getRedisClient = () => {
  if (!RedisClient) {
    throw new Error("RedisClient is not initialized. Please check Redis configuration.");
  }
  return RedisClient;
};

const getPubSubClient = () => {
  if (!PubSubClient) {
    throw new Error("PubSubClient is not initialized. Please check Redis configuration.");
  }
  return PubSubClient;
};

module.exports = { getRedisClient, getPubSubClient };
