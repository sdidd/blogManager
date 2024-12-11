const mongoose = require('mongoose');

// MongoDB Schema for Metrics
const metricSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  cpuUsage: Number,
  memoryUsage: Number,
});

const Metric = mongoose.model("Metric", metricSchema);

module.exports = Metric;