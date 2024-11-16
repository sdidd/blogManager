import React, { useState, useEffect } from 'react';
import API from '../../api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPermission, setNewPermission] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await API.get('/admin/roles');
        setRoles(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch roles');
      }
    };

    fetchRoles();
  }, []);

  // Add a new role
// Add a new role
const handleAddRole = async () => {
  if (!newRole.trim()) {
    setError('Role name cannot be empty');
    return;
  }

  try {
    const response = await API.post('/admin/roles', { name: newRole.trim() });
    setRoles([...roles, response.data]);
    setNewRole('');
    setSuccess('Role added successfully!');
    setError(''); // Clear any previous error
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to add role');
  }
};

// Delete a role
const handleDeleteRole = async (roleId) => {
  if (!window.confirm('Are you sure you want to delete this role?')) {
    return;
  }

  try {
    await API.delete(`/admin/roles/${roleId}`);
    setRoles(roles.filter((role) => role._id !== roleId));
    setSelectedRole(''); // Clear selection if the selected role is deleted
    setSuccess('Role deleted successfully!');
    setError(''); // Clear any previous error
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to delete role');
  }
};


  // Add a permission to the selected role
// Add a permission to the selected role
const handleAddPermission = async () => {
  if (!selectedRole) {
    setError('Please select a role first');
    return;
  }

  try {
    const response = await API.post(`/admin/roles/${selectedRole}/permissions`, {
      permissions: [newPermission], // Wrap newPermission in an array
    });
    const updatedRole = response.data.role;
    setRoles(
      roles.map((role) => (role._id === updatedRole._id ? updatedRole : role))
    );
    setNewPermission('');
    setSuccess('Permission added successfully!');
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to add permission');
  }
};

// Remove a permission from the selected role
const handleRemovePermission = async (permission) => {
  try {
    const response = await API.delete(
      `/admin/roles/${selectedRole}/permissions`,
      {
        data: { permissions: [permission] }, // Wrap permission in an array
      }
    );
    const updatedRole = response.data.role;
    setRoles(
      roles.map((role) => (role._id === updatedRole._id ? updatedRole : role))
    );
    setSuccess('Permission removed successfully!');
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to remove permission');
  }
};


  return (
    <div>
      <h3>Role and Permission Management</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Add Role */}
      <div>
        <h4>Add New Role</h4>
        <input
          type="text"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="Enter new role"
        />
        <button onClick={handleAddRole}>Add Role</button>
      </div>

      {/* Role List */}
      <div>
        <h4>Existing Roles</h4>
        <ul>
          {roles.map((role) => (
            <li key={role._id}>
              <strong>{role.name}</strong>
              <button onClick={() => handleDeleteRole(role._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Select Role */}
      <div>
        <h4>Manage Permissions</h4>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
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
          <ul>
            {roles
              .find((role) => role._id === selectedRole)
              ?.permissions.map((permission, index) => (
                <li key={index}>
                  {permission}{' '}
                  <button onClick={() => handleRemovePermission(permission)}>
                    Remove
                  </button>
                </li>
              ))}
          </ul>
          <input
            type="text"
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            placeholder="Enter new permission"
          />
          <button onClick={handleAddPermission}>Add Permission</button>
        </>
      )}
    </div>
  );
};

export default RoleManagement;
