const express = require('express');
const os = require('os');
const Metric = require('../../models/Metric');
const cron = require('node-cron');

// Schedule the save task to run every minute
cron.schedule('* * * * *', async () => {
  const cpuUsage = getCPUUsage();
  const memoryUsage = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2);

  try {
    const newMetric = new Metric({ cpuUsage, memoryUsage });
    await newMetric.save();
    // console.log('Metric saved successfully:', { cpuUsage, memoryUsage });
  } catch (err) {
    console.error('Error saving metric:', err);
  }
});


const router = express.Router();

// Function to get CPU Usage
const getCPUUsage = () => {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return ((1 - totalIdle / totalTick) * 100).toFixed(2); // In percentage
};

// API Endpoint: Get Real-Time Metrics
router.get('/realtime', async (req, res) => {
  const cpuUsage = getCPUUsage();
  const memoryUsage = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2);
  
  res.json({ cpuUsage, memoryUsage });
});

// API Endpoint: Get Historical Metrics
router.get('/historical', async (req, res) => {
  try {
    const metrics = await Metric.find().sort({ timestamp: -1 }).limit(100);
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching historical data' });
  }
});

// API Endpoint: Save Metrics (for background collection)
router.post('/save', async (req, res) => {
  const cpuUsage = getCPUUsage();
  const memoryUsage = ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2);

  try {
    const newMetric = new Metric({ cpuUsage, memoryUsage });
    await newMetric.save();
    res.json({ message: 'Metric saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving metric' });
  }
});

module.exports = router;
