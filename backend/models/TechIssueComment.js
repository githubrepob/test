const mongoose = require("mongoose");

const TechIssueCommentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechIssue",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechIssueComment",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TechIssueComment", TechIssueCommentSchema);
