const express = require("express");
const router = express.Router();

// Mock database or hardcoded latest update message
// Mock database or hardcoded latest update messages
const latestUpdate = [
    { message: "Removed Image Uploading", type: "remove" },
    { message: "Replaced it with Cloud Storage with option to make Drives", type: "add" },
    { message: "Some UI Changes", type: "add" },
    { message: "Internal Changes", type: "add" },
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
