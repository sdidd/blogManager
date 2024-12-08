const roleMiddleware =
  (requiredRoles = []) =>
  async (req, res, next) => {
    try {
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
      const userRole = user.role.name;
      if(!userRole) {
        return res.status(401).json({error: "Unknown: User not Found"});
      }
      
      if (requiredRoles.includes(userRole)) {
        // If the user's role is in the requiredRoles array, proceed
        return next();
      } else {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  };

module.exports = roleMiddleware;
