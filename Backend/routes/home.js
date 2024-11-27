const express = require("express");

const router = express.Router();

router.get("/locations", async (req, res) => {
  try {
    res.status(200).json([
      { name: "Downtown Center", address: "123 Main Street, Cityville", coordinates: [40.7128, -74.006] },
      { name: "Uptown Branch", address: "456 Elm Street, Metropolis", coordinates: [34.0522, -118.2437] },
    ]);
  } catch (error) {
    res.status(400).json({error: {error}})
  }
});

module.exports = router;
