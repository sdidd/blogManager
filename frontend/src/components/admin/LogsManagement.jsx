import React, { useEffect, useState } from "react";
import API from "../../api";
import '../../css/logs.css'

const LogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  const [selectedLogs, setSelectedLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await API.get("/admin/logs");
        setLogs(response.data.logs || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Sort logs based on config
  const sortedLogs = [...logs].sort((a, b) => {
    if (sortConfig.key === "timestamp") {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    const valueA = a[sortConfig.key]?.toString().toLowerCase() || "";
    const valueB = b[sortConfig.key]?.toString().toLowerCase() || "";
    return sortConfig.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  const filteredLogs = sortedLogs.filter(
    (log) =>
      (filterType === "ALL" || log.type === filterType) &&
      (log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async () => {
    try {
      const response = await API.delete("/admin/logs", { data: { ids: selectedLogs } });
      setLogs((prevLogs) => prevLogs.filter((log) => !selectedLogs.includes(log._id)));
      setSelectedLogs([]);
      alert(response.data.message);
    } catch (error) {
      console.error("Error deleting logs:", error);
    }
  };

  const toggleSelectLog = (logId) => {
    setSelectedLogs((prevSelected) =>
      prevSelected.includes(logId) ? prevSelected.filter((id) => id !== logId) : [...prevSelected, logId]
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Logs Management</h2>

      {/* Filters and Search */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="form-group">
          <label htmlFor="filterType" className="form-label">
            Filter by Type
          </label>
          <select
            id="filterType"
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="LOGIN">Login</option>
            <option value="SESSION_TERMINATED">Session Terminated</option>
            <option value="TOKEN_REVOKED">Token Revoked</option>
            <option value="ACTION_PERFORMED">Action Performed</option>
            <option value="LOGOUT">Logout</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="searchQuery" className="form-label">
            Search Logs
          </label>
          <input
            type="text"
            id="searchQuery"
            className="form-control"
            placeholder="Search by details or IP"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Delete Button */}
      {selectedLogs.length > 0 && (
        <div className="mb-3">
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Selected Logs
          </button>
        </div>
      )}

      {/* Logs Table */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => setSelectedLogs(e.target.checked ? filteredLogs.map((log) => log._id) : [])}
                    checked={filteredLogs.length > 0 && selectedLogs.length === filteredLogs.length}
                  />
                </th>
                <th onClick={() => handleSort("timestamp")} style={{ cursor: "pointer" }}>
                  Timestamp {sortConfig.key === "timestamp" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => handleSort("userId")} style={{ cursor: "pointer" }}>
                  User ID {sortConfig.key === "userId" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => handleSort("type")} style={{ cursor: "pointer" }}>
                  Type {sortConfig.key === "type" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => handleSort("details")} style={{ cursor: "pointer" }}>
                  Details {sortConfig.key === "details" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th>IP</th>
                <th>User Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log._id)}
                        onChange={() => toggleSelectLog(log._id)}
                      />
                    </td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.userId}</td>
                    <td>
                      <h5><span
                        className={`badge ${
                          log.type === "LOGIN"
                            ? "badge-custom-login"
                            : log.type === "SESSION_TERMINATED"
                            ? "badge-custom-session-terminated"
                            : log.type === "TOKEN_REVOKED"
                            ? "badge-custom-token-revoked"
                            : log.type === "ACTION_PERFORMED"
                            ? "badge-custom-action-performed"
                            : log.type === "LOGOUT"
                            ? "badge-custom-logout"
                            : log.type === "CREATE"
                            ? "badge-custom-create"
                            : log.type === "UPDATE"
                            ? "badge-custom-update"
                            : log.type === "DELETE"
                            ? "badge-custom-delete"
                            : log.type === "READ"
                            ? "badge-custom-read"
                            : log.type === "PERMISSION_CHANGED"
                            ? "badge-custom-permission-changed"
                            : log.type === "ROLE_UPDATED"
                            ? "badge-custom-role-updated"
                            : log.type === "GET_PERMISSIONS"
                            ? "badge-custom-get-permissions"
                            : log.type === "GET"
                            ? "badge-custom-get"
                            : log.type === "ERROR"
                            ? "badge-custom-error"
                            : log.type === "POST"
                            ? "badge-custom-post"
                            : log.type === "PUT"
                            ? "badge-custom-put"
                            : "bg-secondary"
                        }`}
                      >
                        {log.type}
                      </span></h5>
                    </td>
                    <td>{log.details}</td>
                    <td>{log.ip}</td>
                    <td>{log.userAgent}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No logs found.
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

export default LogsManagement;
