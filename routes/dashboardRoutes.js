// dashboardRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const dashboardController = require("../controller/dashboardController");

router.get("/progress", authMiddleware(), dashboardController.getUserProgress);

module.exports = router;
