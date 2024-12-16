const { RedisMemoryServer } = require("redis-memory-server");
const redis = require("redis");
require('dotenv').config();

let RedisClient;
let PubSubClient;

(async () => {
  try {
    const redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();

    console.log(`[DEBUG] In-memory Redis running at ${host}:${port}`);

    // Create the regular Redis client for non-Pub/Sub commands
    RedisClient = redis.createClient({
      socket: { host, port },
    });

    // Create a separate Pub/Sub Redis client
    PubSubClient = redis.createClient({
      socket: { host, port },
    });

    RedisClient.on("connect", () => {
      console.log("[DEBUG] Connected to Redis");
    });

    RedisClient.on("error", (err) => {
      console.error("[ERROR] Redis connection error:", err);
    });

    // Connect both clients
    await RedisClient.connect();
    await PubSubClient.connect();
  } catch (err) {
    console.error("[ERROR] Failed to set up RedisMemoryServer:", err);
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
