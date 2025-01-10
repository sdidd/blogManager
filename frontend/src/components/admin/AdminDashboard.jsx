import React, { useState } from "react";
import RoleManagement from "./RoleManagement";
import UserManagement from "./UserManagement";
import LogsManagement from "./LogsManagement";
import SessionManagement from "./SessionManagement";
import MetricManagement from "./MetricManagement";
import EmailManagement from "./EmailManagment";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("role-management"); // Default tab

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Change active tab
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* Tab Navigation Bar */}
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "role-management" ? "active" : ""}`}
            id="role-management-tab"
            data-bs-toggle="tab"
            data-bs-target="#role-management"
            type="button"
            role="tab"
            aria-controls="role-management"
            aria-selected={activeTab === "role-management"}
            onClick={() => handleTabChange("role-management")}
          >
            Role Management
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "user-management" ? "active" : ""}`}
            id="user-management-tab"
            data-bs-toggle="tab"
            data-bs-target="#user-management"
            type="button"
            role="tab"
            aria-controls="user-management"
            aria-selected={activeTab === "user-management"}
            onClick={() => handleTabChange("user-management")}
          >
            User Management
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "log-management" ? "active" : ""}`}
            id="log-management-tab"
            data-bs-toggle="tab"
            data-bs-target="#log-management"
            type="button"
            role="tab"
            aria-controls="log-management"
            aria-selected={activeTab === "log-management"}
            onClick={() => handleTabChange("log-management")}
          >
            Logs Management
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "session-management" ? "active" : ""}`}
            id="session-management-tab"
            data-bs-toggle="tab"
            data-bs-target="#session-management"
            type="button"
            role="tab"
            aria-controls="session-management"
            aria-selected={activeTab === "session-management"}
            onClick={() => handleTabChange("session-management")}
          >
            Session Management
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "metrics-management" ? "active" : ""}`}
            id="metrics-management-tab"
            data-bs-toggle="tab"
            data-bs-target="#metrics-management"
            type="button"
            role="tab"
            aria-controls="metrics-management"
            aria-selected={activeTab === "metrics-management"}
            onClick={() => handleTabChange("metrics-management")}
          >
            Metrics Management
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "email-management" ? "active" : ""}`}
            id="email-management-tab"
            data-bs-toggle="tab"
            data-bs-target="#email-management"
            type="button"
            role="tab"
            aria-controls="email-management"
            aria-selected={activeTab === "email-management"}
            onClick={() => handleTabChange("email-management")}
          >
            Email Management
          </button>
        </li>
      </ul>

      {/* Tab Content with Fade Transitions */}
      <div className="tab-content" id="myTabContent">
        <div
          className={`tab-pane fade ${activeTab === "role-management" ? "show active" : ""}`}
          id="role-management"
          role="tabpanel"
          aria-labelledby="role-management-tab"
        >
          {activeTab === "role-management" && <RoleManagement />}
        </div>
        <div
          className={`tab-pane fade ${activeTab === "user-management" ? "show active" : ""}`}
          id="user-management"
          role="tabpanel"
          aria-labelledby="user-management-tab"
        >
          {activeTab === "user-management" && <UserManagement />}
        </div>
        <div
          className={`tab-pane fade ${activeTab === "log-management" ? "show active" : ""}`}
          id="log-management"
          role="tabpanel"
          aria-labelledby="log-management-tab"
        >
          {activeTab === "log-management" && <LogsManagement />}
        </div>
        <div
          className={`tab-pane fade ${activeTab === "session-management" ? "show active" : ""}`}
          id="session-management"
          role="tabpanel"
          aria-labelledby="session-management-tab"
        >
          {activeTab === "session-management" && <SessionManagement />}
        </div>
        <div
          className={`tab-pane fade ${activeTab === "metrics-management" ? "show active" : ""}`}
          id="metrics-management"
          role="tabpanel"
          aria-labelledby="metrics-management-tab"
        >
          {activeTab === "metrics-management" && <MetricManagement />}
        </div>
        <div
          className={`tab-pane fade ${activeTab === "email-management" ? "show active" : ""}`}
          id="email-management"
          role="tabpanel"
          aria-labelledby="email-management-tab"
        >
          {activeTab === "email-management" && <EmailManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
