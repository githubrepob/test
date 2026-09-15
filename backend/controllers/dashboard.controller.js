const User = require("../models/User");
const PersonalNote = require("../models/PersonalNote");
const EventRegistration = require("../models/EventRegistration");
const Post = require("../models/Post");

// ═══ GET DASHBOARD DATA ═══
const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Aggregate stats from platform activity
    const eventsRegistered = await EventRegistration.countDocuments({ user: req.user._id });
    const eventsAttended = await EventRegistration.countDocuments({ user: req.user._id, status: "attended" });
    const postsCount = await Post.countDocuments({ author: req.user._id });
    const notesCount = await PersonalNote.countDocuments({ user: req.user._id });

    res.json({
      user,
      platformStats: {
        eventsRegistered,
        eventsAttended,
        postsCount,
        notesCount,
        auraPoints: user.auraPoints,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ SYNC LIVE CODING PROFILE ═══
const syncCodingProfile = async (req, res) => {
  try {
    const leetcodeUsername = req.body.leetcodeUsername?.trim();
    const codeforcesUsername = req.body.codeforcesUsername?.trim();
    const axios = require("axios");

    const update = {};
    const syncedPlatforms = [];
    const failures = [];

    // Fetch LeetCode Stats
    if (leetcodeUsername) {
      try {
        const lcRes = await axios.post("https://leetcode.com/graphql", {
          query: `query getUserProfile($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count submissions } } } }`,
          variables: { username: leetcodeUsername },
        }, { headers: { "Content-Type": "application/json" }, timeout: 10000 });
        if (lcRes.data?.errors?.length) throw new Error(lcRes.data.errors[0].message);
        const stats = lcRes.data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
        if (!stats?.length) throw new Error("LeetCode profile was not found or has no public statistics");

        const stat = (difficulty) => stats.find((item) => item.difficulty === difficulty) || {};
        const all = stat("All");
        const solved = Number(all.count) || 0;
        const submissions = Number(all.submissions) || 0;
        update["codingStats.leetcodeUsername"] = leetcodeUsername;
        update["codingStats.easySolved"] = Number(stat("Easy").count) || 0;
        update["codingStats.mediumSolved"] = Number(stat("Medium").count) || 0;
        update["codingStats.hardSolved"] = Number(stat("Hard").count) || 0;
        update["codingStats.totalSubmissions"] = submissions;
        update["codingStats.acceptanceRate"] = submissions ? Math.round((solved / submissions) * 100) : 0;
        syncedPlatforms.push("LeetCode");
      } catch (lcErr) {
        console.warn("LeetCode sync failed:", lcErr.message);
        failures.push(`LeetCode: ${lcErr.message}`);
      }
    }

    // Fetch Codeforces Stats
    if (codeforcesUsername) {
      try {
        const cfRes = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesUsername}`, { timeout: 5000 });
        if (cfRes.data && cfRes.data.status === "OK" && cfRes.data.result.length > 0) {
          const cfUser = cfRes.data.result[0];
          update["codingStats.codeforcesUsername"] = codeforcesUsername;
          update["codingStats.contestRating"] = cfUser.rating || 1400;
          syncedPlatforms.push("Codeforces");
        } else {
          throw new Error("Codeforces profile was not found");
        }
      } catch (cfErr) {
        console.warn("Codeforces sync failed:", cfErr.message);
        failures.push(`Codeforces: ${cfErr.message}`);
      }
    }

    if (!syncedPlatforms.length) {
      return res.status(422).json({ message: failures.join(". ") || "Enter a LeetCode or Codeforces username." });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select("-password");
    const partialFailure = failures.length ? ` ${failures.join(". ")}` : "";
    res.json({ message: `✓ ${syncedPlatforms.join(" and ")} synced successfully.${partialFailure}`, user, syncedPlatforms, failures });
  } catch (error) {
    console.error("Sync Coding Profile Error:", error);
    res.status(500).json({ message: "Server error during sync" });
  }
};

// ═══ UPDATE CODING STATS ═══
const updateCodingStats = async (req, res) => {
  try {
    const {
      easySolved, mediumSolved, hardSolved, contestRating,
      contestsAttended, streak, totalSubmissions, acceptanceRate,
      favoriteLanguage, leetcodeUsername, codeforcesUsername,
      githubUsername, topTopics,
    } = req.body;

    const update = {};
    if (easySolved !== undefined) update["codingStats.easySolved"] = easySolved;
    if (mediumSolved !== undefined) update["codingStats.mediumSolved"] = mediumSolved;
    if (hardSolved !== undefined) update["codingStats.hardSolved"] = hardSolved;
    if (contestRating !== undefined) update["codingStats.contestRating"] = contestRating;
    if (contestsAttended !== undefined) update["codingStats.contestsAttended"] = contestsAttended;
    if (streak !== undefined) update["codingStats.streak"] = streak;
    if (totalSubmissions !== undefined) update["codingStats.totalSubmissions"] = totalSubmissions;
    if (acceptanceRate !== undefined) update["codingStats.acceptanceRate"] = acceptanceRate;
    if (favoriteLanguage !== undefined) update["codingStats.favoriteLanguage"] = favoriteLanguage;
    if (leetcodeUsername !== undefined) update["codingStats.leetcodeUsername"] = leetcodeUsername;
    if (codeforcesUsername !== undefined) update["codingStats.codeforcesUsername"] = codeforcesUsername;
    if (githubUsername !== undefined) update["codingStats.githubUsername"] = githubUsername;
    if (topTopics !== undefined) update["codingStats.topTopics"] = topTopics;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select("-password");

    res.json({ message: "Coding stats updated", user });
  } catch (error) {
    console.error("Update Coding Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ UPDATE ACADEMIC STATS ═══
const updateAcademicStats = async (req, res) => {
  try {
    const { cgpa, college, coursesCompleted, certifications } = req.body;

    const update = {};
    if (cgpa !== undefined) update["academicStats.cgpa"] = cgpa;
    if (college !== undefined) update["academicStats.college"] = college;
    if (coursesCompleted !== undefined) update["academicStats.coursesCompleted"] = coursesCompleted;
    if (certifications !== undefined) update["academicStats.certifications"] = certifications;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select("-password");

    res.json({ message: "Academic stats updated", user });
  } catch (error) {
    console.error("Update Academic Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ UPDATE PROFILE ═══
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, profileImage, preferredTechDomain } = req.body;

    const update = {};
    if (name) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (skills) update.skills = skills;
    if (profileImage !== undefined) update.profileImage = profileImage;
    if (preferredTechDomain) update.preferredTechDomain = preferredTechDomain;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ UPDATE NOTIFICATION PREFERENCES ═══
const updateNotificationPrefs = async (req, res) => {
  try {
    const { events, community, internships, messages } = req.body;
    const update = {};
    if (events !== undefined) update["notificationPrefs.events"] = events;
    if (community !== undefined) update["notificationPrefs.community"] = community;
    if (internships !== undefined) update["notificationPrefs.internships"] = internships;
    if (messages !== undefined) update["notificationPrefs.messages"] = messages;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select("-password");
    res.json({ message: "Notification preferences updated", notificationPrefs: user.notificationPrefs });
  } catch (error) {
    console.error("Update Notif Prefs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ COMPANY READINESS PREDICTION ═══
const getCompanyReadiness = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { company } = req.query;

    const companyProfiles = {
      // === MASS & PREMIUM RECRUITERS ===
      TCS: {
        name: "TCS", domain: "IT Services, NQT/Digital/Prime",
        focus: { dsa: 0.35, development: 0.4, ai: 0.1, aptitude: 0.15 },
        minRating: 1200, minProblems: 100,
        pyqFocus: ["Arrays", "Strings", "Basic Math", "Pattern Printing"],
        salaryRange: "₹3.36 – ₹9 LPA"
      },
      Infosys: {
        name: "Infosys", domain: "IT Consulting, SP/DSE/SE",
        focus: { dsa: 0.4, development: 0.35, ai: 0.1, aptitude: 0.15 },
        minRating: 1300, minProblems: 150,
        pyqFocus: ["DP (Knapsack, LIS)", "Graph BFS/DFS", "Greedy"],
        salaryRange: "₹6.5 – ₹9.5 LPA"
      },
      Wipro: {
        name: "Wipro", domain: "IT Services, Elite NLTH/Turbo",
        focus: { dsa: 0.3, development: 0.45, ai: 0.05, aptitude: 0.2 },
        minRating: 1100, minProblems: 80,
        pyqFocus: ["Pattern Printing", "String Manipulation", "GCD/LCM"],
        salaryRange: "₹3.5 – ₹6.5 LPA"
      },
      Accenture: {
        name: "Accenture", domain: "Tech Consulting, FSE/ASE",
        focus: { dsa: 0.35, development: 0.45, ai: 0.1, aptitude: 0.1 },
        minRating: 1200, minProblems: 100,
        pyqFocus: ["Bitwise Operators", "Pseudo Code", "Arrays"],
        salaryRange: "₹4.5 – ₹6.5 LPA"
      },
      Capgemini: {
        name: "Capgemini", domain: "IT Consulting, Exceller Program",
        focus: { dsa: 0.3, development: 0.45, ai: 0.05, aptitude: 0.2 },
        minRating: 1100, minProblems: 80,
        pyqFocus: ["Pointers", "Recursion", "Pseudo Code"],
        salaryRange: "₹4.2 – ₹7.5 LPA"
      },
      Cognizant: {
        name: "Cognizant", domain: "IT Services, GenC/Elevate/Pro",
        focus: { dsa: 0.35, development: 0.4, ai: 0.1, aptitude: 0.15 },
        minRating: 1200, minProblems: 100,
        pyqFocus: ["SQL Joins", "OOPs Concepts", "Linked Lists"],
        salaryRange: "₹4.0 – ₹6.75 LPA"
      },
      "Josh Technology": {
        name: "Josh Technology Group", domain: "Product, SDE Roles",
        focus: { dsa: 0.5, development: 0.3, ai: 0.1, aptitude: 0.1 },
        minRating: 1500, minProblems: 250,
        pyqFocus: ["C++ Pointers", "Virtual Functions", "OS Threads"],
        salaryRange: "₹7.5 – ₹12 LPA"
      },
      Juspay: {
        name: "Juspay", domain: "Fintech Payments, SDE-1",
        focus: { dsa: 0.55, development: 0.25, ai: 0.1, aptitude: 0.1 },
        minRating: 1700, minProblems: 300,
        pyqFocus: ["Tree Locking (BFS+DFS)", "Concurrency", "Graph Algorithms"],
        salaryRange: "₹13 – ₹27 LPA"
      },
      // === PRODUCT COMPANIES ===
      Google: { name: "Google", domain: "Search, Cloud, AI", focus: { dsa: 0.5, development: 0.3, ai: 0.2, aptitude: 0 }, minRating: 1800, minProblems: 400, pyqFocus: ["Hard DP", "Graph Algorithms", "System Design"], salaryRange: "₹35+ LPA" },
      Amazon: { name: "Amazon", domain: "E-commerce, AWS", focus: { dsa: 0.45, development: 0.4, ai: 0.15, aptitude: 0 }, minRating: 1700, minProblems: 350, pyqFocus: ["OOP Design", "Arrays", "Distributed Systems"], salaryRange: "₹25+ LPA" },
      Microsoft: { name: "Microsoft", domain: "Cloud, OS, Productivity", focus: { dsa: 0.4, development: 0.45, ai: 0.15, aptitude: 0 }, minRating: 1600, minProblems: 300, pyqFocus: ["Trees", "BFS/DFS", "Sliding Window"], salaryRange: "₹20+ LPA" },
      Adobe: { name: "Adobe", domain: "Creative Cloud, Marketing", focus: { dsa: 0.4, development: 0.4, ai: 0.2, aptitude: 0 }, minRating: 1500, minProblems: 250, pyqFocus: ["Matrix Problems", "Strings", "OOP"], salaryRange: "₹12 – ₹25 LPA" },
      Flipkart: { name: "Flipkart", domain: "E-commerce, Logistics", focus: { dsa: 0.5, development: 0.35, ai: 0.15, aptitude: 0 }, minRating: 1600, minProblems: 300, pyqFocus: ["Greedy", "DP", "Graph BFS"], salaryRange: "₹15+ LPA" },
    };

    const cs = user.codingStats || {};
    const ac = user.academicStats || {};
    const totalSolved = (cs.easySolved || 0) + (cs.mediumSolved || 0) + (cs.hardSolved || 0);
    const rating = cs.contestRating || 0;
    const cgpa = ac.cgpa || 7.0;

    const results = {};
    const companies = company ? [company] : Object.keys(companyProfiles);

    for (const comp of companies) {
      const cp = companyProfiles[comp];
      if (!cp) continue;

      const dsaScore = Math.min((totalSolved / cp.minProblems) * 100, 100);
      const ratingScore = cp.minRating > 0 ? Math.min((rating / cp.minRating) * 100, 100) : 60;
      const devScore = Math.min(((user.skills?.length || 0) * 10 + (user.auraPoints || 0) / 10), 100);
      const aiScore = user.skills?.some((s) => ["AI", "ML", "AI/ML", "Data Science", "Deep Learning", "Python"].includes(s)) ? 80 : 35;
      // Aptitude is mainly CGPA-based for mass recruiters
      const aptitudeScore = Math.min((cgpa / 10) * 100, 100);

      const readiness = Math.round(
        dsaScore * cp.focus.dsa +
        (ratingScore * 0.3 + devScore * 0.7) * cp.focus.development +
        aiScore * (cp.focus.ai || 0) +
        aptitudeScore * (cp.focus.aptitude || 0)
      );

      const weakAreas = [];
      if (dsaScore < 60) weakAreas.push("DSA Problem Solving");
      if (ratingScore < 50 && cp.minRating > 1200) weakAreas.push("Contest/Coding Rating");
      if (devScore < 50) weakAreas.push("Projects & Dev Skills");
      if (aiScore < 50 && (cp.focus.ai || 0) > 0.12) weakAreas.push("AI/ML Knowledge");
      if (aptitudeScore < 65 && (cp.focus.aptitude || 0) > 0.1) weakAreas.push("CGPA / Aptitude");

      // Per-company personalized suggestion
      let suggestion = "";
      const score = Math.min(readiness, 100);
      if (score > 85) {
        suggestion = `Strong profile for ${cp.name}! Practice ${cp.pyqFocus?.[0] || "hard problems"} and mock 3+ interviews.`;
      } else if (score > 65) {
        suggestion = `Good base. Focus on ${cp.pyqFocus?.[0] || "DSA"} and ${cp.pyqFocus?.[1] || "system design"} for ${cp.name} PYQs.`;
      } else if (score > 45) {
        suggestion = `Needs work. Practice ${cp.pyqFocus?.join(", ") || "core fundamentals"} with timed mock sessions.`;
      } else {
        suggestion = `Start with ${cp.pyqFocus?.[0] || "basic DSA"} fundamentals. Aim for ${cp.minProblems} problems on LeetCode first.`;
      }

      results[comp] = {
        company: comp,
        domain: cp.domain,
        salaryRange: cp.salaryRange || "N/A",
        pyqFocus: cp.pyqFocus || [],
        readinessScore: score,
        weakAreas: weakAreas.length ? weakAreas : ["None — great shape!"],
        suggestion,
        breakdown: {
          dsa: Math.round(dsaScore),
          contestRating: Math.round(ratingScore),
          development: Math.round(devScore),
          aiml: Math.round(aiScore),
        },
      };
    }

    const methodology = {
      scoreDefinition: "Company-specific readiness is a weighted competency score derived from the student's current academic, coding, development and domain data.",
      components: ["DSA/problem solving", "competitive coding", "development/projects", "AI/ML where relevant", "academic/aptitude proxy where relevant"],
      important: "Weights and thresholds are configuration parameters, not official company cut-offs. They must be updated from the current job description/recruitment pattern before using the score for a real application.",
      evidence: "Student profile + live coding sync + institution-configured company rubric"
    };
    res.json(company ? { ...results[company], methodology } : { results, methodology });
  } catch (error) {
    console.error("Company Readiness Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ GET USER PUBLIC PROFILE ═══
const getUserPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Public Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ PERSONAL NOTES CRUD ═══
const getPersonalNotes = async (req, res) => {
  try {
    const notes = await PersonalNote.find({ user: req.user._id }).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createPersonalNote = async (req, res) => {
  try {
    const { title, content, color, tags } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const note = await PersonalNote.create({
      user: req.user._id,
      title,
      content: content || "",
      color: color || "#6366f1",
      tags: tags || [],
    });
    res.status(201).json(note);
  } catch (error) {
    console.error("Create Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePersonalNote = async (req, res) => {
  try {
    const note = await PersonalNote.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const { title, content, color, isPinned, tags } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (tags !== undefined) note.tags = tags;

    await note.save();
    res.json(note);
  } catch (error) {
    console.error("Update Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePersonalNote = async (req, res) => {
  try {
    await PersonalNote.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══ GET PLACEMENT PREDICTION ═══
const getPlacementPrediction = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const payload = {
      cgpa: user.academicStats?.cgpa || 7.5,
      easySolved: user.codingStats?.easySolved || 20,
      mediumSolved: user.codingStats?.mediumSolved || 15,
      hardSolved: user.codingStats?.hardSolved || 3,
      contestRating: user.codingStats?.contestRating || 1350,
      projectsCount: user.skills?.length || 2,
      internshipsCount: 1,
      certifications: user.academicStats?.certifications || 1,
      semester: user.year ? user.year * 2 : 6,
      communityActivityScore: user.auraPoints || 50,
    };

    const axios = require("axios");
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

    try {
      const mlRes = await axios.post(`${ML_SERVICE_URL}/predict/placement`, payload, { timeout: 3000 });
      return res.json(mlRes.data);
    } catch (mlErr) {
      console.warn("⚠️ ML Placement Prediction Fallback:", mlErr.message);
      const estProb = Math.min(98, Math.max(30, Math.round((payload.cgpa * 7) + (payload.mediumSolved * 0.3) + (payload.hardSolved * 1.2))));
      return res.json({
        placementProbability: estProb,
        packageBand: estProb > 80 ? "High (> ₹15 LPA)" : estProb > 60 ? "Mid (₹6 - ₹14 LPA)" : "Low (< ₹5 LPA)",
        topFactors: [
          `Academic Performance (CGPA ${payload.cgpa})`,
          `Problem Solving (${payload.mediumSolved} Medium Solved)`,
          `Advanced Problem Solving (${payload.hardSolved} Hard Solved)`
        ]
      });
    }
  } catch (error) {
    console.error("Placement Prediction Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getDashboardData,
  updateCodingStats,
  syncCodingProfile,
  updateAcademicStats,
  updateProfile,
  updateNotificationPrefs,
  getCompanyReadiness,
  getPlacementPrediction,
  getUserPublicProfile,
  getPersonalNotes,
  createPersonalNote,
  updatePersonalNote,
  deletePersonalNote,
};
