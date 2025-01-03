const express = require("express");const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const sessionMiddleware = require("../middleware/sessionMiddleware");
const User = require("../models/User");
const Result = require("../models/Result");
const { upload } = require("../utils/uploadUtils");
const AWS = require("aws-sdk");

const router = express.Router();

// Apply middleware globally to all routes in this router
router.use(authMiddleware); // Authentication applied to all routes
router.use(sessionMiddleware); // Session validation applied to all routes

// AWS S3 Configuration from Environment Variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION, // AWS region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Access key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Secret access key
});

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
    const user = await User.findById(req.user.id).select("-data.password").populate("role");
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

router.post("/uploadimage", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const s3Key = `images/${Date.now()}-${req.file.originalname}`; // Unique key
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // Use environment variables
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // Upload the file to S3
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error("Error uploading to S3:", err);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      // Replace S3 base URL with CloudFront URL
      const cloudFrontBaseUrl = process.env.CDN_BASE_URL || "https://dck25gfbgi34d.cloudfront.net";
      const cdnImageUrl = `${cloudFrontBaseUrl}/${s3Key}`;

      // Update the user's profile with the CDN URL
      const userId = req.user.id; // Assuming user ID is in the auth token
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { image: cdnImageUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(200).json({
        message: "Image uploaded successfully.",
        url: cdnImageUrl, // Return CDN URL
      });
    });
  } catch (error) {
    console.error("Error during image upload:", error.message);
    res.status(500).json({ error: "Internal server error.", details: error });
  }
});

module.exports = router;
