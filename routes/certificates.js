const express = require("express");
const Certificate =require("../model/Certificate.js");

const router = express.Router();

/**
 * @route POST /api/certificates
 * @desc Store generated certificate
 */
router.post("/", async (req, res) => {
  try {
    const { studentId, studentName, courseId, courseTitle, certificateURL } = req.body;

    if (!studentId || !studentName || !courseId || !courseTitle || !certificateURL) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const certificate = new Certificate({
      studentId,
      studentName,
      courseId,
      courseTitle,
      certificateURL,
    });

    await certificate.save();
    res.status(201).json({ message: "Certificate stored successfully", certificate });
  } catch (error) {
    console.error("❌ Error saving certificate:", error);
    res.status(500).json({ error: "Failed to save certificate" });
  }
});

/**
 * @route GET /api/certificates/:studentId
 * @desc Get all certificates for a student
 */
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const certificates = await Certificate.find({ studentId }).sort({ issueDate: -1 });

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ message: "No certificates found for this student" });
    }

    res.json(certificates);
  } catch (error) {
    console.error("❌ Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

module.exports=router;
