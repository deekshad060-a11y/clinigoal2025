const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  issueCertificate,
  getCertificates,
} = require("../controller/certificateController");

// Route to issue certificate after course completion
router.post("/courses/:courseId/complete", issueCertificate);

// Route to fetch certificate count (requires authentication)
router.get("/api/dashboard/certificates", authMiddleware(), getCertificates);

module.exports = router;
