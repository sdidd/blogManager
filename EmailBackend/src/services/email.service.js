const nodemailer = require("nodemailer");const logger = require("../utils/logger");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error("Failed to send email:", error);
      throw error;
    }
  }

  // Send bulk emails
  async sendBulkEmails(emails, subject, html) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("[INFO] Emails sent successfully");
    } catch (error) {
      console.error("[ERROR] Failed to send emails:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
