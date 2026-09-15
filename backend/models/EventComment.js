const mongoose = require("mongoose");

const eventCommentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventComment",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventComment", eventCommentSchema);