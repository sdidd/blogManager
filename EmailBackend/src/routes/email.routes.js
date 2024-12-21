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
const sessionMiddleware = require('../middlewares/sessionMiddleware');
const stringMiddleware  = require('../middlewares/stringMiddleware');

router.post('/send',stringMiddleware, sendEmail);
router.post("/add-recipient", authMiddleware,sessionMiddleware, addRecipient);
router.get("/recipients", authMiddleware,sessionMiddleware, getRecipients);
router.post("/send-emails", authMiddleware,sessionMiddleware, sendEmails);
router.delete("/remove-recipient/:id", authMiddleware,sessionMiddleware, removeRecipient); // New route for removing recipient

module.exports = router;
