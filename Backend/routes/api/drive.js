const express = require("express");const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const { body, validationResult } = require("express-validator");
const Drive = require("../../models/Drive");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const driveId = req.query.driveId || req.headers.driveid; // Read from query/header
      if (!driveId) return cb(new Error("Drive ID is required to upload files."), null);
  
      const uploadPath = path.join(__dirname, "../../drives", driveId);
  
      // Ensure the folder exists
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Unique file name
    },
  });
  
  const upload = multer({ storage });
  

// Validation Middleware
const validateDriveName = [body("driveName").notEmpty().trim().withMessage("Drive name is required")];

// Create Drive
router.post("/create", authMiddleware, validateDriveName, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { driveName } = req.body;
  const userId = req.user.id;

  try {
    const existingDrive = await Drive.findOne({ userId, driveName });
    if (existingDrive) return res.status(400).json({ message: "Drive name already exists." });
    const drive = new Drive({ userId, driveName, files: [] });
    await drive.save();
    const folderPath = path.join(__dirname, "../../drives", drive.id);
    fs.ensureDirSync(folderPath);


    res.status(201).json({ message: "Drive created successfully.", drive });
  } catch (error) {
    res.status(500).json({ message: "Error creating drive.", error });
  }
});

// List User Drives
router.post("/list", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const drives = await Drive.find({ userId });
    res.status(200).json({ drives });
  } catch (error) {
    res.status(500).json({ message: "Error fetching drives.", error });
  }
});

//upload the file
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    const driveId = req.query.driveId || req.headers.driveid;
  
    if (!driveId) {
      return res.status(400).json({ message: "Drive ID is required." });
    }
  
    try {
      // Find the drive by ID
      const drive = await Drive.findById(driveId);
      if (!drive) return res.status(404).json({ message: "Drive not found." });
  
      // Construct the file path relative to the uploads folder
      const fileLink = `/drives/${driveId}/${req.file.filename}`;
  
      // Add file details to the drive
      drive.files.push({
        name: req.file.originalname,
        type: "file",
        path: fileLink,
      });
  
      await drive.save();
  
      res.status(200).json({ message: "File uploaded successfully.", file: fileLink });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error uploading file.", error });
    }
  });
  

// Get Files in Drive
router.post("/files", authMiddleware, async (req, res) => {
  const driveId = req.body.driveId;

  try {
    const drive = await Drive.findById(driveId);
    if (!drive) return res.status(404).json({ message: "Drive not found." });

    res.status(200).json({ files: drive.files });
  } catch (error) {
    res.status(500).json({ message: "Error fetching files.", error });
  }
});

// Delete Drive
router.post("/delete", authMiddleware, async (req, res) => {
  const { driveId } = req.body;

  try {
    const drive = await Drive.findByIdAndDelete(driveId);
    if (!drive) return res.status(404).json({ message: "Drive not found." });

    const folderPath = path.join(__dirname, "../../drives", driveId);
    fs.removeSync(folderPath);

    res.status(200).json({ message: "Drive deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting drive.", error });
  }
});

// Download File
router.post("/download", async (req, res) => {
  const { filePath } = req.body;

  try {
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: "Error downloading file.", error });
  }
});

module.exports = router;
