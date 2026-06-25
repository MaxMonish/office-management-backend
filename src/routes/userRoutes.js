const express = require("express");
const {getAllUsers} = require("../controllers/userController");
const {protect} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const {updateProfileImage} = require("../controllers/profileController");

const router = express.Router();

router.get("/", protect, roleMiddleware(["HR"]), getAllUsers);

router.put("/update-profile-image", protect, upload.single("image"), updateProfileImage);

module.exports = router;