import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/user/profile");
        setUser(response.data);
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
    return <div className="text-danger text-center mt-4">{error}</div>;
  }

  if (!user) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  return (
    <div className="container mt-5">
      {/* Logout Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>User Profile</h3>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="card shadow-lg p-4">
        <div className="d-flex align-items-center mb-4">
          <img
            src={user.image || "default-profile.png"}
            alt={`${user.username}'s profile`}
            className="rounded-circle me-3"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <h4 className="mb-0">{user.data.name}</h4>
        </div>
        <hr />

        {/* Basic Info */}
        <h5>Basic Information</h5>
        <ul className="list-group mb-4">
          <li className="list-group-item">
            <strong>Username:</strong> {user.username}
          </li>
          <li className="list-group-item">
            <strong>Email:</strong> {user.email}
          </li>
          <li className="list-group-item">
            <strong>Age:</strong> {user.age}
          </li>
          <li className="list-group-item">
            <strong>Location:</strong> {user.location}
          </li>
          <li className="list-group-item">
            <strong>Branch:</strong> {user.branch}
          </li>
          <li className="list-group-item">
            <strong>Standard:</strong> {user.standard}
          </li>
        </ul>

        {/* Role & Permissions */}
        <h5>Role & Permissions</h5>
        <ul className="list-group mb-4">
          <li className="list-group-item">
            <strong>Role:</strong> {user.role?.name || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Permissions:</strong>{" "}
            {user.role?.permissions?.length
              ? user.role.permissions.join(", ")
              : "No permissions assigned"}
          </li>
        </ul>

        {/* Account Details */}
        <h5>Account Details</h5>
        <ul className="list-group mb-4">
          <li className="list-group-item">
            <strong>ID:</strong> {user._id}
          </li>
          <li className="list-group-item">
            <strong>Token Version:</strong> {user.tokenVersion}
          </li>
          <li className="list-group-item">
            <strong>Verified:</strong> {user.isVerified ? "Yes" : "No"}
          </li>
        </ul>

        {/* Fees Information */}
        <h5>Fees Information</h5>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Paid:</strong> {user.fees.paid ? "Yes" : "No"}
          </li>
          <li className="list-group-item">
            <strong>Remaining:</strong> ${user.fees.remaining}
          </li>
          <li className="list-group-item">
            <strong>Total:</strong> ${user.fees.total}
          </li>
          <li className="list-group-item">
            <strong>Last Date:</strong>{" "}
            {new Date(user.fees.lastDate).toLocaleDateString()}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
