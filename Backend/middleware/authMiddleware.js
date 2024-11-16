// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const authMiddleware = (req, res, next) => {
//   const token = req.cookies?.token;
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized: Please log in first' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user info to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }
// };

// module.exports = ;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    //console.log(decoded);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
