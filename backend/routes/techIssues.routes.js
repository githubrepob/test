const express = require("express");
const router = express.Router();

const {
  createTechIssue,
  getAllTechIssues,
  getTechIssueById,
  getCommentsByIssue,
  addCommentToIssue,
  voteHandler,
  acceptAnswer
} = require("../controllers/techIssue.controller");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* ================= PUBLIC ================= */
router.get("/", getAllTechIssues);
router.get("/:id/comments", getCommentsByIssue);
router.get("/:id", getTechIssueById);

/* ================= CREATE ISSUE ================= */
/*
🔥 VERY IMPORTANT ORDER:
1. upload.array()  -> parses multipart
2. protect         -> auth
3. controller      -> uses req.body
*/
router.post(
  "/",
  upload.array("attachments", 5),
  protect,
  createTechIssue
);

/* ================= COMMENTS ================= */
router.post("/:id/comments", protect, addCommentToIssue);

/* ================= VOTES ================= */
router.post("/:id/vote", protect, voteHandler);

/* ================= ACCEPT ================= */
router.patch("/:issueId/accept/:commentId", protect, acceptAnswer);

module.exports = router;
