const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer configuration
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage });


module.exports = {
    upload,
    storage
}