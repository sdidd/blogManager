const mongoose = require("mongoose");

const EmailRecipientSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const EmailRecipient = mongoose.model("EmailRecipient", EmailRecipientSchema);

module.exports = EmailRecipient;
