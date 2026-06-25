const express = require("express");
const {applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus} = require("../controllers/leaveController");
const {protect} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, roleMiddleware(["Employee", "HR"]), applyLeave);
router.get("/my", protect, roleMiddleware(["Employee", "HR"]), getMyLeaves);

router.get("/all", protect, roleMiddleware(["HR"]), getAllLeaves);
router.put("/:leaveId/status", protect, roleMiddleware(["HR"]), updateLeaveStatus);

module.exports = router;