const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], required: true }, // List of permissions like "read:dashboard", "edit:profile"
});

module.exports = mongoose.model('Role', roleSchema);