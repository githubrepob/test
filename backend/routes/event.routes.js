const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const eventController = require("../controllers/event.controller");
const eventRegistrationController = require("../controllers/eventRegistration.controller");
const eventCommentController = require("../controllers/eventComment.controller");
const { adminOnly } = require("../middleware/adminMiddleware");

// Event CRUD
router.post("/", protect, eventController.createEvent);
router.get("/", eventController.getAllEvents);
router.get("/trending", eventController.getTrendingEvents);
router.get("/calendar", eventController.getEventsByMonth);
router.get("/my", protect, eventController.getMyEvents);
router.get("/my-registrations", protect, eventController.getMyRegistrations);
router.post("/seed", eventController.seedEvents);

// Single event + interactions
router.get("/:eventId", eventController.getEventById);
router.post("/:eventId/like", protect, eventController.toggleLikeEvent);
router.post("/:eventId/interested", protect, eventController.toggleInterested);
router.post("/:eventId/bookmark", protect, eventController.toggleBookmark);
router.post("/:eventId/register", protect, eventRegistrationController.registerForEvent);
router.delete("/:eventId/register", protect, eventRegistrationController.withdrawFromEvent);
router.get("/:eventId/registrations", protect, eventRegistrationController.getEventRegistrations);
router.post("/:eventId/attend", protect, eventRegistrationController.markAttendance);
router.patch("/:eventId/verify", protect, adminOnly, eventController.verifyEvent);

// Comments
router.get("/:eventId/comments", eventCommentController.getComments);
router.post("/:eventId/comments", protect, eventCommentController.addComment);

module.exports = router;