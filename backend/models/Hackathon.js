const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
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
    organizer: {
      type: String,
      required: true,
    },
    organizerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    banner: {
      url: String,
      public_id: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    prizes: {
      type: String,
      default: "",
    },
    prizePool: {
      type: String,
      default: "",
    },
    themes: {
      type: [String],
      default: [],
    },
    venue: {
      name: { type: String, default: "Online" },
      address: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 4 },
    },
    website: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["devfolio", "user", "unstop", "other"],
      default: "user",
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    registeredTeams: [
      {
        teamName: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    auraPointsReward: {
      type: Number,
      default: 100,
    },
    auraPointsPenalty: {
      type: Number,
      default: 50,
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    eligibility: {
      type: String,
      default: "Open to all",
    },
    contactEmail: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

hackathonSchema.index({ startDate: 1, status: 1 });
hackathonSchema.index({ title: "text", description: "text", themes: "text" });

module.exports = mongoose.model("Hackathon", hackathonSchema);
