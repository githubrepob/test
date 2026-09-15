const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const dm = require("../controllers/dm.controller");

router.get("/conversations", protect, dm.getMyConversations);
router.get("/conversation/:userId", protect, dm.getOrCreateConversation);
router.get("/:conversationId/messages", protect, dm.getMessages);
router.post("/:conversationId/send", protect, dm.sendMessage);
router.get("/search-users", protect, dm.searchUsers);

module.exports = router;
