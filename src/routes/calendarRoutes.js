const express = require("express");
const {createEvent, updateEvent, deleteEvent, getEvents} = require("../controllers/calendarController");
const {protect} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, roleMiddleware(["HR"]), createEvent);
router.put("/:eventId", protect, roleMiddleware(["HR"]), updateEvent);
router.delete("/:eventId", protect, roleMiddleware(["HR"]), deleteEvent);

router.get("/", protect, roleMiddleware(["HR",  "Employee"]), getEvents);

module.exports = router;