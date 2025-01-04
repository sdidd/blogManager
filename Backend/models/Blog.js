const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Untitled Blog" },
  content: { type: String, required: true, default: "" }, // Markdown content
  images: [{ type: String }], // CloudFront image URLs
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["draft", "published"], default: "draft" }, // Draft or Published
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }, // Track changes for sorting
});

module.exports = mongoose.model("Blog", blogSchema);
