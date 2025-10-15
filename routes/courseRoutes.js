const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const courseController = require("../controller/courseController");
const Course = require('../model/course');
const User = require("../model/user");
const authMiddleware = require("../middleware/auth");

// Get single course
router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
});

// Enroll in course
router.post("/enroll/:courseId", authMiddleware(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (!user.enrolledCourses) user.enrolledCourses = [];
    if (!course.enrolledStudents) course.enrolledStudents = [];

    // Prevent duplicate enrollment
    if (user.enrolledCourses.some(c => c.equals(course._id))) {
      return res.status(409).json({ success: false, message: "Already enrolled" });
    }

    // Update both User and Course
    user.enrolledCourses.push(course._id);
    course.enrolledStudents.push(user._id);

    await user.save();
    await course.save();

    res.status(200).json({ 
      success: true, 
      message: "Enrolled successfully", 
      enrolledCourses: user.enrolledCourses.length,
      totalEnrollment: course.enrolledStudents.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Create course (with file upload)
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 10 },
    { name: "materials", maxCount: 10 },
  ]),
  courseController.createCourse
);

// Get all courses
router.get("/", courseController.getAllCourses);

// Get courses by lecturer
router.get("/lecturer/:lecturerId", courseController.getCoursesByLecturer);

// Update course
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 10 },
    { name: "materials", maxCount: 10 },
  ]),
  courseController.updateCourse
);

// Delete course
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
