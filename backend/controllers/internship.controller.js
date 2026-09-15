const Internship = require("../models/Internship");
const InternshipChat = require("../models/InternshipChat");
const Notification = require("../models/Notification");
const User = require("../models/User");
const axios = require("axios");

// ═══════════════════════════════════════════════════════════════
// CREATE INTERNSHIP (Campus / Local)
// ═══════════════════════════════════════════════════════════════
const createInternship = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title || !data.company || !data.description || !data.domain || !data.duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse stipend range
    let stipendMin = 0, stipendMax = 0;
    if (data.stipend) {
      const nums = data.stipend.match(/[\d,]+/g);
      if (nums && nums.length >= 1) {
        stipendMin = parseInt(nums[0].replace(/,/g, ""));
        stipendMax = nums.length > 1 ? parseInt(nums[1].replace(/,/g, "")) : stipendMin;
      }
    }

    const internship = await Internship.create({
      ...data,
      postedBy: req.user._id,
      source: "campus",
      stipendMin,
      stipendMax,
      isVerified: true,
    });

    // Notify all users about new campus internship
    const users = await User.find({ _id: { $ne: req.user._id } }).select("_id");
    const notifications = users.map((u) => ({
      user: u._id,
      type: "internship",
      title: "🎯 New Campus Opportunity!",
      message: `${data.company} is hiring: ${data.title}`,
      link: `/careers/internships/${internship._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: "Internship posted successfully!",
      internship,
    });
  } catch (error) {
    console.error("Create Internship Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET ALL INTERNSHIPS (with advanced filtering)
// ═══════════════════════════════════════════════════════════════
const getInternships = async (req, res) => {
  try {
    const {
      domain,
      location,
      type,
      search,
      ppo,
      source,
      stipendMin,
      stipendMax,
      duration,
      experience,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };

    if (source) filter.source = source;
    if (domain) filter.domain = { $regex: domain, $options: "i" };
    if (location) filter.location = location;
    if (type) filter.type = type;
    if (ppo === "true") filter.ppo = true;
    if (experience) filter.experience = { $regex: experience, $options: "i" };

    // Stipend range filter
    if (stipendMin) filter.stipendMin = { $gte: parseInt(stipendMin) };
    if (stipendMax) filter.stipendMax = { $lte: parseInt(stipendMax) };

    // Duration filter
    if (duration) {
      filter.duration = { $regex: duration, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    switch (sortBy) {
      case "stipend_high":
        sort = { stipendMax: -1 };
        break;
      case "stipend_low":
        sort = { stipendMin: 1 };
        break;
      case "applicants":
        sort = { applicationCount: -1 };
        break;
      case "deadline":
        sort = { deadline: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const internships = await Internship.find(filter)
      .populate("postedBy", "name profileImage role department")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Internship.countDocuments(filter);
    const campusCount = await Internship.countDocuments({ ...filter, source: "campus" });
    const externalCount = await Internship.countDocuments({ ...filter, source: "external" });

    res.json({
      internships,
      total,
      campusCount,
      externalCount,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Internships Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET SINGLE INTERNSHIP
// ═══════════════════════════════════════════════════════════════
const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate("postedBy", "name profileImage department role yearOfStudy")
      .populate("applicants.user", "name profileImage department yearOfStudy skills");

    if (!internship) return res.status(404).json({ message: "Internship not found" });

    res.json(internship);
  } catch (error) {
    console.error("Get Internship Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// APPLY TO INTERNSHIP
// ═══════════════════════════════════════════════════════════════
const applyToInternship = async (req, res) => {
  try {
    const { coverLetter, resumeUrl } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });

    // Check if already applied
    const alreadyApplied = internship.applicants.some(
      (a) => a.user.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    if (internship.deadline && new Date() > new Date(internship.deadline)) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    internship.applicants.push({
      user: req.user._id,
      coverLetter,
      resumeUrl,
      status: "pending",
    });
    internship.applicationCount += 1;
    await internship.save();

    // Notify the poster
    if (internship.postedBy) {
      await Notification.create({
        user: internship.postedBy,
        type: "internship",
        title: "📩 New Application!",
        message: `${req.user.name} applied for "${internship.title}"`,
        link: `/careers/internships/${internship._id}/applicants`,
        metadata: {
          applicantId: req.user._id,
          internshipId: internship._id,
        },
      });
    }

    // Notify the applicant
    await Notification.create({
      user: req.user._id,
      type: "internship",
      title: "✅ Application Submitted",
      message: `Your application for "${internship.title}" at ${internship.company} has been submitted.`,
      link: `/careers/my-applications`,
    });

    res.json({
      message: "Application submitted!",
      applicationCount: internship.applicationCount,
    });
  } catch (error) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// APPLY EXTERNALLY (track external application in user's dashboard)
// ═══════════════════════════════════════════════════════════════
const applyExternally = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });

    // Check if already tracked
    const alreadyApplied = internship.applicants.some(
      (a) => a.user.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.json({ message: "Already tracked", applyLink: internship.applyLink || internship.sourceUrl });
    }

    // Track the external application
    internship.applicants.push({
      user: req.user._id,
      status: "pending",
      coverLetter: "Applied externally via " + (internship.sourcePlatform || "external site"),
    });
    internship.applicationCount += 1;
    await internship.save();

    // Notify the user
    await Notification.create({
      user: req.user._id,
      type: "internship",
      title: "🌐 External Application Tracked",
      message: `Your interest in "${internship.title}" at ${internship.company} has been tracked. Good luck!`,
      link: `/careers/my-applications`,
    });

    res.json({
      message: "Application tracked!",
      applyLink: internship.applyLink || internship.sourceUrl,
      applicationCount: internship.applicationCount,
    });
  } catch (error) {
    console.error("Apply Externally Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// UPDATE APPLICANT STATUS (poster action)
// ═══════════════════════════════════════════════════════════════
const updateApplicantStatus = async (req, res) => {
  try {
    const { applicantId, status, note } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });

    // Verify poster
    if (internship.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the poster can update status" });
    }

    const applicant = internship.applicants.find(
      (a) => a.user.toString() === applicantId
    );
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    const oldStatus = applicant.status;
    applicant.status = status;
    if (note) applicant.posterNote = note;
    await internship.save();

    // Notify the applicant about status change
    const statusMessages = {
      viewed: "👀 Your application has been viewed",
      shortlisted: "⭐ You've been shortlisted!",
      accepted: "🎉 Congratulations! You've been accepted!",
      rejected: "We appreciate your interest, but your application wasn't selected this time.",
    };

    const statusIcons = {
      viewed: "👀",
      shortlisted: "⭐",
      accepted: "🎉",
      rejected: "📋",
    };

    await Notification.create({
      user: applicantId,
      type: "internship",
      title: `${statusIcons[status] || "📌"} Application Update`,
      message: `${statusMessages[status] || `Your status is now: ${status}`} — ${internship.title} at ${internship.company}`,
      link: `/careers/my-applications`,
      metadata: {
        internshipId: internship._id,
        oldStatus,
        newStatus: status,
      },
    });

    // If shortlisted or accepted, auto-create a chat channel
    if (status === "shortlisted" || status === "accepted") {
      const existingChat = await InternshipChat.findOne({
        internship: internship._id,
        poster: req.user._id,
        applicant: applicantId,
      });

      if (!existingChat) {
        const systemMessage = status === "shortlisted"
          ? `${req.user.name} shortlisted you for "${internship.title}". You can now chat directly!`
          : `Congratulations! You've been accepted for "${internship.title}". Chat is now active.`;

        await InternshipChat.create({
          internship: internship._id,
          poster: req.user._id,
          applicant: applicantId,
          participants: [req.user._id, applicantId],
          messages: [
            {
              sender: req.user._id,
              content: systemMessage,
              type: "system",
              readBy: [req.user._id],
            },
          ],
          lastMessage: {
            content: systemMessage,
            sender: req.user._id,
            createdAt: new Date(),
          },
        });
      }
    }

    res.json({ message: `Applicant status updated to ${status}`, applicant });
  } catch (error) {
    console.error("Update Applicant Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET MY APPLICATIONS (for applicants)
// ═══════════════════════════════════════════════════════════════
const getMyApplications = async (req, res) => {
  try {
    const internships = await Internship.find({
      "applicants.user": req.user._id,
    })
      .populate("postedBy", "name profileImage")
      .sort({ "applicants.appliedAt": -1 });

    const applications = internships.map((intern) => {
      const myApp = intern.applicants.find(
        (a) => a.user.toString() === req.user._id.toString()
      );
      return {
        internship: {
          _id: intern._id,
          title: intern.title,
          company: intern.company,
          companyLogo: intern.companyLogo,
          domain: intern.domain,
          stipend: intern.stipend,
          duration: intern.duration,
          location: intern.location,
          city: intern.city,
          source: intern.source,
          postedBy: intern.postedBy,
          applyLink: intern.applyLink,
          sourceUrl: intern.sourceUrl,
          sourcePlatform: intern.sourcePlatform,
        },
        application: {
          status: myApp?.status || "pending",
          appliedAt: myApp?.appliedAt,
          coverLetter: myApp?.coverLetter,
          posterNote: myApp?.posterNote,
        },
      };
    });

    res.json(applications);
  } catch (error) {
    console.error("Get My Applications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET MY POSTED INTERNSHIPS (for posters)
// ═══════════════════════════════════════════════════════════════
const getMyInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.user._id })
      .populate("applicants.user", "name profileImage department yearOfStudy skills")
      .sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    console.error("My Internships Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// INTERNSHIP CHAT — SEND MESSAGE
// ═══════════════════════════════════════════════════════════════
const sendChatMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Message required" });

    const chat = await InternshipChat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Verify participant
    if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const newMsg = {
      sender: req.user._id,
      content,
      type: "text",
      readBy: [req.user._id],
      createdAt: new Date(),
    };

    chat.messages.push(newMsg);
    chat.lastMessage = {
      content,
      sender: req.user._id,
      createdAt: new Date(),
    };
    await chat.save();

    // Notify other participant
    const otherUser = chat.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    if (otherUser) {
      await Notification.create({
        user: otherUser,
        type: "internship",
        title: "💬 New Message",
        message: `${req.user.name}: ${content.substring(0, 80)}${content.length > 80 ? "..." : ""}`,
        link: `/careers/chat/${chatId}`,
      });
    }

    res.json({ message: "Message sent", chat });
  } catch (error) {
    console.error("Send Chat Message Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET MY CHATS
// ═══════════════════════════════════════════════════════════════
const getMyChats = async (req, res) => {
  try {
    const chats = await InternshipChat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate("poster", "name profileImage")
      .populate("applicant", "name profileImage")
      .populate("internship", "title company companyLogo")
      .sort({ updatedAt: -1 });

    // Count unread
    const chatsWithUnread = chats.map((chat) => {
      const unreadCount = chat.messages.filter(
        (m) =>
          m.sender.toString() !== req.user._id.toString() &&
          !m.readBy.some((r) => r.toString() === req.user._id.toString())
      ).length;
      return { ...chat.toObject(), unreadCount };
    });

    res.json(chatsWithUnread);
  } catch (error) {
    console.error("Get My Chats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET CHAT MESSAGES
// ═══════════════════════════════════════════════════════════════
const getChatMessages = async (req, res) => {
  try {
    const chat = await InternshipChat.findById(req.params.chatId)
      .populate("poster", "name profileImage")
      .populate("applicant", "name profileImage")
      .populate("internship", "title company")
      .populate("messages.sender", "name profileImage");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Verify participant
    if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    // Mark messages as read
    let modified = false;
    chat.messages.forEach((msg) => {
      if (
        msg.sender._id.toString() !== req.user._id.toString() &&
        !msg.readBy.some((r) => r.toString() === req.user._id.toString())
      ) {
        msg.readBy.push(req.user._id);
        modified = true;
      }
    });
    if (modified) await chat.save();

    res.json(chat);
  } catch (error) {
    console.error("Get Chat Messages Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════
// FETCH EXTERNAL INTERNSHIPS (from multiple free APIs)
// ═══════════════════════════════════════════════════════════════
const fetchExternalInternships = async (req, res) => {
  try {
    // Check if we already fetched recently (within 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const recentExternal = await Internship.countDocuments({
      source: "external",
      createdAt: { $gte: sixHoursAgo },
    });

    if (recentExternal > 20) {
      return res.json({ message: "External data is fresh", fetched: 0 });
    }

    let allJobs = [];

    // ═══ SOURCE 1: Remotive API (remote tech jobs) ═══
    const remotiveCategories = [
      "software-dev", "design", "data", "devops", "product",
      "customer-support", "marketing", "sales", "qa",
    ];

    for (const category of remotiveCategories) {
      try {
        const response = await axios.get(
          `https://remotive.com/api/remote-jobs?category=${category}&limit=25`,
          { timeout: 10000 }
        );
        if (response.data?.jobs) {
          allJobs = allJobs.concat(
            response.data.jobs.map((j) => ({ ...j, _source: "Remotive", _category: category }))
          );
        }
      } catch (err) {
        console.log(`Remotive - Failed ${category}:`, err.message);
      }
    }

    // ═══ SOURCE 2: Arbeitnow API (European + remote jobs) ═══
    try {
      const arbRes = await axios.get(
        "https://www.arbeitnow.com/api/job-board-api",
        { timeout: 10000 }
      );
      if (arbRes.data?.data) {
        allJobs = allJobs.concat(
          arbRes.data.data.slice(0, 80).map((j) => ({
            id: `arb_${j.slug}`,
            title: j.title,
            company_name: j.company_name,
            company_logo: j.company_logo || "",
            description: j.description || "",
            url: j.url || "",
            tags: j.tags || [],
            salary: j.salary || "",
            job_type: j.remote ? "remote" : "full_time",
            category: j.tags?.[0] || "Technology",
            publication_date: j.created_at,
            _source: "Arbeitnow",
            _category: j.tags?.[0] || "technology",
          }))
        );
      }
    } catch (err) {
      console.log("Arbeitnow - Failed:", err.message);
    }

    // ═══ SOURCE 3: Jobicy API (remote dev jobs) ═══
    try {
      const jobicyRes = await axios.get(
        "https://jobicy.com/api/v2/remote-jobs?count=50",
        { timeout: 10000 }
      );
      if (jobicyRes.data?.jobs) {
        allJobs = allJobs.concat(
          jobicyRes.data.jobs.map((j) => ({
            id: `jobicy_${j.id}`,
            title: j.jobTitle || j.title || "",
            company_name: j.companyName || "",
            company_logo: j.companyLogo || "",
            description: j.jobDescription || "",
            url: j.url || "",
            tags: j.jobIndustry ? [j.jobIndustry] : [],
            salary: j.annualSalaryMin && j.annualSalaryMax
              ? `$${j.annualSalaryMin} - $${j.annualSalaryMax}/yr`
              : j.annualSalaryMin ? `$${j.annualSalaryMin}+/yr` : "",
            job_type: j.jobType || "full_time",
            category: j.jobIndustry?.[0] || "Technology",
            publication_date: j.pubDate,
            _source: "Jobicy",
            _category: j.jobIndustry?.[0] || "technology",
          }))
        );
      }
    } catch (err) {
      console.log("Jobicy - Failed:", err.message);
    }

    // ═══ Map all jobs to our schema ═══
    const domainMap = {
      "software-dev": "Software Development",
      "design": "Design",
      "data": "Data Science",
      "devops": "DevOps",
      "product": "Product",
      "customer-support": "Customer Support",
      "marketing": "Marketing",
      "sales": "Sales",
      "qa": "QA & Testing",
      "technology": "Technology",
    };

    let saved = 0;

    for (const job of allJobs) {
      const externalId = job._source
        ? `${job._source.toLowerCase()}_${job.id}`
        : `remotive_${job.id}`;

      // Skip if already exists
      const exists = await Internship.findOne({ externalId });
      if (exists) continue;

      // Extract salary info
      let stipend = "Competitive";
      let stipendMin = 0, stipendMax = 0;
      if (job.salary) {
        stipend = job.salary;
        const nums = job.salary.match(/[\d,]+/g);
        if (nums) {
          stipendMin = parseInt(nums[0]?.replace(/,/g, "") || 0);
          stipendMax = nums.length > 1 ? parseInt(nums[1]?.replace(/,/g, "") || 0) : stipendMin;
        }
      }

      // Clean description (strip HTML)
      const cleanDesc = (job.description || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 2000);

      // Extract skills from tags
      const skills = Array.isArray(job.tags) ? job.tags.slice(0, 10) : [];

      const sourcePlatform = job._source || "Remotive";
      const applyLink = job.url || "";

      try {
        await Internship.create({
          title: job.title?.substring(0, 200) || "Untitled Position",
          company: job.company_name || "Unknown Company",
          companyLogo: job.company_logo || "",
          description: cleanDesc || "No description available.",
          domain: domainMap[job._category?.toLowerCase()] || job.category || "Technology",
          stipend,
          stipendMin,
          stipendMax,
          duration: "Varies",
          location: "Remote",
          type: job.job_type === "full_time" ? "full-time"
            : job.job_type === "contract" ? "project"
            : job.job_type === "part_time" ? "part-time"
            : "internship",
          source: "external",
          externalId,
          sourceUrl: applyLink,
          sourcePlatform,
          applyLink,
          skills,
          isActive: true,
          isVerified: true,
          experience: "Varies",
          postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
          companyDescription: "",
        });
        saved++;
      } catch (saveErr) {
        // Skip duplicates or validation errors
        if (saveErr.code !== 11000) {
          console.log(`Failed to save job: ${job.title}`, saveErr.message);
        }
      }
    }

    res.json({
      message: `Fetched from ${3} sources. Found ${allJobs.length} jobs, saved ${saved} new ones.`,
      fetched: saved,
      total: allJobs.length,
      sources: {
        remotive: allJobs.filter((j) => j._source === "Remotive").length,
        arbeitnow: allJobs.filter((j) => j._source === "Arbeitnow").length,
        jobicy: allJobs.filter((j) => j._source === "Jobicy").length,
      },
    });
  } catch (error) {
    console.error("Fetch External Error:", error);
    res.status(500).json({ message: "Failed to fetch external internships" });
  }
};

// ═══════════════════════════════════════════════════════════════
// SEED CAMPUS INTERNSHIPS
// ═══════════════════════════════════════════════════════════════
const seedInternships = async (req, res) => {
  try {
    const count = await Internship.countDocuments({ source: "campus" });
    if (count > 0) return res.json({ message: "Campus internships already exist" });

    const firstUser = await User.findOne({});

    const campusSamples = [
      {
        title: "Full Stack Web Developer",
        company: "Campus Startup Hub",
        description: "Build and maintain web applications for our college startup incubator. Work on real projects with mentorship from senior developers. Perfect for students looking to build a strong portfolio.\n\nResponsibilities:\n• Develop responsive web apps using React and Node.js\n• Collaborate with design team on UI/UX decisions\n• Participate in weekly code reviews\n• Deploy and maintain applications on cloud platforms",
        requirements: "Proficiency in React.js and Node.js, basic understanding of MongoDB, Git version control",
        responsibilities: "Frontend and backend development, API design, database management, deployment",
        domain: "Full Stack",
        stipend: "₹15,000/month",
        stipendMin: 15000, stipendMax: 15000,
        duration: "3 Months",
        location: "Onsite",
        city: "Campus",
        ppo: false,
        type: "internship",
        skills: ["React", "Node.js", "MongoDB", "Express", "Git"],
        perks: ["Certificate", "GitHub Recognition", "Mentorship", "Real Project Experience"],
        openings: 5,
        source: "campus",
        isVerified: true,
        experience: "Fresher",
        whoCanApply: "Any year, any branch — passion for coding required",
      },
      {
        title: "Campus App UI/UX Designer",
        company: "Student Council Tech Wing",
        description: "Redesign the official campus app interface using modern design principles. You'll work directly with the Student Council tech team.\n\nWhat you'll do:\n• User research and wireframing\n• Create high-fidelity prototypes in Figma\n• Conduct usability testing with students\n• Design a full design system for the campus app",
        requirements: "Figma proficiency, basic understanding of design systems, portfolio preferred",
        domain: "Design",
        stipend: "₹8,000/month",
        stipendMin: 8000, stipendMax: 8000,
        duration: "2 Months",
        location: "Hybrid",
        city: "Campus",
        ppo: false,
        type: "project",
        skills: ["Figma", "UI Design", "Prototyping", "User Research", "Design Systems"],
        perks: ["Certificate", "Portfolio Piece", "Direct Impact on Campus"],
        openings: 2,
        source: "campus",
        isVerified: true,
        experience: "Fresher",
        whoCanApply: "2nd year and above, design portfolio preferred",
      },
      {
        title: "ML Research Assistant",
        company: "CS Department — Prof. Sharma's Lab",
        description: "Assist in ongoing machine learning research focused on NLP and computer vision applications. Contribute to academic papers and gain valuable research experience.\n\nProject: Building a domain-specific language model for educational content summarization.",
        requirements: "Python, PyTorch/TensorFlow, Statistics, NLP basics",
        domain: "AI/ML",
        stipend: "₹12,000/month",
        stipendMin: 12000, stipendMax: 12000,
        duration: "4 Months",
        location: "Onsite",
        city: "Campus",
        ppo: false,
        type: "project",
        skills: ["Python", "PyTorch", "NLP", "Statistics", "Research"],
        perks: ["Research Paper Credit", "Professor Recommendation", "Conference Travel"],
        openings: 3,
        source: "campus",
        isVerified: true,
        experience: "Intermediate",
        whoCanApply: "3rd year CSE/AI/ML students, ML coursework completed",
      },
      {
        title: "Social Media & Content Manager",
        company: "Placement Cell",
        description: "Manage the placement cell's social media presence. Create engaging content about placement drives, company visits, and student success stories.\n\nYou'll handle Instagram, LinkedIn, and the placement portal's blog section.",
        requirements: "Content writing skills, Canva/design tools, social media savvy",
        domain: "Marketing",
        stipend: "₹5,000/month",
        stipendMin: 5000, stipendMax: 5000,
        duration: "6 Months",
        location: "Hybrid",
        city: "Campus",
        ppo: false,
        type: "part-time",
        skills: ["Content Writing", "Canva", "Social Media", "SEO", "Analytics"],
        perks: ["Certificate", "Placement Cell Network", "Exclusive Placement Insights"],
        openings: 4,
        source: "campus",
        isVerified: true,
        experience: "Fresher",
        whoCanApply: "Any year, any branch — creative minds welcome",
      },
      {
        title: "Backend Developer — College ERP System",
        company: "IT Department",
        description: "Help build and maintain the college ERP system's backend modules. Focus on attendance tracking, grade management, and notification systems.\n\nThis is a paid project with the IT department to modernize legacy systems.",
        requirements: "Node.js/Django/Spring Boot, SQL, RESTful APIs",
        domain: "Backend",
        stipend: "₹20,000/month",
        stipendMin: 20000, stipendMax: 20000,
        duration: "4 Months",
        location: "Onsite",
        city: "Campus",
        ppo: true,
        type: "internship",
        skills: ["Node.js", "PostgreSQL", "REST APIs", "Docker", "System Design"],
        perks: ["PPO Consideration", "Certificate", "IT Dept. Recommendation", "Real Impact"],
        openings: 2,
        source: "campus",
        isVerified: true,
        experience: "Intermediate",
        whoCanApply: "3rd/4th year CSE/IT students",
      },
    ];

    const samplesToInsert = campusSamples.map((s) => ({
      ...s,
      postedBy: firstUser?._id,
    }));

    await Internship.insertMany(samplesToInsert);

    res.json({ message: `Seeded ${campusSamples.length} campus internships` });
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createInternship,
  getInternships,
  getInternshipById,
  applyToInternship,
  applyExternally,
  updateApplicantStatus,
  getMyApplications,
  getMyInternships,
  sendChatMessage,
  getMyChats,
  getChatMessages,
  fetchExternalInternships,
  seedInternships,
};
