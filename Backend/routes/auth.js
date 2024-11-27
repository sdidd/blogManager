const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const emailUser = require("../utils/emailUtils");
const router = express.Router();
const { generateToken, verifyToken, generateRefreshToken } = require("../utils/jwtUtils");
require("dotenv").config();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, age, location, image, branch, email, role, data, fees } = req.body;

    // Validate required fields
    if (!data || !data.password || !data.name) {
      return res.status(400).json({ error: "Name and password are required in data object" });
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
      email,
      fees,
      data: { ...data, password: hashedPassword },
    });
    await user.save();

    // Generate verification token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token valid for 1 hour
    );

    // Construct the verification link
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${token}`;

    // Send verification email
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
      return res.status(301).json({ error: "First verify your account with the link in email!!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.data.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user);
    // Generate tokens
    const refreshToken = generateRefreshToken(user);

    // Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Send token in response (you can also send it as a cookie if preferred)
    const message = "Login has been detected on " + new Date() + "please be aware.";
    emailUser(user.email, "Login has been recorded", message);
    res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    res.status(400).json({ error: "Error during login", details: err.message });
  }
});

// Token Validation Route (for protected routes)
router.get("/verifyToken", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

// Email Verification Route
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is missing" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and update the `isVerified` field
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token", details: err.message });
  }
});

// Check if username exists
router.get("/check-username/:username", async (req, res) => {
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
router.get("/check-email/:email", async (req, res) => {
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

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Retrieve refresh token from cookies
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

    // Send new access token
    res.status(200).json({ token });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token", details: err.message });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully!" });
});

module.exports = router;
