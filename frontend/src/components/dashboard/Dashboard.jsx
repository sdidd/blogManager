import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, NavLink } from "react-router-dom";
import API from "../../api";
import roles from "../../utils/roles";
import Logout from "../Logout";
import {FaUser, FaPen} from "react-icons/fa"; // Example React Icons import

// import HolidaysComponent from "./dashboard/HolidaysComponent";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [showDefaultContent, setShowDefaultContent] = useState(true); // Toggle default widgets
  const navigate = useNavigate();

  useEffect(() => {
    if(location.pathname !== "/dashboard"){
      setShowDefaultContent(false);
    }
  
  }, [location.pathname])
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/user/profile");
        // console.log(response.data);

        setUserRole(response.data.role.name);
        setUser(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login"); // Redirect to login
        } else {
          console.error("Error fetching user profile:", err);
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark rounded p-2">
        <Link className="navbar-brand" to="/dashboard" onClick={() => setShowDefaultContent(true)}>
          Dashboard
        </Link>
        <div className="ml-auto d-flex align-items-center">
          {/* <Link className="btn btn-success mr-2" to="drives" onClick={() => setShowDefaultContent(false)}>
            Cloud Storage
          </Link> */}
          <Link className="btn btn-success mr-2" to="blogmakerstudio" onClick={() => setShowDefaultContent(false)}>
            Blog Maker Studio
          </Link>
          {userRole === roles.admin && (
            <Link className="btn btn-danger mr-2" to="admindashboard" onClick={() => setShowDefaultContent(false)}>
              Admin Panel
            </Link>
          )}
          <div className="dropdown">
            <button
              className="btn btn-primary dropdown-toggle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Profile
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              {user && (
                <>
                  <li className="justify-content-center d-flex dropdown-item">
                    <img
                      src={user.image}
                      className="rounded-circle"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  </li>
                  <li className="dropdown-item">
                    <strong>Username:</strong> {user.username}
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                </>
              )}
              <li>
                <Logout inside="dropdown" />
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link className="dropdown-item" to="profile" onClick={() => setShowDefaultContent(false)}>
                  More Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {showDefaultContent ? (
        <div className="row mt-4">
          {/* Profile Card */}
          <div className="col-md-4 mb-3">
            <div
              className="card"
              style={{
                cursor: "pointer",
                aspectRatio: "16 / 9", // Set consistent aspect ratio
                transition: "transform 0.3s ease-in-out", // Smooth scale transition
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")} // Hover effect to scale up
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Link
                className="card"
                to="profile"
                onClick={() => setShowDefaultContent(false)}
                style={{
                  textDecoration: "none",
                  height: "100%", // Ensure the card fills the container
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <FaUser style={{ fontSize: "2rem" }} /> {/* React Icon scaled */}
                  <h5 className="card-title">Profile</h5>
                  <p className="card-text text-center">View and update your profile information.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Blog Management Card */}
          <div className="col-md-4 mb-3">
            <div
              className="card"
              onClick={() => navigate("/blogManagement")}
              style={{
                cursor: "pointer",
                aspectRatio: "16 / 9", // Set consistent aspect ratio
                transition: "transform 0.3s ease-in-out", // Smooth scale transition
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")} // Hover effect to scale up
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <FaPen style={{ fontSize: "2rem" }} /> {/* React Icon scaled */}
                <h5 className="card-title">Blog Management</h5>
                <p className="card-text text-center">Manage your blogs and posts here.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Dashboard;
