const Message = require("../models/message");

/**
 * SEND PRIVATE MESSAGE
 */
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, issueId, content } = req.body;

    if (!receiverId || !issueId || !content) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      issue: issueId,
      content
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
