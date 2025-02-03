import React, { useState, useEffect } from "react";import { Link, useNavigate } from "react-router-dom";
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
    <div className="container d-flex align-items-center p-0 mx-0" style={{ height: "100vh" }}>
      <div className="row w-100">
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
          <div className="card p-4 shadow mx-auto" style={{ width: "100%", maxWidth: "400px" }}>
            <h1 className="text-center mb-4">Login</h1>
            {error && (
              <p style={{ color: "red" }} className="text-center">
                {error}
              </p>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-3 form-floating">
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Username"
                />
                <label>Username</label>
              </div>
              <div className="mb-3 form-floating">
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <label>Password</label>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Login
              </button>
              <div className="text-center">
                <Link to="/register" className="btn btn-link">
                  New? Sign Up Here
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

export default Login;
