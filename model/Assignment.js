const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lecturerId: String,
  files: [
    { name: String, data: String }
  ],
  submissions: [
    { studentId: String, file: String, score: Number }
  ]
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
