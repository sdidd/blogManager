const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const sessionMiddleware = require("../middleware/sessionMiddleware");
const User = require("../models/User");
const Result = require("../models/Result");
const { upload } = require("../utils/uploadUtils");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

// Apply middleware globally to all routes
router.use(authMiddleware); // Authentication applied to all routes
router.use(sessionMiddleware); // Session validation applied to all routes

// AWS S3 Configuration using AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Base URL for CDN (if using CloudFront)
const cloudFrontBaseUrl = process.env.CDN_BASE_URL || "https://dck25gfbgi34d.cloudfront.net";

// Middleware to apply specific permissions
router.use((req, res, next) => {
  const permissionMap = {
    "/profile": ["view:profile"],
    "/results": ["view:results"],
    "/uploadimage": ["update:profile"],
    "/update": ["update:profile"],
  };

  if (permissionMap[req.path]) {
    return permissionMiddleware(permissionMap[req.path])(req, res, next);
  }
  next();
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-data.password").populate("role");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user results
router.get("/results", async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id });
    if (!results) return res.status(404).json({ error: "Results not found" });
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Upload profile image
router.post("/uploadimage", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const s3Key = `images/${Date.now()}-${req.file.originalname}`; // Unique file key
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // Upload file to S3 using AWS SDK v3
    await s3Client.send(new PutObjectCommand(params));

    // Construct CDN URL
    const cdnImageUrl = `${cloudFrontBaseUrl}/${s3Key}`;

    // Update user's profile with new image URL
    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(userId, { image: cdnImageUrl }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Image uploaded successfully.",
      url: cdnImageUrl, // Return CDN URL
    });
  } catch (error) {
    console.error("Error during image upload:", error);
    res.status(500).json({ error: "Internal server error.", details: error.message });
  }
});

router.put("/update", async (req, res) => {
  const { field, value } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { [field]: value }, { new: true });  
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
