import React from "react"; import { Link, NavLink, Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* Tab Navigation Bar */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <NavLink to="role-management" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Role Management
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="user-management" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            User Management
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="settings" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Settings
          </NavLink>
        </li>
        {/* Add more links as needed */}
      </ul>

      {/* Outlet for rendering child components */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
