const EventComment = require("../models/EventComment");

/**
 * ADD COMMENT
 */
const addComment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text, parentComment } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const comment = await EventComment.create({
      event: eventId,
      user: req.user._id,
      text,
      parentComment: parentComment || null
    });

    return res.status(201).json(comment);

  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET COMMENTS
 */
const getComments = async (req, res) => {
  try {
    const { eventId } = req.params;

    const comments = await EventComment.find({ event: eventId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.json(comments);

  } catch (error) {
    console.error("Get Comments Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  addComment,
  getComments
};