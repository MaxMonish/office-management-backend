const express = require("express");
const {createTask, getMyTasks, getAllTasks, updateTaskStatus} = require("../controllers/taskController");
const {protect} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, roleMiddleware(["HR"]), createTask);
router.get("/all", protect, roleMiddleware(["HR"]), getAllTasks);

router.get("/my", protect, roleMiddleware(["Employee", "HR"]), getMyTasks);
router.put("/:taskId/status", protect, roleMiddleware(["Employee", "HR"]), updateTaskStatus);

module.exports = router;