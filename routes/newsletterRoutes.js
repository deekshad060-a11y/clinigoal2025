// routes/newsletterRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configure Nodemailer (you already have Gmail credentials in .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Newsletter subscription endpoint
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Send confirmation email to the user
    await transporter.sendMail({
      from: `"Clinigoal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to Clinigoal Newsletter!",
      text: `Hello! Thank you for subscribing to Clinigoal. 
Stay tuned for updates about new courses, webinars, and special offers.`,
    });

    // (Optional) Send notification email to yourself/admin
    await transporter.sendMail({
      from: `"Clinigoal" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🆕 New Newsletter Subscriber",
      text: `A new user has subscribed: ${email}`,
    });

    res.json({ message: "Subscription successful! Check your email for confirmation." });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ message: "Failed to send email. Please try again later." });
  }
});

module.exports = router;
