import React from "react";import { Link } from "react-router-dom";
import Locations from "./home/Locations";

const Home = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            CoachingPro
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
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#locations">
                  Locations
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact Us
                </a>
              </li>
              <li className="nav-item">
                <Link to="/login" className="btn btn-primary ms-2">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Welcome to CoachingPro</h1>
          <p className="lead">Transforming education with experienced mentors and state-of-the-art facilities.</p>
          <a href="#about" className="btn btn-light btn-lg">
            Learn More
          </a>
        </div>
      </header>

      {/* About Us Section */}
      <section id="about" className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">About Us</h2>
          <p className="lead">
            CoachingPro is dedicated to providing top-notch coaching services for students of all ages. With a team of
            experienced educators and a proven track record of success, we help students achieve their dreams and unlock
            their potential.
          </p>
        </div>
      </section>

      {/* Locations Section */}
      <Locations />

      {/* Contact Us Section */}
      <section id="contact" className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Contact Us</h2>
          <p className="lead">Have questions? Reach out to us, and we'll be happy to assist you!</p>
          <div className="row justify-content-center">
            <div className="col-md-6">
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
