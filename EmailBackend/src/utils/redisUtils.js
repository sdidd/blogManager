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
  
  // Helper: Get blacklisted tokens from Redis
  const getBlacklistedTokens = async (redisClient) => {
    try {
      const keys = await redisClient.keys("blacklist:*");
      const blacklistedTokens = [];
      for (const key of keys) {
        const token = key.replace("blacklist:", "");
        blacklistedTokens.push(token);
      }
      return blacklistedTokens;
    } catch (err) {
      console.error("[ERROR] Failed to fetch blacklisted tokens:", err);
      throw err;
    }
  };

  module.exports = {getActiveSessions, getBlacklistedTokens};