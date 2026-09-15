const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const hackathonController = require("../controllers/hackathon.controller");

router.post("/", protect, hackathonController.createHackathon);
router.get("/", hackathonController.getHackathons);
router.get("/my/organized", protect, hackathonController.getMyHackathons);
router.post("/seed", hackathonController.seedHackathons);
router.get("/:id", hackathonController.getHackathonById);
router.post("/:id/interest", protect, hackathonController.toggleInterest);
router.post("/:id/register", protect, hackathonController.registerTeam);
router.delete("/:id/register", protect, hackathonController.withdrawTeam);
router.post("/:id/attend", protect, hackathonController.markAttendance);

module.exports = router;
