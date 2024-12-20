const express = require("express");
const router = express.Router();
const {
  addRecipient,
  getRecipients,
  sendEmails,
  sendEmail,
  removeRecipient // Add the new route here
} = require("../controllers/email.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/send', authMiddleware, sendEmail);
router.post("/add-recipient", authMiddleware, addRecipient);
router.get("/recipients", authMiddleware, getRecipients);
router.post("/send-emails", authMiddleware, sendEmails);
router.delete("/remove-recipient/:id", authMiddleware, removeRecipient); // New route for removing recipient

module.exports = router;
