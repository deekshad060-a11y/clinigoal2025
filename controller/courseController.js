const fs = require("fs");
const Course = require("../model/course");
const Assignment = require("../model/Assignment");
const Quiz = require("../model/Quiz");
 // ✅ Make sure this model exists

// Helper: Convert file to Base64 string and delete temp file
const fileToBase64 = (file) => {
  const data = fs.readFileSync(file.path);
  fs.unlinkSync(file.path);
  return `data:${file.mimetype};base64,${data.toString("base64")}`;
};

// 🟢 Create course (same as before)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, duration, lecturerId, fees } = req.body;

    const existingCourse = await Course.findOne({
      lecturerId,
      title: { $regex: new RegExp("^" + title + "$", "i") },
    });

    if (existingCourse) {
      return res.status(400).json({
        message: "A course with this title already exists for this lecturer!",
      });
    }

    const imageFile = req.files?.image?.[0];
    const image = imageFile ? fileToBase64(imageFile) : null;

    const videos = req.files?.videos?.map(fileToBase64) || [];
    const materials = req.files?.materials?.map(fileToBase64) || [];

    const course = new Course({
      title,
      description,
      duration,
      fees,
      image,
      lecturerId,
      videos,
      materials,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error("❌ Error uploading course:", err);
    res.status(500).json({
      message: "Error uploading course",
      error: err.message,
    });
  }
};

// 🟢 Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching courses",
      error: err.message,
    });
  }
};

// 🟢 Get courses by lecturer
exports.getCoursesByLecturer = async (req, res) => {
  try {
    const courses = await Course.find({ lecturerId: req.params.lecturerId });
    res.json(courses);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching courses",
      error: err.message,
    });
  }
};

// 🟢 Update course (same as before)
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, duration, fees } = req.body;

    const newVideos = req.files?.videos?.map(fileToBase64) || [];
    const newMaterials = req.files?.materials?.map(fileToBase64) || [];
    const newImage = req.files?.image?.[0]
      ? fileToBase64(req.files.image[0])
      : null;

    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prevent duplicate title
    if (title && title.toLowerCase() !== existingCourse.title.toLowerCase()) {
      const duplicate = await Course.findOne({
        lecturerId: existingCourse.lecturerId,
        title: { $regex: new RegExp("^" + title + "$", "i") },
      });
      if (duplicate) {
        return res.status(400).json({
          message: "Another course with this title already exists!",
        });
      }
    }

    const updatedVideos = [...(existingCourse.videos || []), ...newVideos];
    const updatedMaterials = [
      ...(existingCourse.materials || []),
      ...newMaterials,
    ];

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        duration,
        fees,
        videos: updatedVideos,
        materials: updatedMaterials,
        image: newImage || existingCourse.image,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating course:", err);
    res.status(500).json({
      message: "Error updating course",
      error: err.message,
    });
  }
};

// 🟥 Delete course (Cascade delete)
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete related data
    await Promise.all([
      Assignment.deleteMany({ courseId }),
      Quiz.deleteMany({ courseId }),
    ]);

    // Delete the course itself
    await Course.findByIdAndDelete(courseId);

    res.json({
      message: "✅ Course and all related assignments, quizzes, and enrollments deleted successfully!",
    });
  } catch (err) {
    console.error("❌ Error deleting course:", err);
    res.status(500).json({
      message: "Error deleting course and related data",
      error: err.message,
    });
  }
};
