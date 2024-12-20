import React, { useEffect, useState } from "react";
import API from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); // For filtering users by role

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    // Filter users when selectedRole changes
    if (selectedRole) {
      setFilteredUsers(users.filter(user => user.role?._id === selectedRole));
    } else {
      setFilteredUsers(users);
    }
  }, [selectedRole, users]);

  const fetchUsers = async () => {
    try {
      const response = await API.get("/admin/users");
      setUsers(response.data?.users || []);
      setFilteredUsers(response.data?.users || []); // Set filtered users on fetch
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await API.get("/admin/roles");
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleRoleChange = async (roleId) => {
    try {
      await API.put(`/admin/users/${selectedUser._id}/role`, { roleId });
      alert("Role updated successfully");
      fetchUsers();
      setSelectedUser(null); // Close modal
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.trim().length < 6) {
      return alert("Password must be at least 6 characters long");
    }

    try {
      await API.post(`/admin/users/${selectedUser._id}/reset-password`, { newPassword });
      alert("Password reset successfully");
      setNewPassword("");
      setSelectedUser(null); // Close modal
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await API.delete(`/admin/users/${userId}`);
      alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const renderUserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit User</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedUser(null)}
              ></button>
            </div>
            <div className="modal-body">
              <p><strong>Username:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Branch:</strong> {selectedUser.branch}</p>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-select"
                  value={selectedUser.role?._id || ""}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="" disabled>Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => handleDeleteUser(selectedUser._id)}>Delete User</button>
              <button className="btn btn-warning" onClick={handleResetPassword}>Reset Password</button>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-5">
      <h1>User Management</h1>
      
      {/* Filter by Role Dropdown */}
      <div className="mb-4">
        <label htmlFor="roleFilter" className="form-label">Filter by Role</label>
        <select
          id="roleFilter"
          className="form-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>{role.name}</option>
          ))}
        </select>
      </div>

      <div className="row">
        {filteredUsers.map((user) => (
          <div className="col-md-4 mb-4" key={user._id}>
            <div className="card" onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
              <img
                src={user.image || "default-profile.jpg"}
                className="card-img-top"
                alt={user.username}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{user.username}</h5>
                <p className="card-text">{user.email}</p>
                <p className="card-text"><strong>Role:</strong> {user.role?.name || "No Role"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {renderUserModal()}
    </div>
  );
};

export default UserManagement;
