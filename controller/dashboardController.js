// dashboardController.js
const Assignment = require("../model/Assignment");
const Quiz = require("../model/Quiz");

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id; // logged-in user

    // Count submitted assignments
    const assignments = await Assignment.find({ "submissions.studentId": userId });
    const assignmentsCompleted = assignments.length;

    // Count submitted quizzes
    const quizzes = await Quiz.find({ "submissions.studentId": userId });
    const quizzesCompleted = quizzes.length;

    res.json({
      assignmentsCompleted,
      quizzesCompleted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user progress", error: err.message });
  }
};
