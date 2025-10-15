const mongoose = require("mongoose");

const userCourseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  completedVideos: [{ type: Number }], // store indexes of completed videos
});

module.exports = mongoose.model("UserCourseProgress", userCourseProgressSchema);
