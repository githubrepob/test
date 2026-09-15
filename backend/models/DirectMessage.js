const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastMessage: {
      content: { type: String, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

directMessageSchema.index({ participants: 1 });
directMessageSchema.index({ "lastMessage.createdAt": -1 });

module.exports = mongoose.model("DirectMessage", directMessageSchema);
