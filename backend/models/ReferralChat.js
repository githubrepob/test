const mongoose = require("mongoose");

const referralChatSchema = new mongoose.Schema(
  {
    // Link to a referral post (optional — chat can exist independently)
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "system", "status_update"],
          default: "text",
        },
        readBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      content: String,
      sender: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

referralChatSchema.index({ seeker: 1, provider: 1 }, { unique: true });
referralChatSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model("ReferralChat", referralChatSchema);
