const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Notification = require("../models/Notification");

// CREATE HACKATHON
const createHackathon = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title || !data.description || !data.startDate || !data.endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hackathon = await Hackathon.create({
      ...data,
      organizerUser: req.user._id,
      source: "user",
      isVerified: true,
    });

    // Award aura points for creating
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { auraPoints: 20 },
    });

    res.status(201).json({
      message: "Hackathon created! +20 Aura Points",
      hackathon,
    });
  } catch (error) {
    console.error("Create Hackathon Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL HACKATHONS
const getHackathons = async (req, res) => {
  try {
    const { status, mode, search, theme, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (theme) filter.themes = { $in: [new RegExp(theme, "i")] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Auto-update statuses
    const now = new Date();
    await Hackathon.updateMany(
      { startDate: { $lte: now }, endDate: { $gte: now }, status: "upcoming" },
      { $set: { status: "ongoing" } }
    );
    await Hackathon.updateMany(
      { endDate: { $lt: now }, status: { $ne: "completed" } },
      { $set: { status: "completed" } }
    );

    const hackathons = await Hackathon.find(filter)
      .populate("organizerUser", "name profileImage")
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Hackathon.countDocuments(filter);

    res.json({
      hackathons,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Hackathons Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE HACKATHON
const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate("organizerUser", "name profileImage")
      .populate("interestedUsers", "name profileImage")
      .populate("registeredTeams.members", "name profileImage");

    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    res.json(hackathon);
  } catch (error) {
    console.error("Get Hackathon Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// TOGGLE INTEREST
const toggleInterest = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const userId = req.user._id;
    const isInterested = hackathon.interestedUsers.includes(userId);

    if (isInterested) {
      hackathon.interestedUsers.pull(userId);
    } else {
      hackathon.interestedUsers.push(userId);
    }

    await hackathon.save();

    res.json({
      message: isInterested ? "Removed interest" : "Marked as interested",
      interestedCount: hackathon.interestedUsers.length,
      isInterested: !isInterested,
    });
  } catch (error) {
    console.error("Toggle Interest Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER TEAM
const registerTeam = async (req, res) => {
  try {
    const { teamName, memberIds } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    const members = memberIds || [req.user._id];

    if (members.length < hackathon.teamSize.min || members.length > hackathon.teamSize.max) {
      return res.status(400).json({
        message: `Team size must be ${hackathon.teamSize.min}-${hackathon.teamSize.max} members`,
      });
    }

    const duplicateTeam = hackathon.registeredTeams.some((team) =>
      team.members.some((member) => member.toString() === req.user._id.toString())
    );
    if (duplicateTeam) return res.status(400).json({ message: "You are already registered in a team for this hackathon" });

    hackathon.registeredTeams.push({
      teamName: teamName || `Team ${hackathon.registeredTeams.length + 1}`,
      createdBy: req.user._id,
      members,
    });
    hackathon.participantCount += members.length;

    await hackathon.save();

    res.json({
      message: "Team registered successfully!",
      participantCount: hackathon.participantCount,
    });
  } catch (error) {
    console.error("Register Team Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// WITHDRAW TEAM REGISTRATION
const withdrawTeam = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    const before = hackathon.registeredTeams.length;
    const remaining = hackathon.registeredTeams.filter((team) => {
      const isOwner = team.createdBy && team.createdBy.toString() === req.user._id.toString();
      const isMember = team.members.some((m) => m.toString() === req.user._id.toString());
      return !(isOwner || isMember);
    });
    if (remaining.length === before) return res.status(404).json({ message: "No team registration found" });
    const removed = hackathon.registeredTeams.filter((t) => !remaining.includes(t));
    const removedMembers = removed.reduce((sum, t) => sum + t.members.length, 0);
    hackathon.registeredTeams = remaining;
    hackathon.participantCount = Math.max(0, hackathon.participantCount - removedMembers);
    await hackathon.save();
    res.json({ message: "Team registration withdrawn", participantCount: hackathon.participantCount });
  } catch (error) {
    console.error("Withdraw Team Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ORGANIZER DASHBOARD
const getMyHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ organizerUser: req.user._id })
      .populate("registeredTeams.members", "name collegeEmail branch semester")
      .sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (error) {
    console.error("My Hackathons Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// MARK ATTENDANCE — aura points
const markAttendance = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const userId = req.user._id;

    if (hackathon.attendees.includes(userId)) {
      return res.status(400).json({ message: "Already marked as attended" });
    }

    hackathon.attendees.push(userId);
    await hackathon.save();

    // Award aura points
    await User.findByIdAndUpdate(userId, {
      $inc: { auraPoints: hackathon.auraPointsReward },
    });

    res.json({
      message: `Attendance marked! +${hackathon.auraPointsReward} Aura Points`,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// SEED SAMPLE HACKATHONS (Devfolio-style data)
const seedHackathons = async (req, res) => {
  try {
    const count = await Hackathon.countDocuments();
    if (count > 0) {
      return res.json({ message: "Hackathons already seeded" });
    }

    const sampleHackathons = [
      {
        title: "HackWithIndia 2026",
        description: "India's largest student hackathon bringing together 5000+ developers to build solutions for real-world problems. 48-hour coding marathon with mentorship from industry experts.",
        organizer: "HackWithIndia Foundation",
        startDate: new Date("2026-05-15"),
        endDate: new Date("2026-05-17"),
        registrationDeadline: new Date("2026-05-10"),
        prizes: "₹5,00,000 in prizes + internship opportunities",
        prizePool: "₹5,00,000",
        themes: ["AI/ML", "Web3", "FinTech", "HealthTech", "EdTech"],
        venue: { name: "IIT Delhi", address: "Hauz Khas, New Delhi", city: "New Delhi", latitude: 28.5459, longitude: 77.1926 },
        mode: "Offline",
        teamSize: { min: 2, max: 4 },
        website: "https://hackwithindia.com",
        source: "devfolio",
        status: "upcoming",
        auraPointsReward: 150,
        participantCount: 3200,
        isVerified: true,
        eligibility: "All college students",
        contactEmail: "hello@hackwithindia.com",
      },
      {
        title: "ETHIndia 2026",
        description: "Asia's biggest Ethereum hackathon. Build the future of Web3 with 2000+ hackers from across the globe. Prizes, bounties, and grants worth $100K+.",
        organizer: "Devfolio",
        startDate: new Date("2026-06-20"),
        endDate: new Date("2026-06-22"),
        registrationDeadline: new Date("2026-06-15"),
        prizes: "$100,000+ in prizes and bounties",
        prizePool: "$100,000+",
        themes: ["DeFi", "NFT", "DAO", "Infrastructure", "Social"],
        venue: { name: "KTPO Convention Center", address: "Whitefield", city: "Bangalore", latitude: 12.9855, longitude: 77.7324 },
        mode: "Offline",
        teamSize: { min: 1, max: 5 },
        website: "https://ethindia.co",
        source: "devfolio",
        status: "upcoming",
        auraPointsReward: 200,
        participantCount: 1800,
        isVerified: true,
        eligibility: "Open to all",
        contactEmail: "team@devfolio.co",
      },
      {
        title: "Smart India Hackathon 2026",
        description: "Government of India's flagship hackathon to solve real problems faced by ministries and departments. Build scalable solutions for Digital India.",
        organizer: "Ministry of Education, GoI",
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-08-03"),
        registrationDeadline: new Date("2026-07-15"),
        prizes: "₹1,00,000 per problem statement",
        prizePool: "₹50,00,000+",
        themes: ["GovTech", "Agriculture", "Healthcare", "Education", "Smart City"],
        venue: { name: "Multiple Nodal Centers", address: "Pan India", city: "Pan India", latitude: 20.5937, longitude: 78.9629 },
        mode: "Hybrid",
        teamSize: { min: 6, max: 6 },
        website: "https://sih.gov.in",
        source: "other",
        status: "upcoming",
        auraPointsReward: 250,
        participantCount: 50000,
        isVerified: true,
        eligibility: "Indian college students only",
        contactEmail: "sih@aicte-india.org",
      },
      {
        title: "HackThisFall 4.0",
        description: "Community-driven hackathon fostering innovation. Build, learn, and win. Open-source focused with tracks for beginners and experts alike.",
        organizer: "Hack This Fall",
        startDate: new Date("2026-07-10"),
        endDate: new Date("2026-07-12"),
        registrationDeadline: new Date("2026-07-05"),
        prizes: "₹3,00,000 + swag + mentorship",
        prizePool: "₹3,00,000",
        themes: ["Open Source", "DevTools", "Climate", "Accessibility"],
        venue: { name: "Online", city: "Virtual" },
        mode: "Online",
        teamSize: { min: 1, max: 4 },
        website: "https://hackthisfall.tech",
        source: "devfolio",
        status: "upcoming",
        auraPointsReward: 100,
        participantCount: 5000,
        isVerified: true,
        eligibility: "Open to all",
        contactEmail: "hello@hackthisfall.tech",
      },
      {
        title: "Codeissance 2026",
        description: "A 36-hour hackathon by TSEC coding club. Build innovative solutions for everyday problems. Great for first-time hackers!",
        organizer: "TSEC CodeCell",
        startDate: new Date("2026-04-25"),
        endDate: new Date("2026-04-27"),
        registrationDeadline: new Date("2026-04-20"),
        prizes: "₹1,50,000 in prizes",
        prizePool: "₹1,50,000",
        themes: ["HealthTech", "EdTech", "Sustainability", "FinTech"],
        venue: { name: "Thadomal Shahani Engineering College", address: "Bandra West", city: "Mumbai", latitude: 19.0544, longitude: 72.8409 },
        mode: "Offline",
        teamSize: { min: 2, max: 4 },
        website: "https://codeissance.tseccoders.com",
        source: "user",
        status: "upcoming",
        auraPointsReward: 120,
        participantCount: 500,
        isVerified: true,
        eligibility: "College students from Mumbai",
        contactEmail: "codecell@tsec.edu",
      },
      {
        title: "MLH Global Hack Week",
        description: "A week-long celebration of learning and building. Challenges, workshops, and swag. Perfect for beginners diving into hackathon culture.",
        organizer: "Major League Hacking",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-07"),
        registrationDeadline: new Date("2026-08-28"),
        prizes: "Swag boxes + MLH fellowship consideration",
        prizePool: "N/A",
        themes: ["Web Dev", "Mobile", "AI/ML", "Gaming", "Data Science"],
        venue: { name: "Online", city: "Virtual" },
        mode: "Online",
        teamSize: { min: 1, max: 1 },
        website: "https://ghw.mlh.io",
        source: "other",
        status: "upcoming",
        auraPointsReward: 80,
        participantCount: 10000,
        isVerified: true,
        eligibility: "Open to all students worldwide",
        contactEmail: "hi@mlh.io",
      },
    ];

    await Hackathon.insertMany(sampleHackathons);

    res.json({ message: `Seeded ${sampleHackathons.length} hackathons` });
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  toggleInterest,
  registerTeam,
  withdrawTeam,
  getMyHackathons,
  markAttendance,
  seedHackathons,
};
