const Bull = require("bull");
const emailService = require("../services/email.service");
const logger = require("../utils/logger");
const { getRedisConfig, waitForRedisReady } = require("../config/redis.config");

let emailQueue;

const initializeEmailQueue = async () => {
  await waitForRedisReady();
  const redisConfig = getRedisConfig();

  emailQueue = new Bull("email-queue", {
    redis: {
      host: redisConfig.host,
      port: redisConfig.port,
    },
  });

  console.log(`[INFO] Bull email queue initialized using Redis at ${redisConfig.host}:${redisConfig.port}`);

  // Process the queue
  emailQueue.process(async (job) => {
    console.log("Processing job:", job.id);
    const { to, subject, html } = job.data;
    try {
      await emailService.sendEmail(to, subject, html);
      console.log(`Email sent to ${to}`);
      return Promise.resolve(); // Simulate a successful job
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error; // Ensure the job is marked as failed
    }
  });

  emailQueue.on("progress", (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% complete`);
  });

  emailQueue.on("stalled", (job) => {
    logger.warn(`Job ${job.id} has stalled!`);
  });

  emailQueue.on("completed", (job) => {
    logger.info(`Email job ${job.id} completed`);
  });

  emailQueue.on("failed", (job, err) => {
    logger.error(`Email job ${job.id} failed:`, err);
  });

  return emailQueue;
};

// Export a promise that resolves to the emailQueue
module.exports = (async () => {
  if (!emailQueue) {
    emailQueue = await initializeEmailQueue();
  }
  return emailQueue;
})();
