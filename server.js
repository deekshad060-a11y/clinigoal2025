require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const authMiddleware = require("./middleware/auth");

// ------------------- CORS -------------------
app.use(cors({
  origin: ['https://clinigoal.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ------------------- Middleware -------------------
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------- MongoDB -------------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ------------------- Routes -------------------
app.use("/auth", require("./routes/userRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/assignments", require("./routes/assignmentRoutes"));
app.use("/quizzes", require("./routes/quizRoutes"));
app.use("/progress", require("./routes/progressroutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/", require("./routes/certificateRoutes"));
app.use("/api/certificates", require("./routes/certificates.js"));
app.use("/enrollments", require("./routes/enrollment"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));


// ------------------- Root -------------------
app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
