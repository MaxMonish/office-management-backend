const express = require("express");

const router = express.Router();

const {getHRDashboardStats, getEmployeeDashboardStats} = require("../controllers/dashboardController");

const {protect} = require("../middleware/authMiddleware");

router.get("/hr-stats", protect, getHRDashboardStats);

router.get("/employee-stats", protect, getEmployeeDashboardStats);

module.exports = router;