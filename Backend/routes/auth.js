const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const emailUser = require("../utils/emailUtils");
const router = express.Router();
const { generateToken, generateRefreshToken } = require("../utils/jwtUtils");
const authMiddleware = require("../middleware/authMiddleware");
const getRedisClient = require("../utils/redis/redisConfig");
const logAuditTrail = require("../utils/logUtils");
const Logs = require('../models/AuditTrail')
require("dotenv").config();

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username }).populate("role");

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your account via email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.data.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store session in Redis (using hash)
    const RedisClient = getRedisClient();
    const sessionData = {
      userId: user._id,
      timestamp: Date.now(),
    };

    const sessionDataStr = JSON.stringify(sessionData);

    await RedisClient.hSet(`session:${token}`, "data", sessionDataStr);
    await RedisClient.expire(`session:${token}`, parseInt(process.env.JWT_EXPIRATION || "3600", 10));

    // Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Manually log login action
    const logData = {
      userId: user._id,
      action: "LOGIN",
      ip: req.ip,  // Manually pass the IP address
      type: "LOGIN",
      token: token,
      details: `User logged in with username ${user.username}`,
    };
    await Logs.create(logData);

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("[ERROR] Login failed:", err.message);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, age, location, image, branch, email, role, data, fees } = req.body;

    // Validate required fields
    if (!data || !data.password || !data.name) {
      return res.status(400).json({ error: "Name and password are required in data object" });
    }

    const user = new User({
      username,
      age,
      location,
      image,
      branch,
      role,
      email,
      fees,
      data: { ...data },
    });
    await user.save();

    // Generate verification token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    await emailUser(
      user.email,
      "Email Verification",
      `Please verify your email by clicking the link: ${verificationLink}`
    );

    // Manually log registration action
    const logData = {
      userId: user._id,
      action: "REGISTER",
      ip: req.ip,  // Manually pass the IP address
      details: `User registered with email ${user.email}`,
    };
    await Logs.create(logData);

    res.status(201).json({ message: "User registered successfully! Please verify your email." });
  } catch (err) {
    console.error("[ERROR] Registration failed:", err.message);
    res.status(400).json({ error: "Error registering user", details: err.message });
  }
});

// Logout Route (Terminate Session)
router.post("/logout", authMiddleware, async (req, res) => {
  const token = req.token; // Extract the token from the request
  const redisClient = getRedisClient(); // Ensure you have a function to get the Redis client

  try {
    // Remove session data from Redis (hash key)
    const redisKey = `session:${token}`;
    const sessionExists = await redisClient.exists(redisKey);
    if (sessionExists) {
      await redisClient.del(redisKey); // Delete the entire hash key
      console.log(`[INFO] Session removed for token: ${token}`);
    } else {
      console.warn(`[WARN] No session found for token: ${token}`);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    // Log logout action
    await logAuditTrail(req, "LOGOUT", `User logged out and session terminated`);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("[ERROR] Logout failed:", err.message);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Token Validation Route (for protected routes)
router.get("/verifyToken", authMiddleware, async (req, res) => {
  try {
    // Log token verification action
    await logAuditTrail(req, "VERIFY_TOKEN", `User token verified`);

    res.status(200).json({ message: "Token is valid", user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Token verification failed", details: err.message });
  }
});

// Get User Permissions Route
router.get("/getPermissions", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract permissions from the user's role
    const permissions = user.role?.permissions || [];

    // Log permission check action
    await logAuditTrail(req, "GET_PERMISSIONS", `User checked permissions`);

    res.status(200).json({ permissions });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Refresh Token Route
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if tokenVersion is still valid
    const user = await User.findById(payload.id).populate("role");
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new tokens
    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Send new refresh token as HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    req.user.id = payload.id;
    // Log refresh token action
    await logAuditTrail(req, "REFRESH_TOKEN", `User refreshed tokens`);

    res.status(200).json({ token });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token", details: err.message });
  }
});

module.exports = router;
