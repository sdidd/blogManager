const mongoose = require("mongoose");
const auditTrailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    type: {
      type: String,
      enum: ["LOGIN", "SESSION_TERMINATED", "TOKEN_REVOKED", "ACTION_PERFORMED", "LOGOUT"],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    ip: {
      type: String, // Stores the IP address of the user
      default: "Unknown",
    },
    token: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String, // Optionally store the user's browser or device info
      default: "Unknown",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "audit_trail", // Optional: define the collection name
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

module.exports = mongoose.model("AuditTrail", auditTrailSchema);
