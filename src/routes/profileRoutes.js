const express = require("express");
const {getMyProfile, updateProfile, changePassword, updateProfileImage} = require("../controllers/profileController");
const {protect} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/me", protect, getMyProfile);

router.put("/", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.put("/profile-image", protect, upload.single("image"), updateProfileImage);

module.exports = router;