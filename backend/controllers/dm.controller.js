const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ═══ GET OR CREATE CONVERSATION ═══
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    if (userId === myId.toString()) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    // Find existing conversation
    let conversation = await DirectMessage.findOne({
      participants: { $all: [myId, userId] },
    }).populate("participants", "name profileImage department role");

    if (!conversation) {
      conversation = await DirectMessage.create({
        participants: [myId, userId],
        messages: [],
      });
      conversation = await DirectMessage.findById(conversation._id)
        .populate("participants", "name profileImage department role");
    }

    res.json(conversation);
  } catch (error) {
    console.error("Get/Create Conversation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ GET MY CONVERSATIONS ═══
const getMyConversations = async (req, res) => {
  try {
    const conversations = await DirectMessage.find({
      participants: req.user._id,
    })
      .populate("participants", "name profileImage department role")
      .sort({ "lastMessage.createdAt": -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ SEND MESSAGE ═══
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: "Content required" });

    const conversation = await DirectMessage.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const message = {
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
      createdAt: new Date(),
    };

    conversation.messages.push(message);
    conversation.lastMessage = {
      content: content.trim(),
      sender: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    // Send notification to other participant
    const otherUserId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    const otherUser = await User.findById(otherUserId);
    if (otherUser?.notificationPrefs?.messages !== false) {
      await Notification.create({
        user: otherUserId,
        type: "community",
        title: "New Message",
        message: `${req.user.name}: ${content.substring(0, 50)}...`,
        link: "/messages",
      });
    }

    res.json(message);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ GET MESSAGES ═══
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await DirectMessage.findById(conversationId)
      .populate("messages.sender", "name profileImage")
      .populate("participants", "name profileImage department role");

    if (!conversation) return res.status(404).json({ message: "Not found" });

    if (!conversation.participants.some((p) => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    // Mark messages as read
    conversation.messages.forEach((msg) => {
      if (!msg.readBy.includes(req.user._id)) {
        msg.readBy.push(req.user._id);
      }
    });
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ SEARCH USERS ═══
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { collegeEmail: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } },
      ],
    })
      .select("name profileImage department role bio")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error("Search Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  sendMessage,
  getMessages,
  searchUsers,
};
