const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    // "seeker" = student asking for referral, "provider" = alumni/professional offering referrals
    type: {
      type: String,
      enum: ["seeker", "provider"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ═══ Common Fields ═══
    domain: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "fulfilled"],
      default: "active",
    },

    // ═══ Seeker-specific ═══
    resumeUrl: {
      type: String,
      default: "",
    },
    targetCompanies: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: "Fresher",
    },
    pitch: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
    },
    portfolioUrl: {
      type: String,
      default: "",
    },

    // ═══ Provider-specific ═══
    company: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    referralDomains: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ["open", "limited", "closed"],
      default: "open",
    },
    referralsGiven: {
      type: Number,
      default: 0,
    },
    maxReferrals: {
      type: Number,
      default: 5,
    },

    // ═══ Requests (seeker receives from providers, OR provider receives from seekers) ═══
    requests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        referralId: { type: mongoose.Schema.Types.ObjectId, ref: "Referral" }, // the other party's referral post
        message: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

referralSchema.index({ type: 1, status: 1, domain: 1 });
referralSchema.index({ user: 1, type: 1 });
referralSchema.index({ domain: "text", skills: "text", company: "text", bio: "text" });

module.exports = mongoose.model("Referral", referralSchema);
