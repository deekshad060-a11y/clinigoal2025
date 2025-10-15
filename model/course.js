
const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: String,
  fees: String,
  image: String,
  videos: [String],
  materials: [String],
  lecturerId: String,
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});
 
module.exports =mongoose.models.Course || mongoose.model("Course", courseSchema);