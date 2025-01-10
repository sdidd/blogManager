const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const { getBlogs, createOrUpdateBlog, getUserBlogs, deleteBlog } = require("../../services/blogService");

const router = express.Router();

router.get("/home", getBlogs);
router.post("/createOrUpdate", authMiddleware, createOrUpdateBlog);
router.get("/all", authMiddleware, getUserBlogs);
router.post("/delete", authMiddleware, deleteBlog);

module.exports = router;
