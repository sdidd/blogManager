const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk"); // Only if using cloud storage
const router = express.Router();

// Select Storage Type: Local or Cloud (S3)
const useCloudStorage = false; // Set to true for cloud storage (AWS S3)
let uploadDir = path.join(__dirname, "../../uploads");

// Ensure the uploads directory exists (for local storage)
if (!fs.existsSync(uploadDir) && !useCloudStorage) {
  fs.mkdirSync(uploadDir); // Create it if it doesn't exist
}

// Cloud storage configuration (if AWS S3 is used)
let s3;
if (useCloudStorage) {
  AWS.config.update({ region: "us-east-1" }); // Set your region
  s3 = new AWS.S3();
}

const storage = useCloudStorage
  ? multer.memoryStorage() // Cloud storage (use memory for file uploads)
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({ storage: storage });

// API Route to handle image uploads
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // If using cloud storage
  if (useCloudStorage) {
    const params = {
      Bucket: "YOUR_BUCKET_NAME",
      Key: `images/${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };
    s3.upload(params, (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({
        message: "File uploaded successfully to cloud",
        imageUrl: data.Location, // Cloud URL
      });
    });
  } else {
    // Local storage path
    res.status(200).json({
      message: "File uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`, // Local file URL
    });
  }
});

// API Route to get all uploaded image filenames
router.get("/images", (req, res) => {
  if (useCloudStorage) {
    // For cloud storage, list the files in S3
    const params = {
      Bucket: "YOUR_BUCKET_NAME",
      Prefix: "images/",
    };
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch images" });
      }
      const imageUrls = data.Contents.map(file => file.Key); // Cloud file keys
      res.status(200).json(imageUrls);
    });
  } else {
    // Local storage fetching
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch images" });
      }
      const imageUrls = files.map(file => `/uploads/${file}`);
      res.status(200).json(imageUrls);
    });
  }
});

module.exports = router;
