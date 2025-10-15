const express = require("express");
const router = express.Router();
const { calculateCourseProgress } = require("../controller/progressController");
const authMiddleware = require("../middleware/auth");
const Assignment = require("../model/Assignment");
const Quiz = require("../model/Quiz");
const Course = require("../model/course");
const User=require("../model/user");


// Get and calculate current user's progress
router.get("/me", authMiddleware(), async (req, res) => {
  try {
    const progress = await calculateCourseProgress(req.user._id);
    res.json({ userId: req.user._id, name: req.user.name, progress });
  } catch (err) {
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
});

router.get("/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // 1️⃣ Get all assignments & quizzes for this course
    const assignments = await Assignment.find({ courseId });
    const quizzes = await Quiz.find({ courseId });

    // 2️⃣ Collect all student IDs enrolled (from submissions)
    const studentIdsSet = new Set();

    assignments.forEach(a => a.submissions.forEach(s => studentIdsSet.add(s.studentId)));
    quizzes.forEach(q => q.submissions.forEach(s => studentIdsSet.add(s.studentId)));

    const studentIds = Array.from(studentIdsSet);

    // 3️⃣ Fetch full student data
    const students = await User.find({ _id: { $in: studentIds } });

    // 4️⃣ Calculate assignment & quiz completion per student
    const studentProgress = students.map(student => {
      const assignmentsCompleted = assignments.filter(a =>
        a.submissions.some(s => s.studentId.toString() === student._id.toString())
      ).length;

      const quizzesCompleted = quizzes.filter(q =>
        q.submissions.some(s => s.studentId.toString() === student._id.toString())
      ).length;

      return {
        _id: student._id,
        name: student.name,        // ✅ include name
        assignmentsCompleted,
        totalAssignments: assignments.length,
        quizzesCompleted,
        totalQuizzes: quizzes.length
      };
    });

    res.json({
      title: `Course Progress`,
      totalEnrolled: students.length,
      students: studentProgress
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
});


module.exports = router;
