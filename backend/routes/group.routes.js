const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const groupController = require("../controllers/group.controller");

router.post("/", protect, groupController.createGroup);
router.get("/", groupController.getGroups);
router.post("/seed", protect, groupController.seedGroups);
router.get("/:id", groupController.getGroupById);
router.post("/:id/join", protect, groupController.joinGroup);
router.post("/:id/leave", protect, groupController.leaveGroup);

module.exports = router;
