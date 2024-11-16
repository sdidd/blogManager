const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const { body, param, validationResult } = require("express-validator");
const roles = require("../models/roles");
const User = require("../models/User");
const Result = require("../models/Result");
const Role = require("../models/Role");

const router = express.Router();

router.get("/roles", authMiddleware, permissionMiddleware(["get:roles"]), async (req, res) => {
  try {
    const roles = await Role.find({});
    res.status(200).send(roles);
  } catch (error) {
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

      res.json({ message: "Permissions added successfully", role });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }
);

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

      res.json({ message: "Permissions removed successfully", role });
    } catch (err) {
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
      res.status(201).json(newRole);
    } catch (err) {
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

      res.status(200).json({ message: "Role deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete role", details: err.message });
    }
  }
);

module.exports = router;
