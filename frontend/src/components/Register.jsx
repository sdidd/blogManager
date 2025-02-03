import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/register.css";
import { IoHome } from "react-icons/io5";

import API from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  // Validate username in real time
  useEffect(() => {
    const validateUsername = async () => {
      if (!formData.username) {
        setUsernameError(""); // Clear error if empty
        return;
      }
      try {
        await API.get(`/auth/check-username/${formData.username}`);
        setUsernameError(""); // Username is available
      } catch (err) {
        setUsernameError(err.response?.data?.error || "Error checking username");
      }
    };

    const debounce = setTimeout(validateUsername, 500); // Debounce API calls
    return () => clearTimeout(debounce);
  }, [formData.username]);

  // Validate email in real time
  useEffect(() => {
    const validateEmail = async () => {
      if (!formData.email) {
        setEmailError(""); // Clear error if empty
        return;
      }
      try {
        await API.get(`/auth/check-email/${formData.email}`);
        setEmailError(""); // Email is available
      } catch (err) {
        setEmailError(err.response?.data?.error || "Error checking email");
      }
    };

    const debounce = setTimeout(validateEmail, 500); // Debounce API calls
    return () => clearTimeout(debounce);
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Prevent submission if validation errors exist
    if (usernameError || emailError) {
      setError("Fix errors before submitting");
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate required fields
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // Restructure the payload to match the schema
      const payload = {
        username: formData.username,
        age: formData.age,
        email: formData.email,
        data: {
          name: formData.name || formData.username,
          password: formData.password,
        },
      };

      console.log(payload);
      const response = await API.post("/auth/register", payload);

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
    <div className="container d-flex align-items-center" style={{ height: "100vh" }}>
      <div className="row w-100">
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
          <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
            <h1 className="text-center mb-4">Sign Up</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleRegister}>
              <div className="mb-3 form-floating">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Username"
                  required
                />
                <label>Username</label>
                {usernameError && <p style={{ color: "red", fontSize: "0.9em" }}>{usernameError}</p>}
              </div>
              <div className="mb-3 form-floating">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Email"
                  required
                />
                <label>Email</label>
                {emailError && <p style={{ color: "red", fontSize: "0.9em" }}>{emailError}</p>}
              </div>
              <div className="mb-3 form-floating">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Password"
                  required
                />
                <label>Password</label>
              </div>
              <div className="mb-3 form-floating">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Confirm Password"
                  required
                />
                <label>Confirm Password</label>
              </div>
              <div className="mb-3 form-floating">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Full Name"
                  required
                />
                <label>Name</label>
              </div>
              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
                <Link className="btn btn-outline-secondary" to="/login">
                  Go Back
                </Link>
              </div>
            </form>
            <Link to="/" className="vertical-bar position-absolute start-100 translate-middle-y">
              <IoHome />
              <span>Home</span>
            </Link>
          </div>
        </div>
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center"></div>
      </div>
    </div>
  );
};

export default Register;
