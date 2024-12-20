const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/noterLite";
    await mongoose.connect(dbURI);
    console.log("[INFO] MongoDB connected");
  } catch (error) {
    console.error("[ERROR] MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
