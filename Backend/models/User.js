const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Role = require("./Role");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1); // Exit if the URI is not found
}
// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//USer Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, default: "NewUser" },
  age: { type: Number, default: 18 },
  location: { type: String, default: "Unknown" },
  image: { type: String, default: "default-profile.jpg" },
  branch: { type: String, default: "General" },
  standard: { type: Number, default: 11 },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  email: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  tokenVersion: { type: Number, default: 0 },
  data: {
    id: { type: Number, required: true, default: 0 },
    name: { type: String, required: true, default: "Default Name" },
    password: { type: String, required: true, default: "123456" },
  },
  fees: {
    paid: { type: Boolean, default: false },
    remaining: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lastDate: { type: Date, default: () => new Date() },
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("data.password")) return next();
  this.data.password = await bcrypt.hash(this.data.password, 10);
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.data.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
