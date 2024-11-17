import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    name: "",
    branch: "",
    standard: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate required fields
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.branch ||
      !formData.standard
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const defaultRoleId = "64a3fcd56e913f1a5ef9e001"; // Default Role ID
      const response = await API.post("/auth/register", {
        ...formData,
        role: defaultRoleId, // Assign default role
      });

      if (response.status === 201) {
        setSuccess("Registration successful! Please check your email for verification.");
        setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3s
      } else {
        setError("Registration failed. Try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="container mt-4">
      <h1>Register</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Age:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label>Branch</label>
          <div className="mb-3">
            <select name="branch" value={formData.branch} onChange={handleChange} className="form-select" required>
              <option value="" disabled>
                Select your branch
              </option>
              <option value="mhtcet">MHT-CET</option>
              <option value="jee">JEE</option>
              <option value="neet">NEET</option>
              <option value="law">Law</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label>Standard:</label>
          <div className="mb-3">
            <select name="standard" value={formData.standard} onChange={handleChange} className="form-control" required>
              <option value="" disabled>
                Select your standard
              </option>
              <option value="11">11<sup>th</sup> Standard</option>
              <option value="12">12<sup>th</sup> Standard</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
        <Link className="btn btn-dark" to="/login">
          Go Back
        </Link>
      </form>
    </div>
  );
};

export default Register;
