const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const roles = require("../models/roles");
const User = require("../models/User");
const Result = require("../models/Result");
const Role = require('../models/Role')

const router = express.Router();

router.get("/profile",authMiddleware,permissionMiddleware(["view:profile"]),async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password").populate("role");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" , err: err});
    }
  }
);

router.get("/results",authMiddleware,permissionMiddleware(["view:results"]),async (req, res) => {
    try {
      const results = await Result.find({ userId: req.user.id });
      if (!results) return res.status(404).json({ error: "Results not found" });
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
