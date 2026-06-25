const express = require("express");
const {registerUser, loginUser} = require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/me", protect, roleMiddleware(["Employee"]), (req, res) => {
    res.json({message: "Employee Profile", user: req.user}); 
});

router.get("/hr-only", protect, roleMiddleware(["HR"]), (req, res) => {
    res.json({message: "Welcome HR, only you can access this", user:req.user});
});

router.get("/logout", (req, res) => {
    res.cookie("token", "", {maxAge: 0});
    res.json({message: "Logged out successfully"});
});

module.exports = router;