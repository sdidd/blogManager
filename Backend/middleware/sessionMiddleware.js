const getRedisClient = require("../utils/redis/redisConfig");

const isTokenBlacklisted = async (token) => {
  const redisClient = getRedisClient();
  const blacklisted = await redisClient.get(`blacklist:${token}`);
  return blacklisted === "true";
};

const sessionMiddleware = async (req, res, next) => {
  const token = req.token; // Extract token from `authMiddleware`

  if (!token) {
    return res.status(401).json({ error: "Token is required for session validation" });
  }

  try {
    // First, check if the token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    const RedisClient = getRedisClient();

    // Check if session exists in Redis
    const sessionDataStr = await RedisClient.hGet(`session:${token}`, "data");

    // If no session data is found, return an error
    if (!sessionDataStr) {
      return res.status(401).json({ error: "Session expired or invalid" });
    }

    // Parse session data only once
    const sessionData = JSON.parse(sessionDataStr);

    // Attach session data to the request (if needed)
    req.session = sessionData;

    next();
  } catch (err) {
    console.error("[ERROR] Session validation failed:", err.message);
    res.status(500).json({ error: "Failed to validate session" });
  }
};

module.exports = sessionMiddleware;
