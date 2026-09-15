const Referral = require("../models/Referral");
const ReferralChat = require("../models/ReferralChat");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ═══════════════════════════════════════════════════════════════
// CREATE REFERRAL POST (seeker or provider)
// ═══════════════════════════════════════════════════════════════
const createReferral = async (req, res) => {
  try {
    const {
      type, domain, skills, bio, resumeUrl, targetCompanies,
      experience, pitch, linkedinUrl, portfolioUrl,
      company, position, referralDomains, availability, maxReferrals,
    } = req.body;

    if (!type || !domain) {
      return res.status(400).json({ message: "Type and domain are required" });
    }

    // Check for existing active referral of same type
    const existing = await Referral.findOne({
      user: req.user._id,
      type,
      status: "active",
    });
    if (existing) {
      return res.status(400).json({
        message: `You already have an active ${type} profile. Deactivate it first or edit it.`,
      });
    }

    const referral = await Referral.create({
      type,
      user: req.user._id,
      domain,
      skills: skills || [],
      bio: bio || "",
      resumeUrl: resumeUrl || "",
      targetCompanies: targetCompanies || [],
      experience: experience || "Fresher",
      pitch: pitch || "",
      linkedinUrl: linkedinUrl || "",
      portfolioUrl: portfolioUrl || "",
      company: company || "",
      position: position || "",
      referralDomains: referralDomains || [],
      availability: availability || "open",
      maxReferrals: maxReferrals || 5,
    });

    res.status(201).json({ message: `Referral ${type} profile created!`, referral });
  } catch (error) {
    console.error("Create Referral Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET ALL REFERRALS (with filtering)
// ═══════════════════════════════════════════════════════════════
const getReferrals = async (req, res) => {
  try {
    const { type, domain, search, page = 1, limit = 20 } = req.query;

    const filter = { status: "active" };
    if (type) filter.type = type;
    if (domain && domain !== "All") filter.domain = { $regex: domain, $options: "i" };
    if (search) {
      filter.$or = [
        { domain: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { pitch: { $regex: search, $options: "i" } },
      ];
    }

    const referrals = await Referral.find(filter)
      .populate("user", "name profileImage department role yearOfStudy skills bio graduationYear")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Referral.countDocuments(filter);
    const seekerCount = await Referral.countDocuments({ ...filter, type: "seeker" });
    const providerCount = await Referral.countDocuments({ ...filter, type: "provider" });

    res.json({ referrals, total, seekerCount, providerCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get Referrals Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET SINGLE REFERRAL
// ═══════════════════════════════════════════════════════════════
const getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate("user", "name profileImage department role yearOfStudy skills bio graduationYear")
      .populate("requests.from", "name profileImage department role");
    if (!referral) return res.status(404).json({ message: "Referral not found" });
    res.json(referral);
  } catch (error) {
    console.error("Get Referral Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET MY REFERRALS
// ═══════════════════════════════════════════════════════════════
const getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ user: req.user._id })
      .populate("requests.from", "name profileImage department role skills")
      .sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    console.error("My Referrals Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// SEND REQUEST (reach out to someone)
// ═══════════════════════════════════════════════════════════════
const sendRequest = async (req, res) => {
  try {
    const { message, myReferralId } = req.body;
    const targetReferral = await Referral.findById(req.params.id);
    if (!targetReferral) return res.status(404).json({ message: "Referral not found" });

    if (targetReferral.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot request your own referral" });
    }

    // Check if already requested
    const alreadyRequested = targetReferral.requests.some(
      (r) => r.from.toString() === req.user._id.toString()
    );
    if (alreadyRequested) {
      return res.status(400).json({ message: "You've already sent a request" });
    }

    targetReferral.requests.push({
      from: req.user._id,
      referralId: myReferralId || null,
      message: message || "",
      status: "pending",
    });
    await targetReferral.save();

    // Notify the target user
    const typeLabel = targetReferral.type === "provider" ? "referral" : "connection";
    await Notification.create({
      user: targetReferral.user,
      type: "referral",
      title: `🤝 New ${typeLabel} request!`,
      message: `${req.user.name} wants to connect with you${targetReferral.type === "provider" ? ` for a referral at ${targetReferral.company}` : ""}`,
      link: `/careers/referrals`,
      metadata: {
        referralId: targetReferral._id,
        fromUserId: req.user._id,
      },
    });

    res.json({ message: "Request sent!" });
  } catch (error) {
    console.error("Send Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// RESPOND TO REQUEST (accept / reject)
// ═══════════════════════════════════════════════════════════════
const respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: "accepted" | "rejected"
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: "Referral not found" });

    // Verify owner
    if (referral.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the owner can respond to requests" });
    }

    const request = referral.requests.id(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = action;
    await referral.save();

    // If accepted, create a chat
    if (action === "accepted") {
      const seekerId = referral.type === "seeker" ? referral.user : request.from;
      const providerId = referral.type === "provider" ? referral.user : request.from;

      // Check for existing chat
      let chat = await ReferralChat.findOne({
        seeker: seekerId,
        provider: providerId,
      });

      if (!chat) {
        const systemMessage = `🎉 Referral connection established! You can now discuss the referral opportunity.`;
        chat = await ReferralChat.create({
          referral: referral._id,
          seeker: seekerId,
          provider: providerId,
          participants: [seekerId, providerId],
          messages: [
            {
              sender: req.user._id,
              content: systemMessage,
              type: "system",
              readBy: [req.user._id],
            },
          ],
          lastMessage: {
            content: systemMessage,
            sender: req.user._id,
            createdAt: new Date(),
          },
        });
      }

      // Update provider stats
      if (referral.type === "provider") {
        referral.referralsGiven += 1;
        if (referral.referralsGiven >= referral.maxReferrals) {
          referral.availability = "closed";
        }
        await referral.save();
      }

      // Notify the requester
      await Notification.create({
        user: request.from,
        type: "referral",
        title: "✅ Request Accepted!",
        message: `${req.user.name} accepted your referral request. You can now chat!`,
        link: `/careers/referrals`,
        metadata: {
          referralId: referral._id,
          chatId: chat._id,
        },
      });
    } else {
      // Notify rejection
      await Notification.create({
        user: request.from,
        type: "referral",
        title: "📋 Request Update",
        message: `Your referral request was not accepted at this time.`,
        link: `/careers/referrals`,
      });
    }

    res.json({ message: `Request ${action}` });
  } catch (error) {
    console.error("Respond to Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// PROVIDER INITIATES CHAT WITH A SEEKER (provider likes a seeker's profile)
// ═══════════════════════════════════════════════════════════════
const initiateChat = async (req, res) => {
  try {
    const { seekerReferralId, message } = req.body;
    const seekerReferral = await Referral.findById(seekerReferralId);
    if (!seekerReferral) return res.status(404).json({ message: "Seeker profile not found" });

    if (seekerReferral.type !== "seeker") {
      return res.status(400).json({ message: "Can only initiate chat with seekers" });
    }

    const seekerId = seekerReferral.user;
    const providerId = req.user._id;

    if (seekerId.toString() === providerId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check existing chat
    let chat = await ReferralChat.findOne({ seeker: seekerId, provider: providerId });

    if (!chat) {
      const systemMsg = `${req.user.name} wants to offer you a referral opportunity!`;
      chat = await ReferralChat.create({
        referral: seekerReferral._id,
        seeker: seekerId,
        provider: providerId,
        participants: [seekerId, providerId],
        messages: [
          {
            sender: providerId,
            content: systemMsg,
            type: "system",
            readBy: [providerId],
          },
        ],
        lastMessage: {
          content: systemMsg,
          sender: providerId,
          createdAt: new Date(),
        },
      });

      // Notify the seeker
      await Notification.create({
        user: seekerId,
        type: "referral",
        title: "🎉 A referral provider reached out!",
        message: `${req.user.name} wants to chat about a referral opportunity.`,
        link: `/careers/referrals`,
      });
    }

    // If there's an initial message, add it
    if (message?.trim()) {
      chat.messages.push({
        sender: providerId,
        content: message,
        type: "text",
        readBy: [providerId],
        createdAt: new Date(),
      });
      chat.lastMessage = {
        content: message,
        sender: providerId,
        createdAt: new Date(),
      };
      await chat.save();
    }

    res.json({ message: "Chat initiated!", chatId: chat._id });
  } catch (error) {
    console.error("Initiate Chat Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// UPDATE MY REFERRAL
// ═══════════════════════════════════════════════════════════════
const updateReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: "Referral not found" });
    if (referral.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedFields = [
      "domain", "skills", "bio", "resumeUrl", "targetCompanies",
      "experience", "pitch", "linkedinUrl", "portfolioUrl",
      "company", "position", "referralDomains", "availability",
      "maxReferrals", "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) referral[field] = req.body[field];
    });

    await referral.save();
    res.json({ message: "Referral updated", referral });
  } catch (error) {
    console.error("Update Referral Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// DELETE MY REFERRAL
// ═══════════════════════════════════════════════════════════════
const deleteReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: "Referral not found" });
    if (referral.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await referral.deleteOne();
    res.json({ message: "Referral deleted" });
  } catch (error) {
    console.error("Delete Referral Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// REFERRAL CHAT — GET MY CHATS
// ═══════════════════════════════════════════════════════════════
const getMyReferralChats = async (req, res) => {
  try {
    const chats = await ReferralChat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate("seeker", "name profileImage department role")
      .populate("provider", "name profileImage department role")
      .populate("referral", "domain company type")
      .sort({ updatedAt: -1 });

    const chatsWithUnread = chats.map((chat) => {
      const unreadCount = chat.messages.filter(
        (m) =>
          m.sender.toString() !== req.user._id.toString() &&
          !m.readBy.some((r) => r.toString() === req.user._id.toString())
      ).length;
      return { ...chat.toObject(), unreadCount };
    });

    res.json(chatsWithUnread);
  } catch (error) {
    console.error("Get Referral Chats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// REFERRAL CHAT — GET MESSAGES
// ═══════════════════════════════════════════════════════════════
const getReferralChatMessages = async (req, res) => {
  try {
    const chat = await ReferralChat.findById(req.params.chatId)
      .populate("seeker", "name profileImage")
      .populate("provider", "name profileImage")
      .populate("referral", "domain company type")
      .populate("messages.sender", "name profileImage");

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    // Mark as read
    let modified = false;
    chat.messages.forEach((msg) => {
      if (
        msg.sender._id.toString() !== req.user._id.toString() &&
        !msg.readBy.some((r) => r.toString() === req.user._id.toString())
      ) {
        msg.readBy.push(req.user._id);
        modified = true;
      }
    });
    if (modified) await chat.save();

    res.json(chat);
  } catch (error) {
    console.error("Get Referral Chat Messages Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// REFERRAL CHAT — SEND MESSAGE
// ═══════════════════════════════════════════════════════════════
const sendReferralChatMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Message required" });

    const chat = await ReferralChat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    chat.messages.push({
      sender: req.user._id,
      content,
      type: "text",
      readBy: [req.user._id],
      createdAt: new Date(),
    });
    chat.lastMessage = {
      content,
      sender: req.user._id,
      createdAt: new Date(),
    };
    await chat.save();

    // Notify other participant
    const otherUser = chat.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    if (otherUser) {
      await Notification.create({
        user: otherUser,
        type: "referral",
        title: "💬 New Referral Message",
        message: `${req.user.name}: ${content.substring(0, 80)}${content.length > 80 ? "..." : ""}`,
        link: `/careers/referrals`,
      });
    }

    res.json({ message: "Message sent", chat });
  } catch (error) {
    console.error("Send Referral Chat Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReferral,
  getReferrals,
  getReferralById,
  getMyReferrals,
  sendRequest,
  respondToRequest,
  initiateChat,
  updateReferral,
  deleteReferral,
  getMyReferralChats,
  getReferralChatMessages,
  sendReferralChatMessage,
};
