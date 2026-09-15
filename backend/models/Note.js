const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["academic", "placement"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, min: 1, max: 5 },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

noteSchema.index({ subject: 1, semester: 1, branch: 1, category: 1 });
noteSchema.index({ title: "text", subject: "text", tags: "text" });

module.exports = mongoose.model("Note", noteSchema);
