import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import API from "../../api";
import roles from "../../utils/roles";
import Logout from "../Logout";

// import HolidaysComponent from "./dashboard/HolidaysComponent";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [showDefaultContent, setShowDefaultContent] = useState(true); // Toggle default widgets
  const navigate = useNavigate();

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
        <Link className="navbar-brand" to='/dashboard'>Dashboard</Link>
        <div className="ml-auto d-flex align-items-center">
          {/* <Link className="btn btn-success mr-2" to="drives" onClick={() => setShowDefaultContent(false)}>
            Cloud Storage
          </Link> */}
          {/* <Link className="btn btn-success mr-2" to="images" onClick={() => setShowDefaultContent(false)}>
            Images
          </Link> */}
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
          <div className="col-md-6 mb-3">
            {/* <HolidaysComponent /> */}
          </div>
          {/* <div className="col-md-6 mb-3">
            <GeoLocationComponent />
          </div> */}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Dashboard;
