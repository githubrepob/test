const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ═══════════════════════════════════════════════════════════════
// CREATE EVENT
// ═══════════════════════════════════════════════════════════════
const createEvent = async (req, res) => {
  try {
    const {
      title, tagline, description, category, date, endDate, time,
      venue, mode, meetLink, capacity, auraPointsReward, banner,
      skills, speakers, sponsors, prizes, registrationFee,
      contactEmail, contactPhone, website, rules, eligibility,
      teamSize, perks, schedule,
    } = req.body;

    if (!title || !description || !category || !date || !capacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.create({
      title,
      tagline: tagline || "",
      description,
      category,
      date,
      endDate: endDate || null,
      time: time || "",
      venue: venue || {},
      mode: mode || "offline",
      meetLink: meetLink || "",
      capacity,
      auraPointsReward: auraPointsReward || 50,
      organizer: req.user._id,
      banner: banner || {},
      skills: skills || [],
      speakers: speakers || [],
      sponsors: sponsors || [],
      prizes: prizes || "",
      registrationFee: registrationFee || "Free",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      website: website || "",
      rules: rules || "",
      eligibility: eligibility || "",
      teamSize: teamSize || "",
      perks: perks || [],
      schedule: schedule || [],
      isVerified: true, // Auto-verify for now
    });

    res.status(201).json({
      message: "Event created successfully!",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET ALL EVENTS (with advanced filtering)
// ═══════════════════════════════════════════════════════════════
const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, search, mode,
      upcoming, past, sortBy = "date",
    } = req.query;

    const filter = { isVerified: true };

    if (category && category !== "All") filter.category = category;
    if (mode) filter.mode = mode;

    // Date filters
    const now = new Date();
    if (upcoming === "true") filter.date = { $gte: now };
    if (past === "true") filter.date = { $lt: now };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { "venue.name": { $regex: search, $options: "i" } },
      ];
    }

    // Sort
    let sort = { date: 1 };
    switch (sortBy) {
      case "newest": sort = { createdAt: -1 }; break;
      case "popular": sort = { attendeesCount: -1 }; break;
      case "date": sort = { date: 1 }; break;
      default: sort = { date: 1 };
    }

    const events = await Event.find(filter)
      .populate("organizer", "name profileImage department role")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    // Category counts
    const categories = ["Technical", "Cultural", "Sports", "Workshop", "Seminar", "Fest", "Meetup", "Competition", "Fun", "Other"];
    const categoryCounts = {};
    for (const cat of categories) {
      categoryCounts[cat] = await Event.countDocuments({ ...filter, category: cat });
    }

    const upcomingCount = await Event.countDocuments({ isVerified: true, date: { $gte: now } });
    const pastCount = await Event.countDocuments({ isVerified: true, date: { $lt: now } });

    res.json({
      events,
      total,
      categoryCounts,
      upcomingCount,
      pastCount,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// TRENDING EVENTS
// ═══════════════════════════════════════════════════════════════
const getTrendingEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.aggregate([
      { $match: { isVerified: true, date: { $gte: now } } },
      {
        $addFields: {
          pulseScore: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 3] },
              { $multiply: [{ $size: { $ifNull: ["$interested", []] } }, 2] },
              "$attendeesCount",
            ],
          },
        },
      },
      { $sort: { pulseScore: -1 } },
      { $limit: 12 },
    ]);

    // Populate organizer manually after aggregation
    await Event.populate(events, { path: "organizer", select: "name profileImage" });

    res.json(events);
  } catch (error) {
    console.error("Trending Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET EVENT BY ID
// ═══════════════════════════════════════════════════════════════
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate("organizer", "name profileImage department role collegeEmail");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if current user is registered
    let isRegistered = false;
    let isInterested = false;
    const token = req.headers.authorization;
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        const userId = decoded.id;
        const registration = await EventRegistration.findOne({ event: eventId, user: userId });
        isRegistered = !!registration;
        isInterested = event.interested?.some((id) => id.toString() === userId.toString()) || false;
      } catch (e) {
        // Token invalid, ignore
      }
    }

    res.json({ ...event.toObject(), isRegistered, isInterested });
  } catch (error) {
    console.error("Get Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// TOGGLE LIKE
// ═══════════════════════════════════════════════════════════════
const toggleLikeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    const alreadyLiked = event.likes.includes(userId);

    if (alreadyLiked) {
      event.likes.pull(userId);
    } else {
      event.likes.push(userId);
    }

    await event.save();

    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likesCount: event.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// TOGGLE INTERESTED
// ═══════════════════════════════════════════════════════════════
const toggleInterested = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    const already = event.interested?.includes(userId);

    if (already) {
      event.interested.pull(userId);
    } else {
      event.interested.push(userId);
    }
    await event.save();

    res.json({
      message: already ? "Removed from interested" : "Marked as interested",
      interestedCount: event.interested.length,
      interested: !already,
    });
  } catch (error) {
    console.error("Interested Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// TOGGLE BOOKMARK
// ═══════════════════════════════════════════════════════════════
const toggleBookmark = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    const already = event.bookmarks?.includes(userId);

    if (already) {
      event.bookmarks.pull(userId);
    } else {
      event.bookmarks.push(userId);
    }
    await event.save();

    res.json({
      message: already ? "Removed bookmark" : "Bookmarked",
      bookmarked: !already,
    });
  } catch (error) {
    console.error("Bookmark Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET EVENTS BY MONTH (for calendar)
// ═══════════════════════════════════════════════════════════════
const getEventsByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month required" });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const events = await Event.find({
      isVerified: true,
      date: { $gte: start, $lt: end },
    }).select("_id title category date venue.name mode attendeesCount");

    const grouped = {};

    events.forEach((e) => {
      const key = e.date.toISOString().split("T")[0];
      if (!grouped[key]) grouped[key] = [];

      grouped[key].push({
        id: e._id,
        title: e.title,
        category: e.category,
        venue: e.venue?.name || "",
        mode: e.mode,
        attendees: e.attendeesCount,
      });
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET MY EVENTS (organized by me)
// ═══════════════════════════════════════════════════════════════
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("My Events Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET MY REGISTERED EVENTS
// ═══════════════════════════════════════════════════════════════
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user._id })
      .populate({
        path: "event",
        populate: { path: "organizer", select: "name profileImage" },
      })
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error("My Registrations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// VERIFY EVENT (admin)
// ═══════════════════════════════════════════════════════════════
const verifyEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, rejectionReason } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (status === "approve") {
      event.isVerified = true;
      event.rejectionReason = null;
    }
    if (status === "reject") {
      event.isVerified = false;
      event.rejectionReason = rejectionReason || "Rejected by admin";
    }

    await event.save();

    res.json({ message: `Event ${status}d successfully`, event });
  } catch (error) {
    console.error("Verify Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// SEED SAMPLE EVENTS
// ═══════════════════════════════════════════════════════════════
const seedEvents = async (req, res) => {
  try {
    const count = await Event.countDocuments({ isVerified: true });
    if (count > 3) return res.json({ message: "Events already exist" });

    const firstUser = await User.findOne({});
    const now = new Date();

    const samples = [
      {
        title: "TechFest 2026 — Campus Hackathon",
        tagline: "48 hours. Build something incredible.",
        description: "The biggest inter-college hackathon is back! Form teams of up to 4 and build innovative solutions across AI, Web3, and Sustainability tracks.\n\n🏆 Total prize pool: ₹2,00,000\n📋 Round 1: Online ideation\n📋 Round 2: 48-hour onsite build\n📋 Round 3: Demo Day\n\nAll participants receive certificates, goodies, and meals during the event.",
        category: "Technical",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        time: "10:00 AM",
        venue: { name: "Main Auditorium, Block A", address: "Engineering Campus", latitude: 28.6139, longitude: 77.209 },
        mode: "offline",
        capacity: 200,
        auraPointsReward: 100,
        skills: ["Coding", "Problem Solving", "Teamwork", "Presentation"],
        speakers: [{ name: "Dr. Priya Sharma", title: "AI Researcher, IIT Delhi" }],
        prizes: "🥇 ₹1,00,000 | 🥈 ₹50,000 | 🥉 ₹25,000 + Internship offers",
        registrationFee: "Free",
        eligibility: "All college students (teams of 2-4)",
        teamSize: "2-4",
        perks: ["Certificates", "Free Meals", "Goodies", "Internship Opportunities", "Networking"],
        schedule: [
          { time: "10:00 AM", activity: "Registration & Opening Ceremony" },
          { time: "11:00 AM", activity: "Hacking Begins" },
          { time: "1:00 PM", activity: "Lunch Break" },
          { time: "6:00 PM", activity: "Mentoring Session" },
          { time: "10:00 AM (Day 2)", activity: "Final Submissions" },
          { time: "2:00 PM (Day 2)", activity: "Demo Day & Awards" },
        ],
        isVerified: true,
        isFeatured: true,
      },
      {
        title: "UI/UX Design Workshop",
        tagline: "Learn Figma from scratch to professional-level",
        description: "A hands-on 3-hour workshop on modern UI/UX design. Learn to create stunning interfaces using Figma, understand design systems, and build your first portfolio project.\n\nBring your laptop with Figma installed.",
        category: "Workshop",
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        time: "2:00 PM",
        venue: { name: "Computer Lab 3, Block C", address: "IT Department", latitude: 28.615, longitude: 77.21 },
        mode: "hybrid",
        meetLink: "https://meet.google.com/example",
        capacity: 60,
        auraPointsReward: 40,
        skills: ["Figma", "Design", "UI/UX"],
        speakers: [{ name: "Arjun Mehta", title: "Senior Designer, Swiggy" }],
        registrationFee: "₹100",
        perks: ["Certificate", "Figma Resources", "Portfolio Template"],
        schedule: [
          { time: "2:00 PM", activity: "Introduction to Design Thinking" },
          { time: "2:45 PM", activity: "Figma Basics" },
          { time: "3:30 PM", activity: "Break" },
          { time: "3:45 PM", activity: "Hands-on Project" },
          { time: "5:00 PM", activity: "Q&A and Wrap-up" },
        ],
        isVerified: true,
      },
      {
        title: "Campus Cricket Premier League",
        tagline: "Department vs Department — who takes the trophy?",
        description: "The annual CCPL is here! 8 department teams battle it out in a week-long T20 cricket tournament. Cheer for your department and earn Aura Points!\n\nMatches are held every evening from 4 PM.",
        category: "Sports",
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        time: "4:00 PM",
        venue: { name: "Main Sports Ground", address: "Sports Complex", latitude: 28.618, longitude: 77.215 },
        mode: "offline",
        capacity: 500,
        auraPointsReward: 30,
        perks: ["Free Entry", "Live Score Updates", "Food Stalls"],
        registrationFee: "Free (spectators) | ₹500/team",
        teamSize: "11-15",
        isVerified: true,
        isFeatured: true,
      },
      {
        title: "AI in Healthcare — Guest Lecture",
        tagline: "Exploring how AI is transforming modern medicine",
        description: "Join us for an insightful lecture by Dr. Neha Kapoor from AIIMS. She'll discuss how machine learning, computer vision, and NLP are revolutionizing diagnostics, drug discovery, and patient care.\n\nOpen to all branches.",
        category: "Seminar",
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        time: "11:00 AM",
        venue: { name: "Seminar Hall, Block B", address: "Academic Building", latitude: 28.617, longitude: 77.212 },
        mode: "offline",
        capacity: 150,
        auraPointsReward: 25,
        speakers: [{ name: "Dr. Neha Kapoor", title: "AI Research Lead, AIIMS Delhi" }],
        skills: ["AI", "Healthcare", "Research"],
        registrationFee: "Free",
        perks: ["Certificate", "Q&A with Expert", "Refreshments"],
        isVerified: true,
      },
      {
        title: "Cultural Night — Stargazer",
        tagline: "Dance. Music. Drama. One epic night.",
        description: "The most awaited cultural evening of the semester! Featuring performances from 12 clubs including Western Dance, Classical, Band Night, Comedy, and Drama.\n\n🎫 Limited passes available. Register early!",
        category: "Cultural",
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        time: "6:00 PM",
        venue: { name: "Open Air Theatre", address: "Central Campus", latitude: 28.614, longitude: 77.208 },
        mode: "offline",
        capacity: 1000,
        auraPointsReward: 20,
        perks: ["Live Performances", "Food Court", "Photo Booth", "Goodies"],
        registrationFee: "₹50",
        isVerified: true,
        isFeatured: true,
      },
      {
        title: "Cloud Computing Bootcamp",
        tagline: "Get cloud-ready in one weekend",
        description: "A 2-day intensive bootcamp covering AWS fundamentals, Docker, Kubernetes, and deploying real applications on the cloud.\n\nDay 1: AWS Services + Docker\nDay 2: Kubernetes + CI/CD Pipeline\n\nPerfect for students preparing for AWS certifications.",
        category: "Workshop",
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        time: "9:00 AM",
        venue: { name: "Innovation Lab", address: "CS Department", latitude: 28.616, longitude: 77.211 },
        mode: "offline",
        capacity: 40,
        auraPointsReward: 60,
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        speakers: [
          { name: "Vikash Singh", title: "DevOps Engineer, Flipkart" },
          { name: "Ritu Agarwal", title: "Cloud Architect, AWS" },
        ],
        registrationFee: "₹200",
        perks: ["AWS Credits", "Certificate", "Hands-on Labs", "Lunch"],
        schedule: [
          { time: "9:00 AM", activity: "AWS Fundamentals" },
          { time: "11:00 AM", activity: "Docker Workshop" },
          { time: "1:00 PM", activity: "Lunch" },
          { time: "2:00 PM", activity: "Kubernetes Basics" },
          { time: "4:00 PM", activity: "Deploy a Real App" },
        ],
        isVerified: true,
      },
    ];

    const eventsToInsert = samples.map((e) => ({
      ...e,
      organizer: firstUser?._id,
    }));

    await Event.insertMany(eventsToInsert);

    res.json({ message: `Seeded ${samples.length} events` });
  } catch (error) {
    console.error("Seed Events Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getTrendingEvents,
  getEventById,
  toggleLikeEvent,
  toggleInterested,
  toggleBookmark,
  getEventsByMonth,
  getMyEvents,
  getMyRegistrations,
  verifyEvent,
  seedEvents,
};