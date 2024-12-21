const { RedisMemoryServer } = require("redis-memory-server");const redis = require("redis");

let RedisClient;
let PubSubClient;
let redisHost;
let redisPort;
let isRedisReady = false;

const setupRedis = async () => {
  if (process.env.NODE_ENV === "production") {
    try {
      console.log(`[INFO] Connecting to external Redis server...`);

      redisHost = process.env.REDIS_HOST || "127.0.0.1";
      redisPort = process.env.REDIS_PORT || 6379;

      RedisClient = redis.createClient({
        socket: { host: redisHost, port: redisPort },
      });

      PubSubClient = redis.createClient({
        socket: { host: redisHost, port: redisPort },
      });

      await RedisClient.connect();
      await PubSubClient.connect();

      console.log(`[INFO] Connected to external Redis at ${redisHost}:${redisPort}`);
    } catch (err) {
      console.error("[ERROR] Failed to connect to external Redis server:", err);
      process.exit(1);
    }
  } else {
    try {
      // Development setup with standalone RedisMemoryServer
      redisHost = "127.0.0.1"; // Host for standalone RedisMemoryServer
      redisPort = 6379; // Port for standalone RedisMemoryServer

      console.log(`[INFO] Connecting to shared in-memory Redis at ${redisHost}:${redisPort}`);

      RedisClient = redis.createClient({ socket: { host: redisHost, port: redisPort } });
      PubSubClient = redis.createClient({ socket: { host: redisHost, port: redisPort } });

      await RedisClient.connect();
      await PubSubClient.connect();

      console.log(`[INFO] Connected to in-memory Redis at ${redisHost}:${redisPort}`);
    } catch (err) {
      console.error("[ERROR] Failed to set up in-memory Redis:", err);
      process.exit(1);
    }
  }
  isRedisReady = true;
};

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

const getRedisConfig = () => {
  if (!redisHost || !redisPort) {
    throw new Error("Redis configuration is not initialized.");
  }
  return { host: redisHost, port: redisPort };
};

// Wait for Redis setup to complete
const waitForRedisReady = () => {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (isRedisReady) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100); // Poll every 100ms
  });
};

// Initialize Redis on start
setupRedis();

module.exports = { getRedisClient, getPubSubClient, getRedisConfig, waitForRedisReady };
