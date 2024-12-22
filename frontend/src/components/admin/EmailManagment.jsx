import React, { useState, useEffect } from "react";
import API, { emailAPI } from "../../api";

const EmailManagement = () => {
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState({ email: "", name: "" });
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch recipients from the email backend
  const fetchRecipients = async () => {
    try {
      const response = await emailAPI.get("/api/email/recipients");
      setRecipients(response.data.recipients);
    } catch (error) {
      console.error("Error fetching recipients:", error);
    }
  };

  // Fetch the latest version and its changes
  const fetchLatestUpdate = async () => {
    try {
      const response = await API.get("/api/updates/latest");
      const latestVersion = response.data.updates[0]; // Assuming updates are sorted with the latest first
      setLatestUpdates(latestVersion.changes || []);
      setVersion(latestVersion.version);
    } catch (error) {
      console.error("Error fetching the latest update:", error);
      setLatestUpdates("No update available.");
    }
  };

  // Add a new recipient
  const addRecipient = async () => {
    if (!newRecipient.email) {
      setMessage("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await emailAPI.post("/api/email/add-recipient", newRecipient);
      setRecipients([...recipients, response.data.recipient]);
      setNewRecipient({ email: "", name: "" });
      setMessage("Recipient added successfully!");
    } catch (error) {
      console.error("Error adding recipient:", error);
      setMessage("Failed to add recipient.");
    } finally {
      setLoading(false);
    }
  };

  // Remove a recipient
  const removeRecipient = async (id) => {
    setLoading(true);
    try {
      await emailAPI.delete(`/api/email/remove-recipient/${id}`);
      setRecipients(recipients.filter((recipient) => recipient._id !== id));
      setMessage("Recipient removed successfully.");
    } catch (error) {
      console.error("Error removing recipient:", error);
      setMessage("Failed to remove recipient.");
    } finally {
      setLoading(false);
    }
  };

  // Send only the latest version updates via email
  const sendEmails = async () => {
    if (!latestUpdates || latestUpdates.length === 0) {
      setMessage("No update to send.");
      return;
    }

    setLoading(true);
    try {
      const response = await emailAPI.post("/api/email/send-emails", {
        subject: "Latest Updates",
        text: latestUpdates,
        version: version,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error sending emails:", error);
      setMessage("Failed to send emails.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
    fetchLatestUpdate();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Email Management</h2>

      <div className="row">
        {/* Left side - Add Recipient */}
        <div className="col-md-6">
          <div className="card p-4">
            <h4>Add Recipient</h4>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Recipient Email"
                value={newRecipient.email}
                onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Recipient Name (Optional)"
                value={newRecipient.name}
                onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={addRecipient} disabled={loading}>
              {loading ? "Adding..." : "Add Recipient"}
            </button>
          </div>
        </div>

        {/* Right side - Latest Update */}
        <div className="col-md-6">
          <div className="card p-4">
            <h4>Latest Update</h4>
            <ul className="list-group">
              {latestUpdates.map((update, index) => (
                <li key={index} className="list-group-item">
                  {update.type === "add" ? "+ " : "- "}
                  {update.message}
                </li>
              ))}
            </ul>
            <button className="btn btn-success" onClick={sendEmails} disabled={loading}>
              {loading ? "Sending..." : "Send Update to All Recipients"}
            </button>
          </div>
        </div>
      </div>

      {/* All Recipients */}
      <div className="card p-4 mt-4">
        <h4>Recipients List</h4>
        <div className="row">
          {recipients.map((recipient) => (
            <div key={recipient._id} className="col-md-3 mb-3">
              <div className="card p-3">
                <div>
                  <strong>{recipient.name ? `${recipient.name} (${recipient.email})` : recipient.email}</strong>
                </div>
                <button className="btn btn-danger btn-sm mt-2" onClick={() => removeRecipient(recipient._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && <div className="alert alert-info mt-4">{message}</div>}
    </div>
  );
};

export default EmailManagement;
