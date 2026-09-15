const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/event.routes");
const techIssuesRoutes = require("./routes/techIssues.routes");
const noteRoutes = require("./routes/note.routes");
const hackathonRoutes = require("./routes/hackathon.routes");
const postRoutes = require("./routes/post.routes");
const groupRoutes = require("./routes/group.routes");
const internshipRoutes = require("./routes/internship.routes");
const referralRoutes = require("./routes/referral.routes");
const notificationRoutes = require("./routes/notification.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const dmRoutes = require("./routes/dm.routes");
const mlRoutes = require("./routes/ml.routes");

connectDB();

const app = express();

/**
 * MIDDLEWARES
 */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/tech-issues", techIssuesRoutes);
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/events", eventRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dm", dmRoutes);
app.use("/api/ml", mlRoutes);

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.send("Campus Connect API running 🚀");
});

/**
 * SERVER
 */
// 🔴 TEMP: global error logger (remove later)
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
