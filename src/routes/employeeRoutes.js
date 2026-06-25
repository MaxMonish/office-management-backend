const express = require("express");

const router = express.Router();

const {getAllEmployees, getEmployeeById} = require("../controllers/employeeController");

const {protect} = require("../middleware/authMiddleware");

router.get("/", protect, getAllEmployees);

router.get("/:id", protect, getEmployeeById);

module.exports = router;