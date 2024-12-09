const express = require("express");
const { getRedisClient, getPubSubClient } = require("../../utils/redis/redisConfig"); // Import both clients
const router = express.Router();

// Get all Redis keys
router.get("/keys", async (req, res) => {
  try {
    const client = getRedisClient(); // Use normal Redis client
    const keys = await client.keys('*');
    res.json(keys);
  } catch (err) {
    console.error("[ERROR] Failed to fetch Redis keys:", err);
    res.status(500).json({ error: "Failed to fetch Redis keys." });
  }
});

// Get value of a specific Redis key
router.get("/key/:key", async (req, res) => {
  try {
    const client = getRedisClient();
    const { key } = req.params;
    const value = await client.get(key);
    if (value === null) {
      return res.status(404).json({ error: `Key '${key}' not found.` });
    }
    res.json({ key, value });
  } catch (err) {
    console.error("[ERROR] Failed to fetch Redis key:", err);
    res.status(500).json({ error: "Failed to fetch Redis key." });
  }
});

// Create or update a Redis key
router.post("/key", async (req, res) => {
  try {
    const { key, value } = req.body;
    const client = getRedisClient();
    await client.set(key, value);
    res.status(201).json({ message: `Key '${key}' created/updated successfully.` });
  } catch (err) {
    console.error("[ERROR] Failed to create/update Redis key:", err);
    res.status(500).json({ error: "Failed to create/update Redis key." });
  }
});

// Delete a Redis key
router.delete("/key/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const client = getRedisClient();
    const result = await client.del(key);
    if (result === 0) {
      return res.status(404).json({ error: `Key '${key}' not found.` });
    }
    res.status(200).json({ message: `Key '${key}' deleted successfully.` });
  } catch (err) {
    console.error("[ERROR] Failed to delete Redis key:", err);
    res.status(500).json({ error: "Failed to delete Redis key." });
  }
});

// Subscribe to Redis channel for real-time updates
router.post("/subscribe", (req, res) => {
  try {
    const { channel } = req.body;
    const client = getPubSubClient(); // Use PubSub client
    client.subscribe(channel, (message) => {
      res.json({ message: `Received real-time update: ${message}` });
    });
  } catch (err) {
    console.error("[ERROR] Failed to subscribe to Redis channel:", err);
    res.status(500).json({ error: "Failed to subscribe to Redis channel." });
  }
});

// Unsubscribe from Redis channel
router.post("/unsubscribe", (req, res) => {
  try {
    const { channel } = req.body;
    const client = getPubSubClient(); // Use PubSub client
    client.unsubscribe(channel, () => {
      res.json({ message: `Unsubscribed from channel '${channel}'` });
    });
  } catch (err) {
    console.error("[ERROR] Failed to unsubscribe from Redis channel:", err);
    res.status(500).json({ error: "Failed to unsubscribe from Redis channel." });
  }
});

module.exports = router;
