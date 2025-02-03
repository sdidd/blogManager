import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api";
import { toast, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/BlogManagement.css"; // Custom styles

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await API.get("/api/blog/all");
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleUnpublish = async (blogId) => {
    try {
      await API.post("/api/blog/moveToDraft", { blogId });
      toast.success("Blog moved to draft!");
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) => (blog._id === blogId ? { ...blog, status: "draft" } : blog))
      );
    } catch (error) {
      console.error("Error unpublishing blog:", error);
      toast.error("Failed to unpublish blog.");
    }
  };

  const handleDelete = async (blogId) => {
    try {
      await API.post("/api/blog/delete", { blogId });
      toast.success("Blog deleted!");
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog.");
    }
  };

  const handleEdit = (blogId) => {
    navigate(`/dashboard/blogmakerstudio/${blogId}`);
  };

  const handleRepublish = async (blogId) => {
    try {
      await API.post("/api/blog/republishBlog", { blogId });
      toast.success("Blog republished!");
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) => (blog._id === blogId ? { ...blog, status: "published" } : blog))
      );
    } catch (error) {
      console.error("Error republishing blog:", error);
      toast.error("Failed to republish blog.");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">📑 Blog Management</h2>
      <div className="row">
        {blogs.map((blog) => (
          <div key={blog._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm blog-card">
              {blog.images.length > 0 && (
                <img src={blog.images[0]} className="card-img-top" alt="Blog Preview" />
              )}
              <div className="card-body">
                <h5 className="card-title">{blog.title}</h5>
                <p className="card-text text-muted">Status: <strong>{blog.status}</strong></p>
                <p className="card-text">👍 {blog.likes} | 👀 {blog.views}</p>
                {blog.tags.length > 0 && (
                  <p className="card-text">
                    <strong>Tags:</strong> {blog.tags.join(", ")}
                  </p>
                )}
                <p className="text-muted">Last Updated: {new Date(blog.lastUpdated).toLocaleDateString()}</p>
                <div className="btn-group d-flex">
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(blog._id)}>✏️ Edit</button>
                  {blog.status === "published" ? (
                    <button className="btn btn-warning btn-sm" onClick={() => handleUnpublish(blog._id)}>📥 Unpublish</button>
                  ) : (
                    <button className="btn btn-success btn-sm" onClick={() => handleRepublish(blog._id)}>🚀 Republish</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(blog._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default BlogManagement;
