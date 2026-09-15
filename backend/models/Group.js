const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avatar: {
      url: String,
      public_id: String,
    },
    banner: {
      url: String,
      public_id: String,
    },
    category: {
      type: String,
      enum: ["department", "club", "interest", "batch", "other"],
      default: "other",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

groupSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Group", groupSchema);
