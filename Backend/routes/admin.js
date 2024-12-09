const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const { body, param, validationResult } = require("express-validator");
const roles = require("../models/roles");
const User = require("../models/User");
const Result = require("../models/Result");
const Logs = require("../models/AuditTrail");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const logAuditTrail = require("../utils/logUtils");

const router = express.Router();

router.get("/roles", authMiddleware, permissionMiddleware(["get:roles"]), async (req, res) => {
  try {
    const roles = await Role.find({});
    await logAuditTrail(req, "GET", "/roles", "Fetched roles list");
    res.status(200).send(roles);
  } catch (error) {
    await logAuditTrail(req, "ERROR", "/roles", error.message);
    res.status(400).send("[Error]" + error);
  }
});

router.post(
  "/roles/:roleId/permissions",
  authMiddleware,
  permissionMiddleware(["manage:permissions"]),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: "Permissions must be an array" });
      }

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Add only new permissions
      role.permissions.push(...permissions.filter((p) => !role.permissions.includes(p)));
      await role.save();

      await logAuditTrail(req, "POST", `/roles/${roleId}/permissions`, "Added permissions to role");
      res.json({ message: "Permissions added successfully", role });
    } catch (err) {
      await logAuditTrail(req, "ERROR", `/roles/${roleId}/permissions`, err.message);
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }
);

// Delete permission
router.delete(
  "/roles/:roleId/permissions",
  authMiddleware,
  permissionMiddleware(["manage:permissions"]),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: "Permissions must be an array" });
      }

      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Remove specified permissions
      role.permissions = role.permissions.filter((p) => !permissions.includes(p));
      await role.save();

      await logAuditTrail(req, "DELETE", `/roles/${roleId}/permissions`, "Removed permissions from role");
      res.json({ message: "Permissions removed successfully", role });
    } catch (err) {
      await logAuditTrail(req, "ERROR", `/roles/${roleId}/permissions`, err.message);
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }
);

router.post(
  "/roles",
  authMiddleware,
  permissionMiddleware(["manage:roles"]),
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Role name cannot be empty")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Role name contains invalid characters")
    .custom(async (name) => {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        throw new Error("Role name already exists");
      }
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors
          .array()
          .map((e) => e.msg)
          .join(", "),
      });
    }

    try {
      const { name } = req.body;
      const newRole = new Role({ name, permissions: [] });
      await newRole.save();

      await logAuditTrail(req, "POST", "/roles", `Created new role: ${name}`);
      res.status(201).json(newRole);
    } catch (err) {
      await logAuditTrail(req, "ERROR", "/roles", err.message);
      res.status(500).json({ error: "Failed to add role", details: err.message });
    }
  }
);

// Delete a role
router.delete(
  "/roles/:roleId",
  authMiddleware,
  permissionMiddleware(["manage:roles"]),
  param("roleId").isMongoId().withMessage("Invalid Role ID"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors
          .array()
          .map((e) => e.msg)
          .join(", "),
      });
    }

    try {
      const { roleId } = req.params;

      // Check if the role is in use
      const usersWithRole = await User.find({ role: roleId });
      if (usersWithRole.length > 0) {
        return res.status(400).json({ error: "Cannot delete a role that is assigned to users" });
      }

      const deletedRole = await Role.findByIdAndDelete(roleId);
      if (!deletedRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      await logAuditTrail(req, "DELETE", `/roles/${roleId}`, "Deleted role");
      res.status(200).json({ message: "Role deleted successfully" });
    } catch (err) {
      await logAuditTrail(req, "ERROR", `/roles/${roleId}`, err.message);
      res.status(500).json({ error: "Failed to delete role", details: err.message });
    }
  }
);

/**
 * GET /api/admin/users
 * Fetch all users
 */
router.get("/users", authMiddleware, permissionMiddleware(["manage:users"]), async (req, res) => {
  try {
    const users = await User.find({}).populate("role");

    await logAuditTrail(req, "GET", "/users", "Fetched all users");
    res.status(200).json({ success: true, users });
  } catch (error) {
    await logAuditTrail(req, "ERROR", "/users", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

/**
 * PUT /api/admin/users/:userId/role
 * Update user role
 */
router.put("/users/:userId/role", authMiddleware, permissionMiddleware(["manage:users"]), async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ success: false, error: "Role ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.role = roleId;
    await user.save();

    await logAuditTrail(req, "PUT", `/users/${userId}/role`, `Updated role for user: ${userId}`);
    res.status(200).json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    await logAuditTrail(req, "ERROR", `/users/${userId}/role`, error.message);
    res.status(500).json({ success: false, error: "Failed to update user role" });
  }
});

/**
 * POST /api/admin/users/:userId/reset-password
 * Reset user password
 */
router.post(
  "/users/:userId/reset-password",
  authMiddleware,
  permissionMiddleware(["manage:users"]),
  async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      user.data.password = newPassword;
      await user.save();

      await logAuditTrail(req, "POST", `/users/${userId}/reset-password`, `Reset password for user: ${userId}`);
      res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      await logAuditTrail(req, "ERROR", `/users/${userId}/reset-password`, error.message);
      res.status(500).json({ success: false, error: "Failed to reset password" });
    }
  }
);

// Fetch all logs
router.get("/logs", authMiddleware, permissionMiddleware(["manage:logs"]), async (req, res) => {
  try {
    const logs = await Logs.find({});
    res.status(200).json({ logs });
    await logAuditTrail(req, "READ", "Fetched all logs");
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs", details: error.message });
  }
});

// Delete logs
router.delete("/logs", authMiddleware, permissionMiddleware(["manage:logs"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No logs selected for deletion" });
    }

    await Logs.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Logs deleted successfully" });
    await logAuditTrail(req, "DELETE", `Deleted logs with IDs: ${ids.join(", ")}`);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete logs", details: error.message });
  }
});

module.exports = router;
