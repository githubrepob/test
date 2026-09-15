const mongoose = require("mongoose");

const personalNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1", // indigo
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

personalNoteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });

module.exports = mongoose.model("PersonalNote", personalNoteSchema);
