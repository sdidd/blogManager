import React from "react";
import { Link } from "react-router-dom";
import Locations from "./home/Locations";

const Home = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="/">
            Project Pineapple
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
                <a className="nav-link" href="#about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#locations">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                <Link
                  to="/dashboard"
                  className="btn btn-primary ms-2"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-dark text-white text-center py-5">
        <div className="container-fluid px-3">
          <h1 className="display-4 fw-bold">Welcome to Project Pineapple</h1>
          <p className="lead">
            The open-source platform for sharing and accessing courses freely. Share
            knowledge, learn without limits, and earn achievements!
          </p>
          <a href="#about" className="btn btn-outline-primary btn-lg">
            Learn More
          </a>
        </div>
      </header>

      {/* About Us Section */}
      <section id="about" className="py-5 bg-secondary text-white">
        <div className="container text-center px-4">
          <h2 className="fw-bold mb-4">About Project Pineapple</h2>
          <p className="lead">
            Project Pineapple is a futuristic web app designed to democratize education. Anyone can upload
            courses or register for courses for free. Forget about expensive certifications—focus on
            gaining knowledge and earning achievements to showcase your learning journey.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <h2 className="fw-bold mb-4 text-center">Features</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-dark text-white text-center rounded h-100">
                <h3 className="fw-bold">Free Courses</h3>
                <p>Access a wide variety of courses without any cost. Knowledge for everyone!</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-dark text-white text-center rounded h-100">
                <h3 className="fw-bold">Upload Your Courses</h3>
                <p>Share your expertise with the world. Contribute to the learning community.</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-dark text-white text-center rounded h-100">
                <h3 className="fw-bold">Achievements</h3>
                <p>Earn badges and achievements to mark your progress and skills.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <Locations />

      {/* Contact Us Section */}
      <section id="contact" className="py-5 bg-secondary text-white">
        <div className="container text-center px-4">
          <h2 className="fw-bold mb-4">Contact Us</h2>
          <p className="lead">
            Have questions? We're here to help. Reach out to us, and let's make education accessible to all.
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
