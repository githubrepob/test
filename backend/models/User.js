const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    collegeEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },

    branch: {
      type: String,
      required: true,
    },

    yearOfStudy: {
      type: Number,
      default: 1,
    },

    bio: {
      type: String,
      default: "",
    },

    graduationYear: {
      type: Number,
    },

    skills: {
      type: [String],
      default: [],
    },

    preferredTechDomain: {
      type: [String],
    },

    profileImage: {
      type: String,
      default: "",
    },
    auraPoints: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["admin", "user", "alumni", "teacher"],
      default: "user",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ═══ CODING STATS (LeetCode-style) ═══
    codingStats: {
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      contestsAttended: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      favoriteLanguage: { type: String, default: "" },
      leetcodeUsername: { type: String, default: "" },
      codeforcesUsername: { type: String, default: "" },
      githubUsername: { type: String, default: "" },
      topTopics: { type: [String], default: [] },
    },

    // ═══ ACADEMIC STATS ═══
    academicStats: {
      cgpa: { type: Number, default: 0 },
      college: { type: String, default: "" },
      coursesCompleted: { type: Number, default: 0 },
      certifications: { type: Number, default: 0 },
    },

    // ═══ NOTIFICATION PREFERENCES ═══
    notificationPrefs: {
      events: { type: Boolean, default: true },
      community: { type: Boolean, default: true },
      internships: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
