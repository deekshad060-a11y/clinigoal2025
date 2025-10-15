const Assignment = require("../model/Assignment");
const fs = require("fs");

// Helper: Convert file to Base64 string
const fileToBase64 = (file) => {
  const data = fs.readFileSync(file.path);
  fs.unlinkSync(file.path); // remove temp file
  return { name: file.originalname, data: `data:${file.mimetype};base64,${data.toString("base64")}` };
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId, lecturerId } = req.body;
    const files = req.files?.map(fileToBase64) || [];

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      courseId,
      lecturerId,
      files,
      submissions: []
    });

    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Error creating assignment", error: err.message });
  }
};

// Get assignments by course with dynamic submitted status
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const studentId = req.user?._id || req.query.studentId; // use logged-in student or query param
    const assignments = await Assignment.find({ courseId: req.params.courseId });

    // Add `submitted` flag for each assignment
    const assignmentsWithStatus = assignments.map(a => ({
      ...a.toObject(),
      submitted: studentId ? a.submissions.some(s => s.studentId.toString() === studentId.toString()) : false
    }));

    res.json(assignmentsWithStatus);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const newFiles = req.files?.map(fileToBase64) || [];

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    assignment.title = title;
    assignment.description = description;
    assignment.dueDate = dueDate;
    assignment.files = [...(assignment.files || []), ...newFiles];

    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Error updating assignment", error: err.message });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting assignment", error: err.message });
  }
};

// Submit assignment (student upload)
exports.submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user?._id || req.body.studentId;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileData = fs.readFileSync(req.file.path);
    const base64File = `data:${req.file.mimetype};base64,${fileData.toString("base64")}`;
    fs.unlinkSync(req.file.path);

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    assignment.submissions.push({
      studentId,
      file: base64File,
      score: null,
    });

    await assignment.save();
    res.json({ message: "Assignment submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting assignment", error: err.message });
  }
};
