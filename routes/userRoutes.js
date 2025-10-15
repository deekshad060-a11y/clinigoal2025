const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Assignment = require("../model/Assignment");
const Quiz = require("../model/Quiz");
const authMiddleware = require("../middleware/auth");
const authController = require("../controller/authController");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ----------------- REGISTER -----------------
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Registration successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name email avatar enrolledCourses");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// routes/userRoutes.js
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email avatar enrolledCourses");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Get user-specific stats
router.get("/dashboard-stats/:userId", authMiddleware(), async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Assignments submitted by this user
    const allAssignments = await Assignment.find({});
    const completedAssignments = allAssignments.filter(a =>
      a.submissions.some(s => s.studentId === userId)
    ).length;

    // ✅ Quizzes submitted by this user
    const allQuizzes = await Quiz.find({});
    const completedQuizzes = allQuizzes.filter(q =>
      q.submissions.some(s => s.studentId === userId)
    ).length;

    res.json({
      totalAssignments: allAssignments.length,
      completedAssignments,
      totalQuizzes: allQuizzes.length,
      completedQuizzes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Existing routes
router.get("/students", authController.getAllStudents);

// Add this:
router.delete("/students/:id", authController.deleteStudent);
router.delete("/:id", authController.deleteStudent);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
