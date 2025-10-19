const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },

  // Track login time
  lastLogin: { type: Date, default: null },

  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  certificates: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      issuedAt: { type: Date, default: Date.now },
    },
  ],
  courseProgress: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      assignmentsCompleted: { type: Number, default: 0 },
      quizzesCompleted: { type: Number, default: 0 },
      totalAssignments: { type: Number, default: 0 },
      totalQuizzes: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
