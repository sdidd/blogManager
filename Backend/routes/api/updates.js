const express = require("express");const router = express.Router();

// Mock database or hardcoded latest update message
// Mock database or hardcoded latest update messages
const latestUpdate = [
  { id: "1", message: "Removed Image Uploading", type: "remove" },
  { id: "2", message: "Removed Cloud Storage(was not good)", type: "remove" },
  { id: "3", message: "Some UI Changes", type: "add" },
  { id: "4", message: "Internal Changes", type: "add" },
  { id: "5", message: "Added email service for admin", type: "add" },
];

// GET /updates/latest - Fetch latest update message
router.get("/latest", (req, res) => {
  try {
    res.status(200).json({
      updates: latestUpdate,
      date: new Date(),
    });
  } catch (error) {
    console.error("Error fetching update:", error);
    res.status(500).json({ error: "Failed to fetch the latest update" });
  }
});

module.exports = router;
