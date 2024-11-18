const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const roleMiddleware = require('../middleware/roleMiddleware');
const bcrypt = require('bcrypt');
const router = express.Router();
require('dotenv').config();

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role.name, permissions: user.role.permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach decoded user info to request object
    next();
  });
};

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, age, location, image, branch, role, data, fees } = req.body;

    // Validate required fields
    if (!data || !data.password || !data.name) {
      return res.status(400).json({ error: 'Name and password are required in data object' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User({
      username,
      age,
      location,
      image,
      branch,
      role,
      fees,
      data: { ...data, password: hashedPassword },
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Error registering user', details: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username }).populate('role');

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.data.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user);

    // Send token in response (you can also send it as a cookie if preferred)
    res.status(200).json({ message: 'Login successful!', token });
  } catch (err) {
    res.status(400).json({ error: 'Error during login', details: err.message });
  }
});

// Token Validation Route (for protected routes)
router.get('/verifyToken', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});

// Check if username exists
router.get('/check-username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(200).json({ message: "Username available" });
  } catch (err) {
    res.status(500).json({ error: "Error checking username" });
  }
});

// Check if email exists
router.get('/check-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ "data.email": req.params.email });
    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(200).json({ message: "Email available" });
  } catch (err) {
    res.status(500).json({ error: "Error checking email" });
  }
});


// Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully!' });
});

module.exports = router;
