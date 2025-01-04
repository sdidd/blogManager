const express = require("express");
const Blog = require("../../models/Blog");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Create or Update Blog (Draft or Published)
router.post("/createOrUpdate", authMiddleware, async (req, res) => {
  try {
    const { blogId, title, content, images, status } = req.body;
    const userId = req.user.id;

    if (blogId) {
      // Update existing blog
      const blog = await Blog.findOneAndUpdate(
        { _id: blogId, author: userId },
        { title, content, images, status, lastUpdated: Date.now() },
        { new: true }
      );

      if (!blog) return res.status(404).json({ error: "Blog not found" });
      return res.json({ message: "Blog updated successfully", blog });
    }

    // Create new draft blog
    const newBlog = new Blog({ title, content, images, author: userId, status });
    await newBlog.save();

    res.status(201).json({ message: "Blog saved successfully", blog: newBlog });
  } catch (error) {
    console.error("Error saving blog:", error);
    res.status(500).json({ error: "Failed to save blog" });
  }
});

// Get All Blogs for a User (Including Drafts)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const blogs = await Blog.find({ author: userId }).sort({ lastUpdated: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// Delete a Blog (Draft or Published)
router.post("/delete", authMiddleware, async (req, res) => {
  try {
    const { blogId } = req.body;
    const userId = req.user.id;

    const blog = await Blog.findOneAndDelete({ _id: blogId, author: userId });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

module.exports = router;
