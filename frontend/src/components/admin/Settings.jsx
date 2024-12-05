import React, { useState, useEffect } from "react";
import API from "../../api";

const Settings = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllSessions();
  }, []);

  const fetchAllSessions = async () => {
    setLoading(true);
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Fetching all active sessions...");
      }

      const response = await API.get("/settings/admin/active-sessions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] Active sessions fetched:", response.data.sessions);
      }

      setSessions(response.data.sessions);
    } catch (err) {
      console.error("[ERROR] Failed to fetch all active sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (token) => {
    console.log(`[DEBUG] Attempting to revoke token: ${token}`); // Debug log

    try {
      await API.post(
        "/settings/admin/revoke-token",
        { token },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      alert("Session revoked successfully");
      fetchAllSessions();
    } catch (err) {
      console.error("[ERROR] Failed to revoke session:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Session Management</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Session ID</th>
                <th>IP Address</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <tr key={session._id}>
                    <td>{session.userId?.username || "Unknown"}</td>
                    <td>{session.token || "Unknown"}</td>
                    <td>{session.ip || "N/A"}</td>
                    <td>{session.timestamp ? new Date(session.timestamp).toLocaleString() : "No activity recorded"}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => revokeSession(session.token)}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No active sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Settings;
