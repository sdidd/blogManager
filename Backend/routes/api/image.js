const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const router = express.Router();

// AWS S3 Configuration from Environment Variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION, // AWS region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Access key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Secret access key
});

// Bucket name from environment variables
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Configure multer for memory storage (required for S3 uploads)
const upload = multer({ storage: multer.memoryStorage() });

// API Route to handle image uploads
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: `images/${Date.now()}-${req.file.originalname}`, // Unique key
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    // ACL: "public-read", // Public access
  };

  // Upload the file to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading to S3:", err);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    res.status(200).json({
      message: "File uploaded successfully to S3",
      imageUrl: data.Location, // Public URL
    });
  });
});

// API Route to get all uploaded image URLs
router.get("/images", (req, res) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: "images/", // Fetch files under the "images/" folder
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error("Error fetching files from S3:", err);
      return res.status(500).json({ error: "Failed to fetch images" });
    }

    // Generate full URLs for each file
    const imageUrls = data.Contents.map((file) => {
      return `https://${BUCKET_NAME}.s3.amazonaws.com/${file.Key}`;
    });

    res.status(200).json(imageUrls);
  });
});

module.exports = router;
