import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import roles from "../utils/roles";
import API from "../api";
import Logout from "./Logout";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/user/profile");
        setUserRole(response.data.role.name);
        setUser(response.data); // Store the user details
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login"); // Redirect to login on unauthorized
        } else {
          console.error("Error fetching user role", err);
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark rounded p-2">
        <span className="navbar-brand">Dashboard</span>
        <div className="ml-auto d-flex align-items-center">
          <Link className="btn btn-success mr-2" to="results">
            Results
          </Link>
          {userRole === roles.admin && (
            <Link className="btn btn-danger mr-2" to="admindashboard">
              Admin Panel
            </Link>
          )}

          {/* Profile Dropdown */}
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
                  <li className="dropdown-item">
                    <strong>Username:</strong> {user.username}
                  </li>
                  <li className="dropdown-item">
                    <strong>Branch:</strong> {user.branch}
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
                <Link className="dropdown-item" to="profile">
                  More Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Render child components */}
      <Outlet />
    </div>
  );
};

export default Dashboard;
