import React, { useState, useEffect } from "react";import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { AiOutlineCheck } from "react-icons/ai";
import API from "../api";
import Logout from "./Logout";
import roles from "../utils/roles";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState({ field: "", value: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

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

  const validateField = async (field, value) => {
    try {
      if (field === "username") {
        const res = await API.get(`/auth/check-username/${value}`);
        if (res.status !== 200) return false;
      }
      if (field === "email") {
        const res = await API.get(`/auth/check-email/${value}`);
        if (res.status !== 200) return false;
      }
      return true;
    } catch (error) {
      console.error(`Validation error for ${field}:`, error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!editing.field) return;

    const isValid = await validateField(editing.field, editing.value);
    if (!isValid) {
      alert(`${editing.field === "username" ? "Username" : "Email"} is already taken!`);
      return;
    }

    try {
      await API.put("/user/update", { field: editing.field, value: editing.value });
      setUser((prevUser) => ({ ...prevUser, [editing.field]: editing.value }));
      setEditing({ field: "", value: "" });
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG and PNG files are allowed.");
      return;
    }
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

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await API.post("/user/uploadimage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser((prevUser) => ({ ...prevUser, image: response.data.url }));
      setShowModal(false);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please try again.");
    }
  };

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

        {/* Editable Info */}
        <h5>Profile Information</h5>
        <ul className="list-group mb-4">
          {[
            { label: "Username", key: "username" },
            { label: "Email", key: "email" },
            { label: "Age", key: "age" },
            { label: "Full Name", key: "data.name" },
          ].map((item) => (
            <li key={item.key} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <strong>{item.label}:</strong>{" "}
                {editing.field === item.key ? (
                  <input
                    type="text"
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  />
                ) : item.key.includes(".") ? (
                  user.data[item.key.split(".")[1]]
                ) : (
                  user[item.key]
                )}
              </span>

              <div>
                {editing.field === item.key ? (
                  <AiOutlineCheck size={25} style={{ cursor: "pointer", color: "green" }} onClick={handleSave} />
                ) : (
                  <CiEdit
                    size={25}
                    style={{ cursor: "pointer", color: "#555" }}
                    onClick={() =>
                      setEditing({
                        field: item.key,
                        value: item.key.includes(".") ? user.data[item.key.split(".")[1]] : user[item.key],
                      })
                    }
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
        {/* Role & Permissions */}
        <h5>Role & Permissions</h5>
        <ul className="list-group mb-4">
          <li className="list-group-item">
            <strong>Role:</strong> {user.role?.name || "N/A"}
          </li>
          <li className="list-group-item">
            <strong>Permissions:</strong>{" "}
            {user.role?.permissions?.length && user.role.name === roles.admin
              ? user.role.permissions.join(", ")
              : "No permissions assigned"}
          </li>
        </ul>

        {/* Account Details */}
        <h5>Account Details</h5>
        <ul className="list-group">
          <li className="list-group-item">
            <strong>Token Version:</strong> {user.tokenVersion}
          </li>
          <li className="list-group-item">
            <strong>Verified:</strong> {user.isVerified ? "Yes" : "No"}
          </li>
        </ul>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Profile Image</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="file" className="form-control" onChange={handleFileChange} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpload}>
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
