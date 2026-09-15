const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Workshop", "Seminar", "Fest", "Meetup", "Competition", "Fun", "Other"],
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    banner: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
    },
    time: {
      type: String,
      default: "",
    },
    venue: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    mode: {
      type: String,
      enum: ["offline", "online", "hybrid"],
      default: "offline",
    },
    meetLink: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      required: true,
    },
    attendeesCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    interested: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    auraPointsReward: {
      type: Number,
      default: 50,
    },
    // Extended fields
    skills: {
      type: [String],
      default: [],
    },
    speakers: [
      {
        name: { type: String, default: "" },
        title: { type: String, default: "" },
        avatar: { type: String, default: "" },
      },
    ],
    sponsors: {
      type: [String],
      default: [],
    },
    prizes: {
      type: String,
      default: "",
    },
    registrationFee: {
      type: String,
      default: "Free",
    },
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    rules: {
      type: String,
      default: "",
    },
    eligibility: {
      type: String,
      default: "",
    },
    teamSize: {
      type: String,
      default: "",
    },
    perks: {
      type: [String],
      default: [],
    },
    schedule: [
      {
        time: String,
        activity: String,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
eventSchema.index({ likes: 1, attendeesCount: 1, date: 1, isVerified: 1 });
eventSchema.index({ category: 1, isVerified: 1, date: 1 });
eventSchema.index({ title: "text", description: "text", tagline: "text" });

module.exports = mongoose.model("Event", eventSchema);