const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const ic = require("../controllers/internship.controller");

// Internship CRUD
router.post("/", protect, ic.createInternship);
router.get("/", ic.getInternships);
router.get("/my", protect, ic.getMyInternships);
router.get("/my-applications", protect, ic.getMyApplications);
router.post("/seed", ic.seedInternships);
router.post("/fetch-external", ic.fetchExternalInternships);
router.get("/:id", ic.getInternshipById);
router.post("/:id/apply", protect, ic.applyToInternship);
router.post("/:id/apply-external", protect, ic.applyExternally);
router.patch("/:id/applicant-status", protect, ic.updateApplicantStatus);

// Chat
router.get("/chat/list", protect, ic.getMyChats);
router.get("/chat/:chatId", protect, ic.getChatMessages);
router.post("/chat/send", protect, ic.sendChatMessage);

module.exports = router;
