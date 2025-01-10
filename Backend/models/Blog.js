const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Untitled Blog" },
  content: { type: String, required: true, default: "" }, // Markdown content with image URLs
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["draft", "published"], default: "draft" }, // Draft or Published
  likes: { type: Number, default: 0 }, // Number of likes
  images : [{ type: String }], // Image URLs
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  views: { type: Number, default: 0 }, // Number of views
  tags: [{ type: String }], // Tags for better categorization
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }, // Track changes for sorting
});

// Indexes for performance
blogSchema.index({ createdAt: -1 }); // For most recent
blogSchema.index({ likes: -1, views: -1 }); // For most popular

module.exports = mongoose.model("Blog", blogSchema);
