import React, { useState, useEffect } from "react";import API from "../../api";

const SessionManagement = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [blacklistedSessions, setBlacklistedSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/session/active-sessions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setActiveSessions(response.data.activeSessions);
      setBlacklistedSessions(response.data.blacklistedSessions);
    } catch (err) {
      console.error("[ERROR] Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const revokeToken = async (token) => {
    try {
      if (window.confirm("Want to revoke this Token?")) {
        await API.post(
          "/admin/session/revoke-token",
          { token },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } else {
        const err = { err: "Not confirmed!!" };
        throw err;
      }

      // alert("Token revoked successfully");
      fetchSessions();
    } catch (err) {
      console.error("[ERROR] Failed to revoke token:", err);
    }
  };

  const restoreToken = async (token) => {
    try {
      if (window.confirm("Want to restore this Token?")) {
        await API.post(
          "/admin/session/restore-token",
          { token },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } else {
        const err = { err: "Not confirmed!!" };
        throw err;
      }

      // alert("Token restored successfully");
      fetchSessions();
    } catch (err) {
      console.error("[ERROR] Failed to restore token:", err);
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
        <>
          <h3>Active Sessions</h3>
          <SessionTable sessions={activeSessions} onAction={revokeToken} actionLabel="Revoke" />
          <h3 className="mt-4">Blacklisted Sessions</h3>
          <SessionTable sessions={blacklistedSessions} onAction={restoreToken} actionLabel="Restore" />
        </>
      )}
    </div>
  );
};

const SessionTable = ({ sessions, onAction, actionLabel }) => (
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
            <tr key={session.token}>
              <td>{session.userId || "Unknown"}</td>
              <td>{session.token}</td>
              <td>{session.ip || "N/A"}</td>
              <td>{new Date(session.timestamp).toLocaleString()}</td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => onAction(session.token)}>
                  {actionLabel}
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">
              No sessions found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default SessionManagement;
