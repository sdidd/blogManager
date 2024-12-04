const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const sessionMiddleware = require("../middleware/sessionMiddleware");
const User = require("../models/User");
const Result = require("../models/Result");
const { upload } = require('../utils/uploadUtils');

const router = express.Router();

// Apply middleware globally to all routes in this router
router.use(authMiddleware); // Authentication applied to all routes
router.use(sessionMiddleware); // Session validation applied to all routes

// Specific permissions middleware (if required)
router.use((req, res, next) => {
  if (req.path === "/profile") {
    return permissionMiddleware(["view:profile"])(req, res, next);
  }
  if (req.path === "/results") {
    return permissionMiddleware(["view:results"])(req, res, next);
  }
  if (req.path === "/uploadimage") {
    return permissionMiddleware(["update:profile"])(req, res, next);
  }
  next();
});

// Define your routes
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-data.password")
      .populate("role");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", err: err });
  }
});

router.get("/results", async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id });
    if (!results) return res.status(404).json({ error: "Results not found" });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/uploadimage",
  upload.single("image"), // Add this middleware
  async (req, res) => {
    try {
      console.log(req.file); // Debugging: Check if the file is received

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      // Save the image URL/path to the user's profile in the database
      const imagePath = `/uploads/${req.file.filename}`;
      const userId = req.user.id; // Assuming user ID is in the auth token

      await User.findByIdAndUpdate(userId, { image: imagePath }, { new: true });

      res.status(200).json({
        message: "Image uploaded successfully.",
        image: imagePath,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
