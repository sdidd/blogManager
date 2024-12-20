const rateLimit = require("express-rate-limit");

const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many requests, please try again later.",
});

module.exports = emailLimiter;
