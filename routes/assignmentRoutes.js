const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const assignmentController = require("../controller/assignmentController");
const authMiddleware = require("../middleware/auth");

// Create assignment with file upload
router.post("/", upload.array("files", 10), assignmentController.createAssignment);

// Get assignments by course
router.get("/:courseId", assignmentController.getAssignmentsByCourse);

// Update assignment (edit)
router.put("/:id", upload.array("files", 10), assignmentController.updateAssignment);

// Delete assignment
router.delete("/:id", assignmentController.deleteAssignment);

router.post(
  "/submit/:id",
  authMiddleware(), // ensure student is logged in
  upload.single("file"),
  assignmentController.submitAssignment
);

module.exports = router;
