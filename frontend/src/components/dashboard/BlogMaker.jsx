import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/BlogMaker.css";

const BlogMaker = () => {
  const navigate = useNavigate();
  const LOCAL_STORAGE_KEY = "unsavedBlog";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [blogId, setBlogId] = useState(null);
  const [tempImages, setTempImages] = useState([]); // Temporary image storage

  console.log("Component Rendered");

  // Load draft from localStorage
  useEffect(() => {
    console.log("Loading draft from localStorage...");
    const savedDraft = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (savedDraft) {
      setTitle(savedDraft.title || "");
      setContent(savedDraft.content || "");
      setTempImages(savedDraft.tempImages || []);
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    console.log("Saving draft to localStorage...");
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ title, content, tempImages }));
  }, [title, content, tempImages]);

  // Warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (title.trim() || content.trim()) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, content]);

  // Handle Image Upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    console.log("Uploading images:", files);

    // Store images with blob URLs
    const newImages = files.map((file) => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file), // Temporary blob URL
    }));

    setTempImages((prevImages) => [...prevImages, ...newImages]);

    // Insert images in Markdown (using blob URL)
    const markdownImages = newImages.map((img) => `![${img.name}](${img.preview})`).join("\n");
    setContent((prevContent) => prevContent + "\n" + markdownImages);
  };

  // Upload Images to CDN
  const uploadImagesToCDN = async (images) => {
    console.log("Uploading images to CDN...");
    const uploadedUrls = [];

    for (const image of images) {
      if (image.preview.startsWith("blob:")) {
        const formData = new FormData();
        formData.append("file", image.file);

        try {
          const response = await API.post("/api/image/upload", formData);
          uploadedUrls.push(response.data.imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Failed to upload an image.");
        }
      } else {
        uploadedUrls.push(image.preview);
      }
    }
    return uploadedUrls;
  };

  // Save Blog
  const handleSaveBlog = async (status) => {
    try {
      console.log(`Saving blog as ${status}...`);
      const uploadedImageUrls = await uploadImagesToCDN(tempImages);

      const response = await API.post("/api/blog/createOrUpdate", {
        blogId,
        title,
        content,
        tempImages: uploadedImageUrls,
        status,
      });

      toast.success(status === "published" ? "Blog published!" : "Draft saved!");
      setBlogId(response.data.blog._id);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog.");
    }
  };

  return (
    <div className="blog-container">
      <div className="editor-section">
        <h2>Write a Blog</h2>
        <input
          type="text"
          placeholder="Enter blog title"
          className="form-control mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-3"
          placeholder="Write your blog (supports Markdown)..."
          rows="6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <div className="mt-3">
          {tempImages.map((image, index) => (
            <img key={index} src={image.preview} alt="Preview" style={{ width: "100px", marginRight: "10px" }} />
          ))}
        </div>

        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-warning" onClick={() => handleSaveBlog("draft")}>
            Save Draft
          </button>
          <button className="btn btn-success" onClick={() => handleSaveBlog("published")}>
            Publish
          </button>
        </div>
      </div>

      <div className="preview-section">
        <h3>Preview</h3>
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                style={{
                  maxWidth: "100%",
                  display: "block",
                  margin: "10px 0",
                }}
                alt={props.alt || "Markdown Image"}
              />
            ),
          }}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default BlogMaker;
