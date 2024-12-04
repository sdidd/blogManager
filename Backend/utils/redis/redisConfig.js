const { RedisMemoryServer } = require("redis-memory-server");
const redis = require("redis");

let RedisClient;

(async () => {
  try {
    const redisServer = new RedisMemoryServer();

    const host = await redisServer.getHost();
    const port = await redisServer.getPort();

    console.log(`[DEBUG] In-memory Redis running at ${host}:${port}`);

    RedisClient = redis.createClient({
      socket: {
        host,
        port,
      },
    });

    RedisClient.on("connect", () => {
      console.log("[DEBUG] Connected to Redis");
    });

    RedisClient.on("error", (err) => {
      console.error("[ERROR] Redis connection error:", err);
    });

    await RedisClient.connect();
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

module.exports = getRedisClient;
