const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const emailUser = require("../utils/emailUtils");
const router = express.Router();
const { generateToken, generateRefreshToken } = require("../utils/jwtUtils");
const authMiddleware = require("../middleware/authMiddleware");
const AuditTrail = require("../models/AuditTrail");
const getRedisClient = require("../utils/redis/redisConfig");
require("dotenv").config();

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

    res.status(201).json({ message: "User registered successfully! Please verify your email." });
  } catch (err) {
    res.status(400).json({ error: "Error registering user", details: err.message });
  }
});

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

    // Log login action
    await AuditTrail.create({
      userId: user._id,
      type: "LOGIN",
      details: `User logged in with email ${username}`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      token,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("[ERROR] Login failed:", err.message);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// Logout Route (Terminate Session)
router.post("/logout", authMiddleware, async (req, res) => {
  const token = req.token;

  try {
    const RedisClient = getRedisClient();

    // Remove session from Redis
    await RedisClient.hDel(`session:${token}`);

    // Blacklist the token to revoke it (add it to the blacklist in Redis)
    await RedisClient.set(`blacklist:${token}`, "true", { EX: parseInt(process.env.JWT_EXPIRATION || "3600", 10) });

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    // Log logout action in AuditTrail
    await AuditTrail.create({
      userId: req.user.id,
      type: "LOGOUT",
      token: token,
      details: "User logged out",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("[ERROR] Logout failed:", err.message);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Token Validation Route (for protected routes)
router.get("/verifyToken", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
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

    res.status(200).json({ token });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token", details: err.message });
  }
});

module.exports = router;
