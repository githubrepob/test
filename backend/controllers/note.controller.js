const Note = require("../models/Note");
const User = require("../models/User");
const { callGeminiAPI } = require("../config/geminiService");

// CREATE NOTE
const createNote = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      semester,
      branch,
      category,
      fileUrl,
      filePublicId,
      fileName,
      fileSize,
      tags,
    } = req.body;

    if (!title || !subject || !semester || !branch || !category || !fileUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const note = await Note.create({
      title,
      description,
      subject,
      semester,
      branch,
      category,
      fileUrl,
      filePublicId,
      fileName,
      fileSize,
      tags: tags || [],
      uploadedBy: req.user._id,
    });

    // Award aura points for uploading
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { auraPoints: 10 },
    });

    res.status(201).json({
      message: "Note uploaded! +10 Aura Points",
      note,
    });
  } catch (error) {
    console.error("Create Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL NOTES with filters
const getNotes = async (req, res) => {
  try {
    const { semester, branch, category, subject, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (category) filter.category = category;
    if (subject) filter.subject = { $regex: subject, $options: "i" };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const notes = await Note.find(filter)
      .populate("uploadedBy", "name profileImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Note.countDocuments(filter);

    res.json({ notes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE NOTE
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("uploadedBy", "name profileImage department");

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (error) {
    console.error("Get Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DOWNLOAD NOTE — costs aura points
const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Don't charge if user uploaded it
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      const user = await User.findById(req.user._id);
      if (user.auraPoints < 5) {
        return res.status(403).json({
          message: "Not enough Aura Points. You need at least 5 points to download.",
        });
      }
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { auraPoints: -5 },
      });
    }

    // Increment download count
    note.downloads += 1;
    await note.save();

    // Give uploader points
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      await User.findByIdAndUpdate(note.uploadedBy, {
        $inc: { auraPoints: 2 },
      });
    }

    res.json({
      message: "Download authorized",
      fileUrl: note.fileUrl,
      downloads: note.downloads,
    });
  } catch (error) {
    console.error("Download Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GENERATE SUMMARY — AI-generated from the actual note metadata/description.
const generateSummary = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.summary) return res.json({ summary: note.summary });

    const source = [
      `Title: ${note.title}`,
      `Subject: ${note.subject}`,
      `Category: ${note.category}`,
      `Branch: ${note.branch}`,
      `Semester: ${note.semester}`,
      `Tags: ${(note.tags || []).join(", ")}`,
      `Description: ${note.description || "No description supplied."}`,
    ].join("\n");

    const summary = await callGeminiAPI(
      `Create a concise student-friendly study summary from the following note information. Clearly state if the source material is only metadata/description and not the full uploaded PDF.\n\n${source}`,
      { systemInstruction: "You are a factual academic summarizer. Do not invent topics that are not present in the source." }
    );

    note.summary = summary;
    await note.save();
    return res.json({ summary, generatedBy: "Gemini" });
  } catch (error) {
    console.error("Summary Error:", error.response?.data || error.message);
    return res.status(503).json({ message: "AI summary unavailable. Configure GEMINI_API_KEY and retry.", code: "AI_UNAVAILABLE" });
  }
};

// RATE NOTE
const rateNote = async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: "Score must be between 1-5" });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const existingRating = note.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.score = score;
    } else {
      note.ratings.push({ user: req.user._id, score });
    }

    // Recalculate average
    const total = note.ratings.reduce((sum, r) => sum + r.score, 0);
    note.averageRating = total / note.ratings.length;

    await note.save();

    res.json({
      message: "Rating submitted",
      averageRating: note.averageRating,
    });
  } catch (error) {
    console.error("Rate Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE NOTE
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MY NOTES
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("My Notes Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  downloadNote,
  generateSummary,
  rateNote,
  deleteNote,
  getMyNotes,
};
