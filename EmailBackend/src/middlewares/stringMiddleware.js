require("dotenv").config();

const stringMiddleware = (req, res, next) => {
  const secretKey = req.headers["x-secret-key"]; // Get the secret key from headers
  if (secretKey && secretKey === process.env.REGISTRATION_SECRET) {
    return next(); // Continue to the next middleware or route handler
  }
  return res.status(403).json({ error: "Unauthorized access" });
};

module.exports = stringMiddleware;
