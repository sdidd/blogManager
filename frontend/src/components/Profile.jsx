import React, { useState, useEffect } from "react";import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import API from "../api";
import Logout from "./Logout";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    // Validate file size (50KB - 300KB)
    const fileSizeInKB = file.size / 1024;
    if (fileSizeInKB < 50 || fileSizeInKB > 300) {
      alert("File size must be between 50KB and 300KB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    // Revalidate file type and size
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type.");
      return;
    }
    const fileSizeInKB = selectedFile.size / 1024;
    if (fileSizeInKB < 50 || fileSizeInKB > 300) {
      alert("File size must be between 50KB and 300KB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await API.post("/user/uploadimage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prevUser) => ({
        ...prevUser,
        image: response.data.url,
      }));

      setShowModal(false);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please try again.");
    }
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
        <Logout />
      </div>

      {/* Profile Card */}
      <div className="card shadow-lg p-4">
        <div className="d-flex align-items-center mb-4 position-relative">
          <div className="d-flex position-relative">
            <img
              src={user.image || "default-profile.png"}
              alt={`${user.username}'s profile`}
              className="rounded-circle"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            {/* Edit Icon */}
            <div
              className="position-absolute"
              style={{
                bottom: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "5px",
                border: "2px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => setShowModal(true)}
            >
              <CiEdit size={30} style={{ color: "#555" }} />
            </div>
          </div>
          <h4 className="mb-0 ms-3">{user.data.name}</h4>
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
            {user.role?.permissions?.length ? user.role.permissions.join(", ") : "No permissions assigned"}
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
            <strong>Last Date:</strong> {new Date(user.fees.lastDate).toLocaleDateString()}
          </li>
        </ul>
      </div>

      {/* Bootstrap Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          aria-labelledby="uploadModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="uploadModalLabel">
                  Upload Profile Image
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png" // Restrict file types
                />
                {selectedFile && (
                  <p className="mt-2 text-info">
                    Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleUpload}>
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
