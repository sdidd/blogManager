const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const getRedisClient = require("../utils/redis/redisConfig");
const sessionMiddleware = require('../middleware/sessionMiddleware');

const mongoose = require("mongoose");

const router = express.Router();

// Centralized middleware
router.use(authMiddleware); // Apply auth to all routes
router.use((req, res, next) => {
  // Apply permission checks for specific paths
  const routePermissions = {
    "/active-sessions": ["manage:sessions"],
    "/active-sessions/:userId": ["manage:sessions"],
    "/terminate-session": ["manage:sessions"],
  };

  const permissions = routePermissions[req.path];
  if (permissions) {
    return permissionMiddleware(permissions)(req, res, next);
  }
  next();
});

// Helper: Get active sessions from Redis (Updated for hash data structure)
const getActiveSessions = async (redisClient) => {
  try {
    const keys = await redisClient.keys("session:*");
    const sessions = [];
    for (const key of keys) {
      const sessionData = await redisClient.hGetAll(key); // Fetch session data from hash
      if (Object.keys(sessionData).length > 0) {
        sessions.push({ token: key.replace("session:", ""), ...sessionData });
      }
    }
    return sessions;
  } catch (err) {
    console.error("[ERROR] Failed to fetch sessions from Redis:", err);
    throw err;
  }
};

// Fetch all active sessions for all users
router.get("/active-sessions", async (req, res) => {
  try {
    const redisClient = await getRedisClient();
    const sessions = await getActiveSessions(redisClient);

    res.status(200).json({ sessions });
  } catch (err) {
    console.error("[ERROR] Failed to fetch active sessions:", err);
    res.status(501).json({ error: "Failed to fetch active sessions", details: err.message });
  }
});

// Fetch active sessions for a specific user
router.get("/active-sessions/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const redisClient = getRedisClient();
    const allSessions = await getActiveSessions(redisClient);

    const userSessions = allSessions.filter((session) => session.userId === userId);

    res.status(200).json({ sessions: userSessions });
  } catch (err) {
    console.error("[ERROR] Failed to fetch active sessions for user:", err);
    res.status(500).json({ error: "Failed to fetch active sessions for user", details: err.message });
  }
});

// Terminate a specific session
router.post("/terminate-session", async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "User ID and token are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const redisClient = getRedisClient();

    // Delete session from Redis
    const sessionKey = `session:${token}`;

    // Delete session data from the hash or remove the entire key
    await redisClient.del(sessionKey);  // Remove the entire session key

    res.status(200).json({ message: "Session terminated successfully" });
  } catch (err) {
    console.error("[ERROR] Failed to terminate session:", err);
    res.status(500).json({ error: "Failed to terminate session", details: err.message });
  }
});

// Revoke a specific token
router.post("/revoke-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const redisClient = getRedisClient();
    const expiration = parseInt(process.env.JWT_EXPIRATION || "3600", 10);

    // Blacklist the token by adding it to a set
    await redisClient.set(`blacklist:${token}`, "true", { EX: expiration });

    res.status(200).json({ message: "Token revoked successfully" });
  } catch (err) {
    console.error("[ERROR] Failed to revoke token:", err);
    res.status(500).json({ error: "Failed to revoke token", details: err.message });
  }
});

module.exports = router;
