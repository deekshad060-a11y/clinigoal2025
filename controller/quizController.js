const Quiz = require("../model/Quiz");

// Create quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, courseId, duration, questions } = req.body;
    const quiz = new Quiz({ title, courseId, duration, questions });
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
};

exports.getQuizzesByCourse = async (req, res) => {
  try {
    const studentId = req.user?._id || req.query.studentId; // adjust as per your auth
    const quizzes = await Quiz.find({ courseId: req.params.courseId });

    const quizzesWithStatus = quizzes.map(q => ({
      ...q.toObject(),
      submitted: q.submissions.some(s => s.studentId === studentId)
    }));

    res.json(quizzesWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
};


// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { title, duration, questions } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    quiz.title = title;
    quiz.duration = duration;
    quiz.questions = questions;

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error updating quiz", error: err.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
};


exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const studentId = req.user?._id || req.body.studentId; // adjust depending on auth
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] && answers[i].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score++;
      }
    });

    // Save submission
    quiz.submissions.push({ studentId, answers, score });
    await quiz.save();

    res.json({
      message: "Quiz submitted successfully!",
      score,
      total: quiz.questions.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting quiz", error: err.message });
  }
};
