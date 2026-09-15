const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const noteController = require("../controllers/note.controller");

router.post("/", protect, noteController.createNote);
router.get("/", noteController.getNotes);
router.get("/my", protect, noteController.getMyNotes);
router.get("/:id", noteController.getNoteById);
router.post("/:id/download", protect, noteController.downloadNote);
router.get("/:id/summary", noteController.generateSummary);
router.post("/:id/rate", protect, noteController.rateNote);
router.delete("/:id", protect, noteController.deleteNote);

module.exports = router;
