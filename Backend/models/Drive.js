const mongoose = require("mongoose");

const DriveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driveName: { type: String, required: true },
  files: [
    {
      name: { type: String, required: true },
      type: { type: String, enum: ["file", "folder"], required: true },
      path: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Drive", DriveSchema);
