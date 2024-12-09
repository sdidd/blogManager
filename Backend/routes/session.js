const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const {getRedisClient} = require("../utils/redis/redisConfig");
const sessionMiddleware = require('../middleware/sessionMiddleware');
const {getActiveSessions, getBlacklistedTokens} = require("../utils/redis/redisUtils")

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
    "/blacklisted-tokens": ["manage:sessions"],
    "/restore-token": ["manage:sessions"], 
  };

  const permissions = routePermissions[req.path];
  if (permissions) {
    return permissionMiddleware(permissions)(req, res, next);
  }
  next();
});


// Fetch all active sessions
router.get("/active-sessions", async (req, res) => {
  try {
    const redisClient = getRedisClient();

    // Fetch active and blacklisted sessions
    const sessions = await getActiveSessions(redisClient);
    const blacklistedTokens = await getBlacklistedTokens(redisClient);

    // Separate blacklisted sessions
    const blacklistedSessions = sessions.filter((session) => 
      blacklistedTokens.includes(session.token)
    );

    const activeSessions = sessions.filter((session) => 
      !blacklistedTokens.includes(session.token)
    );

    res.status(200).json({ activeSessions, blacklistedSessions });
  } catch (err) {
    console.error("[ERROR] Failed to fetch active sessions:", err);
    res.status(500).json({ error: "Failed to fetch sessions", details: err.message });
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

// Fetch all blacklisted tokens
router.get("/blacklisted-tokens", async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const blacklistedTokens = await getBlacklistedTokens(redisClient);

    res.status(200).json({ blacklistedTokens });
  } catch (err) {
    console.error("[ERROR] Failed to fetch blacklisted tokens:", err);
    res.status(500).json({ error: "Failed to fetch blacklisted tokens", details: err.message });
  }
});

// Restore a blacklisted token
router.post("/restore-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const redisClient = getRedisClient();

    // Remove the token from the blacklist
    const blacklistKey = `blacklist:${token}`;
    const removed = await redisClient.del(blacklistKey);

    if (removed === 0) {
      return res.status(404).json({ error: "Token not found in blacklist" });
    }

    res.status(200).json({ message: "Token restored successfully" });
  } catch (err) {
    console.error("[ERROR] Failed to restore token:", err);
    res.status(500).json({ error: "Failed to restore token", details: err.message });
  }
});


module.exports = router;
