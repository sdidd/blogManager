import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/register.css";
import { IoHome } from "react-icons/io5";

import API from "../api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/login", { username, password });
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // Store JWT token
        navigate("/dashboard"); // Redirect to Dashboard
      } else {
        console.log("Please try again later");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="container mt-5 col-sm-5 mx-auto">
      <Link to="/" className="vertical-bar">
        <IoHome />
        <span>Home</span>
      </Link>
      <h1 className="text-center mb-4">Login</h1>
      {error && (
        <p style={{ color: "red" }} className="text-center">
          {error}
        </p>
      )}
      <form onSubmit={handleLogin} className="w-50 mx-auto">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username:
          </label>
          <input
            id="username"
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-3">
          Login
        </button>
        <div className="text-center">
          <Link to="/register" className="btn btn-link">
            New Student? Register Here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
