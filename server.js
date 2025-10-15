require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const authMiddleware = require("./middleware/auth");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/auth", require("./routes/userRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/assignments", require("./routes/assignmentRoutes"));
app.use("/quizzes", require("./routes/quizRoutes"));
app.use("/progress", require("./routes/progressroutes"));

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api/feedback", feedbackRoutes);

app.use("/", require("./routes/certificateRoutes"));

const certificateRoutes = require("./routes/certificates.js");
app.use("/api/certificates", certificateRoutes);

// FIXED: Enrollment routes - use consistent path
const enrollmentRoutes = require("./routes/enrollment");
app.use("/enrollments", enrollmentRoutes); // Changed from "/api" to "/api/enrollments"

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));