const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      default: "",
    },
    responsibilities: {
      type: String,
      default: "",
    },
    domain: {
      type: String,
      required: true,
    },
    stipend: {
      type: String,
      default: "Unpaid",
    },
    stipendMin: {
      type: Number,
      default: 0,
    },
    stipendMax: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      enum: ["Remote", "Onsite", "Hybrid"],
      default: "Remote",
    },
    city: {
      type: String,
      default: "",
    },
    ppo: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["internship", "project", "opportunity", "part-time", "full-time"],
      default: "internship",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    applicants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "viewed", "shortlisted", "accepted", "rejected"],
          default: "pending",
        },
        resumeUrl: String,
        coverLetter: String,
        posterNote: String,
      },
    ],
    applicationCount: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    applyLink: {
      type: String,
      default: "",
    },
    deadline: {
      type: Date,
    },
    source: {
      type: String,
      enum: ["campus", "external"],
      default: "campus",
    },
    externalId: {
      type: String,
      default: "",
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    sourcePlatform: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    perks: {
      type: [String],
      default: [],
    },
    openings: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
    },
    // Internshala-style fields
    experience: {
      type: String,
      default: "Fresher",
    },
    whoCanApply: {
      type: String,
      default: "",
    },
    numberOfApplicants: {
      type: Number,
      default: 0,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    companyDescription: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

internshipSchema.index({ domain: 1, source: 1, isActive: 1, createdAt: -1 });
internshipSchema.index({ title: "text", company: "text", domain: "text", skills: "text" });
internshipSchema.index({ stipendMin: 1, stipendMax: 1 });
internshipSchema.index({ externalId: 1 }, { sparse: true });

module.exports = mongoose.model("Internship", internshipSchema);
