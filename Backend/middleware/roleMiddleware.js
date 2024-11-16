const roleMiddleware = (requiredRoles = []) => async (req, res, next) => {
  try {
    const userRole = req.user.role; // Role from JWT payload or request
    if (requiredRoles.includes(userRole)) {
      // If the user's role is in the requiredRoles array, proceed
      return next();
    } else {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

module.exports = roleMiddleware;
