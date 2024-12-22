import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import API from "./api";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [updates, setUpdates] = useState([]); // Update message state

  // Fetch the latest update message
  const fetchUpdateMessage = async () => {
    try {
      const response = await API.get("/api/updates/latest");
      const latestVersion = response.data.updates[0]; // Assuming updates are sorted with the latest first
      setUpdates(latestVersion.changes || [{ id: "1", message: "No updates at this time", type: "remove" }]);
    } catch (err) {
      setUpdates(["No updates at this time."]);
    }
  };

  useEffect(() => {
    fetchUpdateMessage(); // Fetch when the app loads
  }, []);

  useEffect(() => {
    const validateAndRefreshToken = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Attempt to refresh the token
          const response = await API.post("/auth/refresh-token");
          if (response.status === 401) {
            navigate("/login");
          } else {
            localStorage.setItem("token", response.data.token);
          }
        } else {
          // Validate the current token
          await API.get("/auth/verifyToken");
        }

        // Redirect to the dashboard if authenticated
        if (location.pathname === "/login" || location.pathname === "/register") {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Token validation or refresh failed:", err);
        // Clear the localStorage and redirect to login
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    validateAndRefreshToken();
  }, [navigate]);

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <main>
          <Outlet /> {/* Render nested routes */}
        </main>
      </div>
      {/* Update Message Box - Shows on all pages */}
      {updates.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px 15px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
            maxWidth: "300px",
            zIndex: 1000,
          }}
        >
          <h6 className="mb-2 text-primary">📢 New Update</h6>
          <ul style={{ paddingLeft: "1rem" }}>
            {updates.map((update, index) => (
              <li
                key={index}
                style={{
                  color: update.type === "add" ? "green" : "red",
                  listStyle: "none",
                }}
              >
                <span style={{ fontWeight: "bold" }}>{update.type === "add" ? "+ " : "- "}</span>
                {update.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <footer className="mt-auto text-center py-3 bg-light">Copyright @ Pineapple Solutions</footer>
    </>
  );
};

export default App;
