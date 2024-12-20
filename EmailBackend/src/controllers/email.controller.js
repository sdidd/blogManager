const emailQueuePromise = require("../queues/email.queue");
const EmailRecipient = require("../models/emailRecipient.model");
const emailService = require("../services/email.service");
const preprocessUpdatesForEmail  = require("../utils/email.formater");


// Add a new recipient
const addRecipient = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const recipient = await EmailRecipient.create({ email, name });
    res.status(201).json({ message: "Recipient added successfully", recipient });
  } catch (error) {
    console.error("[ERROR] Failed to add recipient:", error);
    res.status(500).json({ error: "Failed to add recipient" });
  }
};

// Get all recipients
const getRecipients = async (req, res) => {
  try {
    const recipients = await EmailRecipient.find();
    res.status(200).json({ recipients });
  } catch (error) {
    console.error("[ERROR] Failed to fetch recipients:", error);
    res.status(500).json({ error: "Failed to fetch recipients" });
  }
};

// Send emails to all recipients
const sendEmails = async (req, res) => {
  try {
    const recipients = await EmailRecipient.find();
    const emails = recipients.map((r) => r.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: "No recipients found" });
    }
    // console.log(req.body.text);
    let emailContent = preprocessUpdatesForEmail(req.body.text);
    // console.log(emailContent);
    
    const emailQueue = await emailQueuePromise;
    // Add email job to the queue
    console.log("[INFO] Putting email in queue!!");
    await emailQueue.add({ to: emails, subject: req.body.subject, html: emailContent});

    // await emailService.sendBulkEmails();

    res.status(200).json({ message: "Emails sent successfully", content: emailContent });
  } catch (error) {
    console.error("[ERROR] Failed to send emails:", error);
    res.status(500).json({ error: "Failed to send emails" });
  }
};

const sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Await the resolved emailQueue
    const emailQueue = await emailQueuePromise;

    // Add email job to the queue
    console.log("[INFO] Putting email in queue!!");
    await emailQueue.add({ to, subject, text });

    return res.status(202).json({ message: "Email is being processed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to queue email" });
  }
};

// Remove a recipient
const removeRecipient = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Recipient ID is required" });
  }

  try {
    const recipient = await EmailRecipient.findByIdAndDelete(id);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }
    res.status(200).json({ message: "Recipient removed successfully" });
  } catch (error) {
    console.error("[ERROR] Failed to remove recipient:", error);
    res.status(500).json({ error: "Failed to remove recipient" });
  }
};


module.exports = {
  addRecipient,
  getRecipients,
  sendEmails,
  sendEmail,
  removeRecipient,
};
