const nodemailer = require("nodemailer");

module.exports = emailUser = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "127.0.0.1",
      port: process.env.SMTP_PORT || 1025,
      secure: process.env.SMTP_SECURE === "true", // Use TLS only in production
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });

    const mailOptions = {
      from: "test@local.dev",
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.log(error);
  }
};
