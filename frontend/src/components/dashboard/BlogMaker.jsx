import React, { useState, useEffect } from "react";import API from "../../api";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import ReactMarkdown from "react-markdown";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/BlogMaker.css"; // Importing custom CSS

const BlogMaker = () => {
  const navigate = useNavigate();
  const LOCAL_STORAGE_KEY = "unsavedBlog";

  // State Variables
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [blogId, setBlogId] = useState(null);
  const [images, setImages] = useState([]); // Store image files locally
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log("there is nothing in localStorage");
    
    if (savedDraft) {
      setTitle(savedDraft.title || "");
      setContent(savedDraft.content || "");
      setImages(savedDraft.images || []);
    }
  }, []);

  // Save draft to localStorage as user types
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ title, content, images }));
  }, [title, content, images]);

  // Warn before refreshing or closing tab
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (title.trim() || content.trim()) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [title, content]);

  // Save Blog as Draft
  const handleSaveDraft = async () => {
    try {
      const response = await API.post("/api/blog/createOrUpdate", {
        blogId,
        title,
        content,
        images,
        status: "draft",
      });

      toast.success("Draft saved!");
      setBlogId(response.data.blog._id);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Remove from localStorage after saving
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Publish Blog
  const handlePublishBlog = async () => {
    try {
      await API.post("/api/blog/createOrUpdate", {
        blogId,
        title,
        content,
        images,
        status: "published",
      });

      toast.success("Blog published!");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setTitle("");
      setContent("");
      setBlogId(null);
    } catch (error) {
      console.error("Error publishing blog:", error);
    }
  };

  // Handle Image Upload (Store Locally)
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  // Remove Image
  const handleRemoveImage = (image) => {
    setImages(images.filter((img) => img !== image));
  };

  // Handle Cancel
  const handleCancel = () => {
    toast.info("Save draft before leaving!");
    setIsModalOpen(false);
  };

  return (
    <div className="blog-container">
      {/* Left Side - Editor */}
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

        {/* Image Upload */}
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <div className="mt-3">
          {images.map((image, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <img src={image} alt="Uploaded" style={{ width: "100px" }} />
              <button className="btn btn-danger btn-sm ms-2" onClick={() => handleRemoveImage(image)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-warning" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button className="btn btn-primary" onClick={handlePublishBlog}>
            Publish
          </button>
        </div>
      </div>

      {/* Right Side - Real-Time Preview */}
      <div className="preview-section">
        <h3>Preview</h3>
        <div className="preview-box">
          <ReactMarkdown>{title}</ReactMarkdown>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={handleCancel} ariaHideApp={false} className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Unsaved Changes</h5>
            </div>
            <div className="modal-body">
              <p>Do you want to save this as a draft before leaving?</p>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <button className="btn btn-warning" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default BlogMaker;
