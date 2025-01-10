import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ReactMarkdown from "react-markdown";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import "../css/Home.css";
import "../css/NavigationButtons.css";

const Home = () => {
  const [blogs, setBlogs] = useState([]); // Store multiple blogs
  const [loading, setLoading] = useState(true); // Loading state
  const [currentIndex, setCurrentIndex] = useState(0); // Track current blog index
  const [sortType, setSortType] = useState("recent"); // Sorting dropdown state

  const fetchBlogs = async () => {
    try {
      const res = await API.get(`/api/blog/home?sort=${sortType}&limit=10`); // Fetch blogs with sort and limit
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(); // Fetch blogs initially
  }, [sortType]); // Re-fetch blogs when sortType changes

  // Move to the next blog
  const nextBlog = () => {
    if (currentIndex < blogs.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Move to the previous blog
  const prevBlog = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => nextBlog(),
    onSwipedRight: () => prevBlog(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Render content when loading
  if (loading) {
    return <Skeleton height={200} />;
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="/">
            Blogosphere
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto text-center">
              {/* <li className="nav-item dropdown">
                <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  {sortType === "recent" ? "Recent Blogs" : "Popular Blogs"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item" onClick={() => setSortType("recent")}>
                      Recent
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => setSortType("popular")}>
                      Popular
                    </button>
                  </li>
                </ul>
              </li> */}
              <li className="nav-item">
                <Link to="/dashboard" className="btn mt-lg-0 dashboard-btn">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Blog Section */}
      <section className="mt-4" {...handlers}>
        <div className="container text-center">
          {/* Single Blog Display */}
          {blogs.length > 0 && (
            <div className="card shadow">
              <div className="dropdown position-absolute top-0 start-100 translate-middle badge">
                <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  {sortType === "recent" ? "Recent Blogs" : "Popular Blogs"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item" onClick={() => setSortType("recent")}>
                      Recent
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => setSortType("popular")}>
                      Popular
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                <h5 className="card-title">{blogs[currentIndex].title}</h5>
                <div
                  className="card-text"
                  style={{
                    margin: "0 auto", // Center the content
                    height: "600px", // Reduce height
                    overflowY: "auto",
                    padding: "10px",
                  }}
                >
                  <ReactMarkdown>{blogs[currentIndex].content}</ReactMarkdown>
                </div>
              </div>
              <div className="card-footer text-muted">
                {blogs[currentIndex].likes} Likes | {blogs[currentIndex].comments.length} Comments |{" "}
                {blogs[currentIndex].views} Views
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <button
            className="btn btn-outline-secondary navigation-button position-fixed start-0 top-50 translate-middle-y"
            onClick={prevBlog}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <button
            className="btn btn-outline-secondary navigation-button position-fixed end-0 top-50 translate-middle-y"
            onClick={nextBlog}
            disabled={currentIndex === blogs.length - 1}
          >
            <FaChevronRight />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
