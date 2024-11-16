import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Profile = () => {
  const [user, setUser] = useState(null); // Use `null` for better loading handling
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Redirect to Login
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/user/profile");
        console.log(response.data);
        setUser(response.data); // Set the fetched user data
      } catch (err) {
        if (err.response?.status === 401) {
          console.error("Unauthorized: Redirecting to login");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "An error occurred");
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-4">
      {/* Logout Button at Top Right */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>User Profile</h3>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Profile Information */}
      <div className="card p-4 shadow">
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Age:</strong> {user.age}
        </p>
        <p>
          <strong>Location:</strong> {user.location}
        </p>
        <p>
          <strong>Branch:</strong> {user.branch}
        </p>
        <p>
          <strong>Role Name:</strong> {user.role?.name || "N/A"}
        </p>
        <p>
          <strong>Permissions:</strong>{" "}
          {user.role?.permissions?.length
            ? user.role.permissions.join(", ")
            : "No permissions assigned"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
