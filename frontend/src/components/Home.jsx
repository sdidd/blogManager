import React from "react";
import { Link } from "react-router-dom";
import { FaBlog, FaPen, FaRegEdit, FaSearch } from "react-icons/fa";
import { BsUpload, BsFileText } from "react-icons/bs";

const Home = () => {
  return (
    <>
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
              <li className="nav-item">
                <a className="nav-link" href="#explore">
                  Explore Blogs
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <Link
                  to="/dashboard"
                  className="btn btn-primary ms-2"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <FaPen className="me-2" />
                  Write a Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-dark text-white text-center py-5">
        <div className="container-fluid px-3">
          <h1 className="display-4 fw-bold">Welcome to Blogosphere</h1>
          <p className="lead">
            Share your thoughts, ideas, and stories with the world. Join our community of writers and readers!
          </p>
          <a href="#explore" className="btn btn-outline-primary btn-lg">
            <FaSearch className="me-2" />
            Explore Blogs
          </a>
        </div>
      </header>

      {/* About Us Section */}
      <section id="about" className="py-5 bg-secondary text-white">
        <div className="container text-center px-4">
          <h2 className="fw-bold mb-4">About Blogosphere</h2>
          <p className="lead">
            Blogosphere is a platform for everyone to express themselves. Share your blogs, read others' stories, and connect with like-minded individuals.
            No restrictions except for content that violates laws or community guidelines.
          </p>
        </div>
      </section>

      {/* Explore Blogs Section */}
      <section id="explore" className="py-5">
        <div className="container">
          <h2 className="fw-bold mb-4 text-center">Explore Blogs</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-dark text-white text-center rounded h-100">
                <h3 className="fw-bold">Tech Blogs</h3>
                <p>Latest in tech, gadgets, software, and more.</p>
                <Link to="/blogs/tech" className="btn btn-outline-light">
                  <BsFileText className="me-2" />
                  Read Now
                </Link>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-dark text-white text-center rounded h-100">
                <h3 className="fw-bold">Lifestyle Blogs</h3>
                <p>Explore lifestyle trends, wellness tips, and personal stories.</p>
                <Link to="/blogs/lifestyle" className="btn btn-outline-light">
                  <BsFileText className="me-2" />
                  Read Now
                </Link>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-dark text-white text-center rounded h-100">
                <h3 className="fw-bold">Travel Blogs</h3>
                <p>Discover new places, cultures, and adventures.</p>
                <Link to="/blogs/travel" className="btn btn-outline-light">
                  <BsFileText className="me-2" />
                  Read Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Blog Section */}
      <section id="upload" className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Upload Your Blog</h2>
          <p className="lead">
            Have something to share? Upload your blog and inspire others! It’s quick and easy.
          </p>
          <a href="/dashboard/blogmakerstudio" className="btn btn-primary">
            <BsUpload className="me-2" />
            Upload Your Blog
          </a>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-5 bg-secondary text-white">
        <div className="container text-center px-4">
          <h2 className="fw-bold mb-4">Contact Us</h2>
          <p className="lead">
            Have questions or feedback? Reach out to us and help make Blogosphere better!
          </p>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input type="text" className="form-control" id="name" />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Your Email
                  </label>
                  <input type="email" className="form-control" id="email" />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Your Message
                  </label>
                  <textarea className="form-control" id="message" rows="3"></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
