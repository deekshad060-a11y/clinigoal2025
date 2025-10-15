const express = require("express");
const router = express.Router();
const quizController = require("../controller/quizController");

// Create quiz
router.post("/", quizController.createQuiz);

// Get quizzes by course
router.get("/:courseId", quizController.getQuizzesByCourse);

// Update quiz
router.put("/:id", quizController.updateQuiz);

// Delete quiz
router.delete("/:id", quizController.deleteQuiz);


router.post("/submit/:id", quizController.submitQuiz);

module.exports = router;
