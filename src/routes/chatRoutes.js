const express = require("express");
const {sendMessage, getChat, getChatContacts, getAllUsers} = require("../controllers/chatController");
const {protect} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/users", protect, roleMiddleware(["HR", "Employee"]), getAllUsers);

router.post("/", protect, roleMiddleware(["HR", "Employee"]), sendMessage);
router.get("/contacts", protect, roleMiddleware(["HR", "Employee"]), getChatContacts);
router.get("/:userId", protect, roleMiddleware(["HR", "Employee"]), getChat);

module.exports = router;