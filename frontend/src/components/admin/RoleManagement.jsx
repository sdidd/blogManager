import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes, FaUserCircle } from "react-icons/fa"; // Import specific icons from Font Awesome
import API from "../../api";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await API.get("/admin/roles");
        setRoles(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch roles");
      }
    };

    fetchRoles();
  }, []);

  // Add a new role
  // Add a new role
  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError("Role name cannot be empty");
      return;
    }

    try {
      const response = await API.post("/admin/roles", { name: newRole.trim() });
      setRoles([...roles, response.data]);
      setNewRole("");
      setSuccess("Role added successfully!");
      setError(""); // Clear any previous error
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add role");
    }
  };

  // Delete a role
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await API.delete(`/admin/roles/${roleId}`);
      setRoles(roles.filter((role) => role._id !== roleId));
      setSelectedRole(""); // Clear selection if the selected role is deleted
      setSuccess("Role deleted successfully!");
      setError(""); // Clear any previous error
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete role");
    }
  };

  // Add a permission to the selected role
  // Add a permission to the selected role
  const handleAddPermission = async () => {
    if (!selectedRole) {
      setError("Please select a role first");
      return;
    }

    try {
      const response = await API.post(`/admin/roles/${selectedRole}/permissions`, {
        permissions: [newPermission], // Wrap newPermission in an array
      });
      const updatedRole = response.data.role;
      setRoles(roles.map((role) => (role._id === updatedRole._id ? updatedRole : role)));
      setNewPermission("");
      setSuccess("Permission added successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add permission");
    }
  };

  // Remove a permission from the selected role
  const handleRemovePermission = async (permission) => {
    try {
      const response = await API.delete(`/admin/roles/${selectedRole}/permissions`, {
        data: { permissions: [permission] }, // Wrap permission in an array
      });
      const updatedRole = response.data.role;
      setRoles(roles.map((role) => (role._id === updatedRole._id ? updatedRole : role)));
      setSuccess("Permission removed successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove permission");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow">
        <h3 className="text-center mb-4">Role and Permission Management</h3>
        {error && <p className="text-danger">{error}</p>}
        {success && <p className="text-success">{success}</p>}

        {/* Add Role */}
        <div className="mb-4">
          <h4>Add New Role</h4>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Enter new role"
            />
            <button className="btn btn-primary" onClick={handleAddRole}>
              <FaPlus className="me-1" /> Add Role
            </button>
          </div>
        </div>

        {/* Role List */}
        <div className="mb-4">
          <h4>Existing Roles</h4>
          <ul className="list-group">
            {roles.map((role) => (
              <li key={role._id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <FaUserCircle className="me-2 text-primary" />
                  <strong>{role.name}</strong>
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRole(role._id)}>
                  <FaTrash className="me-1" /> Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Select Role */}
        <div className="mb-4">
          <h4>Manage Permissions</h4>
          <select className="form-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">Select a Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Permission */}
        {selectedRole && (
          <>
            <h5>Selected Role Permissions</h5>
            <ul className="list-group mb-3">
              {roles
                .find((role) => role._id === selectedRole)
                ?.permissions.map((permission, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{permission}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemovePermission(permission)}>
                      <FaTimes className="me-1" /> Remove
                    </button>
                  </li>
                ))}
            </ul>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                placeholder="Enter new permission"
              />
              <button className="btn btn-primary" onClick={handleAddPermission}>
                <FaPlus className="me-1" /> Add Permission
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
