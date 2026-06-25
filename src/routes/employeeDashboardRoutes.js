const express = require("express");

const router = express.Router();

const {getEmployeeDashboard} = require("../controllers/employeeDashboardController");

const {protect} = require("../middleware/authMiddleware");

router.get("/", protect, getEmployeeDashboard);

module.exports = router;