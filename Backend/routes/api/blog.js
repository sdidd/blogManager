const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { getBlogs, createOrUpdateBlog, getUserBlogs, deleteBlog, moveBlogtoDraft, republishBlog, getBlogById } = require("../../services/blogService");

const router = express.Router();

router.get("/home", getBlogs);
router.post("/createOrUpdate", authMiddleware, createOrUpdateBlog);
router.get("/all", authMiddleware, getUserBlogs);
router.post("/delete", authMiddleware, deleteBlog);
router.post("/moveToDraft", authMiddleware, moveBlogtoDraft);
router.post("/republishBlog", authMiddleware, republishBlog);
router.post("/getBlogById",authMiddleware, getBlogById);

module.exports = router;
