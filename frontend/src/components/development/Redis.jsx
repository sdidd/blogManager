import React, { useState, useEffect } from "react";
import API from "../../api"; // Adjust based on your API utility file

const Redis = () => {
  const [keys, setKeys] = useState([]);
  const [keyData, setKeyData] = useState(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch Redis keys on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await API.get("/api/redis/keys");
        setKeys(response.data);
        setLoading(false);
      } catch (err) {
        console.error("[ERROR] Failed to fetch keys:", err);
        setLoading(false);
      }
    };

    fetchKeys();
  }, [message]); // Re-fetch keys on real-time updates

  // Fetch value of specific key
  const fetchKeyData = async (key) => {
    try {
      const response = await API.get(`/api/redis/key/${key}`);
      setKeyData(response.data);
    } catch (err) {
      console.error("[ERROR] Failed to fetch key data:", err);
      setKeyData({ error: "Failed to fetch key data" });
    }
  };

  // Create or update a Redis key
  const handleCreateOrUpdate = async () => {
    if (!newKey || !newValue) {
      setMessage("Both key and value are required.");
      return;
    }
    try {
      await API.post("/api/redis/key", { key: newKey, value: newValue });
      setMessage(`Key '${newKey}' created/updated successfully.`);
      setNewKey("");
      setNewValue("");
    } catch (err) {
      console.error("[ERROR] Failed to create/update key:", err);
      setMessage("Failed to create/update key.");
    }
  };

  // Delete a Redis key
  const handleDelete = async (key) => {
    try {
      await API.delete(`/api/redis/key/${key}`);
      setMessage(`Key '${key}' deleted successfully.`);
    } catch (err) {
      console.error("[ERROR] Failed to delete key:", err);
      setMessage("Failed to delete key.");
    }
  };

  // Real-time subscribe to updates
  const handleSubscribe = async (channel) => {
    try {
      const response = await API.post("/api/redis/subscribe", { channel });
      setMessage(response.data.message);
    } catch (err) {
      console.error("[ERROR] Failed to subscribe:", err);
      setMessage("Failed to subscribe to updates.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">Redis Data</h1>

      <div className="alert alert-info">{message}</div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <h3>All Redis Keys</h3>
          <ul className="list-group">
            {keys.length === 0 ? (
              <li className="list-group-item">No keys found in Redis</li>
            ) : (
              keys.map((key) => (
                <li
                  key={key}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {key}
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => fetchKeyData(key)}
                  >
                    View Data
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(key)}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>

          <h3 className="mt-4">Create or Update Redis Key</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrUpdate();
            }}
          >
            <div className="form-group">
              <label htmlFor="newKey">Key</label>
              <input
                type="text"
                className="form-control"
                id="newKey"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newValue">Value</label>
              <input
                type="text"
                className="form-control"
                id="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Create/Update
            </button>
          </form>

          {keyData && (
            <div className="mt-4">
              <h3>Key Data</h3>
              <pre>{JSON.stringify(keyData, null, 2)}</pre>
            </div>
          )}

          <h3 className="mt-4">Subscribe to Key Updates</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubscribe("keyUpdates"); // Example channel
            }}
          >
            <button type="submit" className="btn btn-success mt-3">
              Subscribe to Key Changes
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Redis;
