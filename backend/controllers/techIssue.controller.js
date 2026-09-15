const TechIssue = require("../models/TechIssue");
const TechIssueComment = require("../models/TechIssueComment");
const Vote = require("../models/Vote");
const User = require("../models/User");
const mongoose = require("mongoose");


const createTechIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      tags,
      attachments
    } = req.body;

    // Basic validation (kept minimal, frontend already validates)
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    const issue = await TechIssue.create({
      title,
      description,

      // tags may come as array or undefined
      tags: Array.isArray(tags) ? tags : [],

      // ✅ IMPORTANT: save attachments coming from frontend
      attachments: Array.isArray(attachments) ? attachments : [],

      author: req.user.id
    });

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (err) {
    console.error("CREATE ISSUE ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};



/* ================= GET ALL ISSUES ================= */
const getAllTechIssues = async (req, res) => {
  try {
    const issues = await TechIssue.find({})
      .populate("author", "name auraPoints")
      .sort({ createdAt: -1 })
      .lean();

    const issueIds = issues.map(i => i._id);

    const votes = await Vote.aggregate([
      { $match: { targetId: { $in: issueIds }, targetType: "issue" } },
      {
        $group: {
          _id: { targetId: "$targetId", voteType: "$voteType" },
          count: { $sum: 1 }
        }
      }
    ]);

    const voteMap = {};
    votes.forEach(v => {
      const id = v._id.targetId.toString();
      voteMap[id] ??= { up: 0, down: 0 };
      if (v._id.voteType === "upvote") voteMap[id].up = v.count;
      if (v._id.voteType === "downvote") voteMap[id].down = v.count;
    });

    issues.forEach(i => {
      const v = voteMap[i._id.toString()] || { up: 0, down: 0 };
      i.voteCount = v.up - v.down;
    });

    res.json({ success: true, data: issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* ================= GET ISSUE BY ID ================= */
const getTechIssueById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid issue id" });
    }

    const issue = await TechIssue.findById(req.params.id)
      .populate("author", "name auraPoints")
      .lean();

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const votes = await Vote.find({
      targetId: issue._id,
      targetType: "issue"
    });

    issue.voteCount =
      votes.filter(v => v.voteType === "upvote").length -
      votes.filter(v => v.voteType === "downvote").length;

    res.json({ success: true, data: issue });
  } catch (err) {
    console.error("❌ getTechIssueById error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET COMMENTS BY ISSUE ================= */
const getCommentsByIssue = async (req, res) => {
  try {
    const comments = await TechIssueComment.find({
      issue: req.params.id
    })
      .populate("author", "name auraPoints")
      .sort({ createdAt: 1 })
      .lean();

    // 1️⃣ Fetch all votes for comments in this issue
    const commentIds = comments.map(c => c._id);

    const votes = await Vote.find({
      targetType: "comment",
      targetId: { $in: commentIds }
    }).lean();

    // 2️⃣ Build vote map
    const voteMap = {};
    votes.forEach(v => {
      const id = v.targetId.toString();
      voteMap[id] ??= { up: 0, down: 0 };
      if (v.voteType === "upvote") voteMap[id].up++;
      if (v.voteType === "downvote") voteMap[id].down++;
    });

    // 3️⃣ Attach voteCount + prepare tree map
    const map = {};
    comments.forEach(c => {
      const v = voteMap[c._id.toString()] || { up: 0, down: 0 };
      c.voteCount = v.up - v.down;
      c.replies = [];
      map[c._id.toString()] = c;
    });

    // 4️⃣ Build nested tree
    const roots = [];
    comments.forEach(c => {
      if (c.parentComment) {
        const parent = map[c.parentComment.toString()];
        if (parent) parent.replies.push(c);
      } else {
        roots.push(c);
      }
    });

    res.json({ success: true, data: roots });
  } catch (err) {
    console.error("❌ getCommentsByIssue error:", err);
    res.status(500).json({ message: err.message });
  }
};





/* ================= ADD COMMENT ================= */
const addCommentToIssue = async (req, res) => {
  try {
    const comment = await TechIssueComment.create({
      issue: req.params.id,
      author: req.user.id,
      content: req.body.content,
      parentComment: req.body.parentComment || null
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= VOTE HANDLER ================= */
const voteHandler = async (req, res) => {
  try {
    const { voteType } = req.body;
    const { id } = req.params;
    const { targetType } = req.query;

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const existingVote = await Vote.findOne({
      user: req.user.id,
      targetId: id,
      targetType
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await existingVote.deleteOne();
        return res.json({ success: true, message: "Vote removed" });
      }
      existingVote.voteType = voteType;
      await existingVote.save();
      return res.json({ success: true, message: "Vote updated" });
    }

    await Vote.create({
      user: req.user.id,
      targetId: id,
      targetType,
      voteType
    });

    res.json({ success: true, message: "Vote added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  const vote = async (targetId, voteType, targetType) => {
  try {
    await api.post(
      `/tech-issues/${targetId}/vote?targetType=${targetType}`,
      { voteType }
    );

    if (targetType === "issue") {
      setIssue(prev => ({
        ...prev,
        voteCount:
          voteType === "upvote"
            ? prev.voteCount + 1
            : prev.voteCount - 1
      }));
    }
  } catch (err) {
    console.error(err);
  }
};

};

/* ================= ACCEPT ANSWER ================= */
const acceptAnswer = async (req, res) => {
  const { issueId, commentId } = req.params;

  const issue = await TechIssue.findById(issueId);
  if (!issue) return res.status(404).json({ message: "Issue not found" });

  if (issue.author.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const comment = await TechIssueComment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  issue.status = "closed";
  issue.acceptedAnswer = comment._id;
  issue.solvedBy = comment.author;
  await issue.save();

  await User.findByIdAndUpdate(comment.author, {
    $inc: { auraPoints: 30 }
  });

  res.json({ success: true });
};


/* ================= EXPORTS ================= */
module.exports = {
  createTechIssue,
  getAllTechIssues,
  getTechIssueById,
  getCommentsByIssue,
  addCommentToIssue,
  voteHandler,
  acceptAnswer
};
