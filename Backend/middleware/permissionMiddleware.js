const User = require("../models/User");const permissionMiddleware =
  (requiredPermissions = []) =>
  async (req, res, next) => {
    try {
      // console.log(req.user);

      const userID = req.user.id; // Get user ID
      //console.log(userPerms);
      if (!userID) {
        return res.status(402).json({ error: "User id is not in the request" });
      }

      // Fetch user with their roles and permissions
      const user = await User.findById(userID).populate("role"); // Assuming roles are referenced
      // console.log(user);

      if (!user) {
        return res.status(403).json({ error: "Forbidden: User not found" });
      }
      // Aggregate all permissions from user's roles
      const userPerms = user.role.permissions;

      // Check if all required permissions are included in user's permissions
      const hasAllPermissions = requiredPermissions.every((permission) => userPerms.includes(permission));

      if (!hasAllPermissions) {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }
      next(); // User has permission
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  };

module.exports = permissionMiddleware;
