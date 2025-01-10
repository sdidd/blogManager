const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const router = express.Router();

// Validate required environment variables
const requiredEnvVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_BUCKET_NAME"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// AWS S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Bucket name from environment variables
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Configure Multer for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   POST /upload
 * @desc    Uploads an image to S3
 * @access  Public
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // const { blogId } = req.body; // Receive blogId from frontend
    const originalFileName = req.file.originalname;
    const uniqueFileName = `${originalFileName}`; // Append blogId

    const fileKey = `images/${uniqueFileName}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return res.status(200).json({
      message: "File uploaded successfully to S3",
      imageUrl: `${process.env.CDN_BASE_URL}/${fileKey}`,
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});


/**
 * @route   GET /images
 * @desc    Retrieves all uploaded image URLs from S3
 * @access  Public
 */
router.get("/images", async (req, res) => {
  try {
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: "images/",
    };

    const data = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!data.Contents || data.Contents.length === 0) {
      return res.status(404).json({ message: "No images found" });
    }

    const imageUrls = data.Contents.map((file) => 
      `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
    );

    return res.status(200).json(imageUrls);
  } catch (error) {
    console.error("Error fetching images from S3:", error);
    return res.status(500).json({ error: "Failed to fetch images" });
  }
});

module.exports = router;
