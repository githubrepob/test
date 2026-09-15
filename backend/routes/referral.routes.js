const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const rc = require("../controllers/referral.controller");

// Referral CRUD
router.post("/", protect, rc.createReferral);
router.get("/", rc.getReferrals);
router.get("/my", protect, rc.getMyReferrals);
router.get("/:id", rc.getReferralById);
router.put("/:id", protect, rc.updateReferral);
router.delete("/:id", protect, rc.deleteReferral);

// Requests
router.post("/:id/request", protect, rc.sendRequest);
router.patch("/:id/respond", protect, rc.respondToRequest);

// Provider-initiated chat
router.post("/chat/initiate", protect, rc.initiateChat);

// Chat
router.get("/chat/list", protect, rc.getMyReferralChats);
router.get("/chat/:chatId", protect, rc.getReferralChatMessages);
router.post("/chat/send", protect, rc.sendReferralChatMessage);

module.exports = router;
