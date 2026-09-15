const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const mlController = require("../controllers/ml.controller");

router.post("/predict-placement", mlController.predictPlacement);
router.get("/search/notes", mlController.searchNotes);
router.get("/search/tech-issues", mlController.searchTechIssues);
router.post("/check-duplicate", mlController.checkDuplicate);
router.post("/research/summarize", mlController.summarizeResearch);
router.post("/interview/evaluate", mlController.evaluateInterview);
router.post("/practice/generate", mlController.generatePracticeQuestions);
router.post("/resume/analyze", mlController.analyzeResume);
router.post("/code/explain-bug", mlController.explainCodeBug);

module.exports = router;
