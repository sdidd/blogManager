const Blog = require("../models/Blog");

async function getBlogs(req, res) {
  try {
    const { sort, limit = 3, offset = 0 } = req.query; // Default limit to 3 and offset to 0
    let blogs = [];
    if (sort === "recent") blogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 }).skip(parseInt(offset)).limit(parseInt(limit));
    else if (sort === "popular")
      blogs = await Blog.find({ status: "published" }).sort({ likes: -1, views: -1 }).skip(parseInt(offset)).limit(parseInt(limit));
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
}

async function createOrUpdateBlog(req, res) {
  try {
    const { blogId, title, content, tempImages, status } = req.body;
    const userId = req.user.id;

    // Check if tempImages is an array of valid image URLs
    // console.log(tempImages);
    
    if (!Array.isArray(tempImages) || !tempImages.every((img) => img.startsWith("http")) || !tempImages.every((img) => img.startsWith("https"))) {
      return res.status(400).json({ error: "Invalid image URLs" });
    }

    // Map image names to their correct URLs from tempImages
    const imageUrlMap = {};
    tempImages.forEach((imageUrl) => {
      const imageName = imageUrl.split("/").pop(); // Extract image name from the URL
      imageUrlMap[imageName] = imageUrl;
    });

    // console.log(imageUrlMap);

    // Replace random image URLs in content with the correct CDN URLs
    const updatedContent = content.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, altText, imgUrl) => {
      const imageName = altText; // Image name is in altText (i.e., between ![ and ] in Markdown)

      // Check if image name exists in the imageUrlMap and replace with the correct URL
      const correctUrl = imageUrlMap[imageName];

      if (correctUrl) {
        // If the correct URL exists, replace the image URL with the CDN URL
        return `![${altText}](${correctUrl})`;
      }

      // If no matching URL is found, return the original match
      return match;
    });

    // console.log(updatedContent);

    // Create or update the blog
    const blog = blogId
      ? await Blog.findOneAndUpdate({ _id: blogId, author: userId }, { title, content: updatedContent, images: tempImages, status }, { new: true })
      : await new Blog({ title, content: updatedContent, images: tempImages, author: userId, status }).save();

    res.json({ message: "Blog saved successfully" , blog});
  } catch (error) {
    console.error("Error in createOrUpdateBlog:", error); // Log the actual error
    res.status(500).json({ error: "Failed to save blog", details: error.message });
  }
}

async function getUserBlogs(req, res) {
  try {
    const blogs = await Blog.find({ author: req.user.id }).sort({ lastUpdated: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
}

async function deleteBlog(req, res) {
  try {
    const { blogId } = req.body;
    const blog = await Blog.findOneAndDelete({ _id: blogId, author: req.user.id });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
}

async function moveBlogtoDraft(req, res) {
  try {
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    blog.status = "draft";
    await blog.save();
    res.json({ message: "Blog moved to draft" });
  }
  catch (error) {
    res.status(500).json({ error: "Failed to move blog to draft" });
  }
}  

async function republishBlog(req, res) {
  try {
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId); 
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    blog.status = "published";
    await blog.save();
    res.json({ message: "Blog republished" });
  }
  catch (error) {
    res.status(500).json({ error: "Failed to republish blog" });
  }
}

async function getBlogById(req, res) {
  try {
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId); 
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  }
  catch (error) {
    res.status(500).json({ error: "Failed to fetch blog" });
  }
  
}
module.exports = { getBlogs, createOrUpdateBlog, getUserBlogs, deleteBlog, moveBlogtoDraft, republishBlog , getBlogById};
