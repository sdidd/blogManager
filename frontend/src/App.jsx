import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import API from "./api";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [updates, setUpdates] = useState([]); // Update message state
  const [showUpdates, setShowUpdates] = useState(true); // Controls update modal visibility
  const [version, setVersion] = useState("");

  const validateToken = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
      } else {
        const response = await API.get("/auth/verifyToken");
        if (response.status !== 200) {
          const refreshResponse = await API.post("/auth/refresh-token");
          if (refreshResponse.status === 200) {
            localStorage.setItem("token", refreshResponse.data.token);
          } else {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      }
    } catch (err) {
      console.error("Token validation or refresh failed:", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    validateToken();
    const intervalId = setInterval(validateToken, 780000); // 780000 13 minutes in milliseconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  // Fetch the latest update message
  const fetchUpdateMessage = async () => {
    try {
      const response = await API.get("/api/updates/latest");
      const latestVersion = response.data.updates[0]; // Assuming updates are sorted with the latest first
      setVersion(latestVersion.version);
      setUpdates(latestVersion.changes || [{ id: "1", message: "No updates at this time", type: "remove" }]);
    } catch (err) {
      setUpdates(["No updates at this time."]);
    }
  };

  useEffect(() => {
    fetchUpdateMessage(); // Fetch when the app loads
  }, []);

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <main>
          <Outlet /> {/* Render nested routes */}
        </main>
      </div>

      {/* Update Message Box - Shows on all pages */}
      {updates.length > 0 && showUpdates && (
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
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-2 text-primary">📢 New Update {version}</h6>
            {/* Close button */}
            <button
              onClick={() => setShowUpdates(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                color: "#555",
              }}
            >
              ✖
            </button>
          </div>
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

      <footer className="mt-auto text-center py-2 bg-light">Copyright @ Pineapple Solutions</footer>
    </>
  );
};

export default App;
