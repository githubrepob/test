const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const User = require("../models/User");

/**
 * REGISTER FOR EVENT
 */
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendeesCount >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    await EventRegistration.create({
      event: eventId,
      user: req.user._id
    });

    event.attendeesCount += 1;
    await event.save();

    return res.json({ message: "Registered successfully" });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already registered" });
    }

    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * MARK ATTENDANCE
 */
const markAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await EventRegistration.findOne({
      event: eventId,
      user: req.user._id
    });

    if (!registration) {
      return res.status(400).json({ message: "Not registered" });
    }

    if (registration.status === "attended") {
      return res.status(400).json({ message: "Already marked attended" });
    }

    registration.status = "attended";
    await registration.save();

    const event = await Event.findById(eventId);

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { auraPoints: event.auraPointsReward }
    });

    return res.json({
      message: "Attendance marked. AuraPoints added."
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * WITHDRAW FROM EVENT
 */
const withdrawFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registration = await EventRegistration.findOneAndDelete({ event: eventId, user: req.user._id });
    if (!registration) return res.status(404).json({ message: "You are not registered for this event" });

    await Event.findByIdAndUpdate(eventId, { $inc: { attendeesCount: -1 } });
    return res.json({ message: "Registration withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ORGANIZER: LIST REGISTRANTS
 */
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the organizer can view registrants" });
    }
    const registrations = await EventRegistration.find({ event: event._id })
      .populate("user", "name collegeEmail department branch semester profileImage")
      .sort({ createdAt: -1 });
    return res.json({ event: { _id: event._id, title: event.title, capacity: event.capacity }, registrations });
  } catch (error) {
    console.error("Get Registrations Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerForEvent,
  withdrawFromEvent,
  getEventRegistrations,
  markAttendance
};