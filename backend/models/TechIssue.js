const mongoose = require("mongoose");

const TechIssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    // attachments: {
    //   images: { type: [String], default: [] },
    //   videos: { type: [String], default: [] },
    //   codeSnippets: { type: [String], default: [] },
    //   links: { type: [String], default: [] },
    // },
   attachments: [
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }
], 

    tags: {
      type: [String],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechIssueComment",
      default: null,
    },

    solvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TechIssue", TechIssueSchema);
