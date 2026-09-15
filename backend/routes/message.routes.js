const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const messageController = require("../controllers/message.controller");

// SEND MESSAGE
router.post("/", protect, messageController.sendMessage);

module.exports = router;
