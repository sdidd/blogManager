const { RedisMemoryServer } = require("redis-memory-server");

const startRedisServer = async () => {
  const redisServer = new RedisMemoryServer({
    instance: { port: 6379 }, // Fixed port
  });

  const host = await redisServer.getHost();
  const port = await redisServer.getPort();

  console.log(`[INFO] Standalone RedisMemoryServer running at ${host}:${port}`);
  console.log("[INFO] Keep this process running while developing.");
};

startRedisServer();
