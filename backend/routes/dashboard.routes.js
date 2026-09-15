const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const dc = require("../controllers/dashboard.controller");

// Dashboard
router.get("/", protect, dc.getDashboardData);
router.put("/coding-stats", protect, dc.updateCodingStats);
router.post("/sync-coding-profile", protect, dc.syncCodingProfile);
router.put("/academic-stats", protect, dc.updateAcademicStats);
router.put("/profile", protect, dc.updateProfile);
router.put("/notification-prefs", protect, dc.updateNotificationPrefs);
router.get("/company-readiness", protect, dc.getCompanyReadiness);
router.get("/placement-prediction", protect, dc.getPlacementPrediction);

// Public profile
router.get("/user/:userId", dc.getUserPublicProfile);

// Personal Notes
router.get("/notes", protect, dc.getPersonalNotes);
router.post("/notes", protect, dc.createPersonalNote);
router.put("/notes/:id", protect, dc.updatePersonalNote);
router.delete("/notes/:id", protect, dc.deletePersonalNote);

module.exports = router;
