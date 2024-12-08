const Logs = require("../models/AuditTrail");

// Utility function to log audit trails
const logAuditTrail = async (req, type, details) => {
  // const normalizedIp = req.ip === '::1' ? '127.0.0.1' : req.ip; // Convert if needed.
  // console.log(req.ip);
  
  try {
    await Logs.create({
      userId: req.user.id,
      type,
      details,
      ip: req.ip,
      token: req.token, // Include the token from authMiddleware
      userAgent: req.headers["user-agent"],
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to log audit trail:", error);
  }
};

module.exports = logAuditTrail;
