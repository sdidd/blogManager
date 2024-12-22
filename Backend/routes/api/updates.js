const express = require("express");const router = express.Router();

// Mock database or hardcoded latest update message
// Mock database or hardcoded latest update messages
const latestUpdate = [
  {
    version: "0.1.1",
    changes: [
      { id: "6", message: "Made a CDN server", type: "add" },
      { id: "7", message: "Added the option to upload profile picture", type: "add" },
      { id: "8", message: "Some UI changes", type: "add" },
      { id: "9", message: "Fixed registration; now users can register to log in and view the dashboard", type: "fix" },
    ],
  },
  {
    version: "0.1.0",
    changes: [
      { id: "1", message: "Removed Image Uploading", type: "remove" },
      { id: "2", message: "Removed Cloud Storage(was not good)", type: "remove" },
      { id: "3", message: "Some UI Changes", type: "add" },
      { id: "4", message: "Internal Changes", type: "add" },
      { id: "5", message: "Added email service for admin", type: "add" },
    ],
  },
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
