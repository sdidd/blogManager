const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Role = require('./Role')

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

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: Number,
  location: String,
  image: String,
  branch: String,
  standard: Number,
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }, // Link to the Role model
  email: { type: String, required: true, unique: true }, // Add email
  isVerified: { type: Boolean, default: false }, // Add isVerified flag
  data: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // Make password required
  },
  fees: {
    paid: Boolean,
    remaining: Number,
    total: Number,
    lastDate: Date,
  },
});


// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("data.password")) return next(); // Only hash if modified
  this.data.password = await bcrypt.hash(this.data.password, 10);
  next();
});

// Password verification method
userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.data.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

