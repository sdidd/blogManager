const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.cookies.refreshToken;
  //console.log("Refresh Token:", refreshToken); // Logging the refreshToken for debugging

  // If neither the Bearer token nor the refreshToken is provided
  if (!authHeader && !refreshToken) {
    return res.status(401).json({ error: "Unauthorized access: no token or refreshToken" });
  }

  // If there's no Bearer token, but a refreshToken is present
  if (!authHeader && refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      req.user = decoded; // Attach user info to request
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  } 
  // If there's a Bearer token in the Authorization header
  else if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to request
      req.token = token; // Attach token to request
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }
};

module.exports = authMiddleware;

