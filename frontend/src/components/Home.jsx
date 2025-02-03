import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BlogHome from "./blogs/BlogHome";
import "../css/Home.css";

const Home = () => {
  const [sortType, setSortType] = useState("algorithm");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div>
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
                <div className="dropdown">
                  <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    {sortType === "recent" ? "Recent Blogs" : sortType === "popular" ? "Popular Blogs" : "Algorithm Blogs"}
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
                    {isLoggedIn && (
                      <li>
                        <button className="dropdown-item" onClick={() => setSortType("algorithm")}>
                          Algorithm
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </li>
              <li className="nav-item">
                <Link to="/dashboard" className="btn mt-lg-0 dashboard-btn">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <BlogHome sortType={sortType} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Home;
