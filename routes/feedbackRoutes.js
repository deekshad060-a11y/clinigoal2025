const express = require("express");
const router = express.Router();
const  Feedback=require("../model/Feedback");

// POST: Submit feedback    
router.post("/submit", async (req, res) => {
  try {
    const { userId, courseId, rating, comment } = req.body;

    if (!userId || !courseId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const feedback = new Feedback({
      userId,
      courseId,
      rating,
      comment
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET: Get all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "name email")       // get student info
      .populate("courseId", "title")         // get course info
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feedback", error: err.message });
  }
});



// GET: Get feedback by user
router.get("/user/:userId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.params.userId })
      .populate("courseId", "title") // get course title for each feedback
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user feedback", error: err.message });
  }
});

module.exports = router;
