const mongoose = require("mongoose");

const auditTrailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "LOGIN",
        "SESSION_TERMINATED",
        "TOKEN_REVOKED",
        "ACTION_PERFORMED",
        "LOGOUT",
        "CREATE",
        "VERIFY",
        "UPDATE",
        "DELETE",
        "READ",
        "PERMISSION_CHANGED",
        "ROLE_UPDATED",
        "GET_PERMISSIONS",
        "GET",
        "ERROR",
        "POST",
        "DELETE",
        "PUT",
        "UPDATE",
        "REFRESH_TOKEN",
        "VERIFY_TOKEN"
      ],
      required: true,
      description: "Describes the type of action being logged.",
    },
    details: {
      type: String,
      required: true,
      description: "Additional details about the action or event.",
    },
    ip: {
      type: String,
      default: "Unknown",
      required: true,
      // validate: {
      //   validator: function (v) {
      //     return (
      //       /^(?:\d{1,3}\.){3}\d{1,3}$/.test(v) || // IPv4
      //       /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/.test(v) || // Full IPv6
      //       /^::1$/.test(v) || // IPv6 shorthand localhost
      //       v === "Unknown" // Allow default value
      //     );
      //   },
      //   message: (props) => `${props.value} is not a valid IP address!`,
      // },
    },
    token: {
      type: String,
      required: true,
      description: "Stores the token associated with the action (if applicable).",
    },
    userAgent: {
      type: String,
      default: "Unknown",
      description: "Details of the user's device or browser.",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      description: "Optional field for storing additional key-value pairs related to the log.",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      description: "The timestamp when the action occurred.",
    },
  },
  {
    collection: "audit_trail",
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditTrail", auditTrailSchema);
