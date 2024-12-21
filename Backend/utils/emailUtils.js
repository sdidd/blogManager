const emailAPI = require("./api");

module.exports = emailUser = async (to, subject, text) => {
  try {
    const response = await emailAPI.post(
      "/api/email/send",
      { to, subject, text },
      {
        headers: {
          "x-secret-key": process.env.REGISTRATION_SECRET, // Add the header
        },
      }
    );
    console.log(`Email sent successfully: ${response.data.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};
