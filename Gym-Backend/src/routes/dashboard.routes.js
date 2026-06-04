const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");

// Apply protection middleware
router.use(protect);

// GET /api/dashboard/stats
router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
