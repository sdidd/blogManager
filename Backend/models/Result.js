const mongoose = require("mongoose");

// Define the Result Schema
const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String }, // Optional
  date: { type: Date, default: Date.now },
});

// Static method to find results by user ID
resultSchema.statics.findByUser = async function (userId) {
  return this.find({ userId });
};

// Create the Result model
const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
