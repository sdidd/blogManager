const express = require("express");

const router = express.Router();

router.get("/locations", async (req, res) => {
  try {
    res.status(200).json([
      { name: "Mumbai Center", address: "123 Marine Drive, Mumbai", coordinates: [19.076, 72.8777] },
      { name: "Delhi Branch", address: "456 Connaught Place, New Delhi", coordinates: [28.6139, 77.209] },
      { name: "Bengaluru Campus", address: "789 MG Road, Bengaluru", coordinates: [12.9716, 77.5946] },
      { name: "Chennai Institute", address: "101 Marina Beach, Chennai", coordinates: [13.0827, 80.2707] },
      { name: "Kolkata Hub", address: "202 Park Street, Kolkata", coordinates: [22.5726, 88.3639] },
    ]
    );
  } catch (error) {
    res.status(400).json({error: {error}})
  }
});

module.exports = router;
