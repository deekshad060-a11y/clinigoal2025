const User = require("../model/user");

// Issue certificate when course is completed
exports.issueCertificate = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.body.studentId;

  try {
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already issued
    const alreadyIssued = user.certificates.some(
      (c) => c.courseId.toString() === courseId
    );

    if (!alreadyIssued) {
      user.certificates.push({ courseId });
      await user.save();
    }

    res.json({ success: true, certificates: user.certificates });
  } catch (err) {
    console.error("Error issuing certificate:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch total certificate count for dashboard
exports.getCertificates = async (req, res) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ certificateCount: user.certificates.length });
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server error" });
  }
};
