const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  duration: Number,
  questions: [
    { question: String, options: [String], correctAnswer: String }
  ],
  submissions: [
    {
      studentId: { type: String, required: true },
      answers: [String],
      score: Number,
      submittedAt: { type: Date, default: Date.now }
    }
  ]
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
