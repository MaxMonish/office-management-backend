const mongoose = require("mongoose");
const User = require("../models/User");

const getAllUsers = async(req, res, next) => {
    try{
        const users = await User.find()
        .select("name email profileImage lastSeen")
        .lean();
        return res.json(users);
    }catch(err){
        next(err);
    }
};

const updateProfileImage = async(req, res, next) => {
    try{
        if(!req.file){
            return res.status(400).json({
                message: "Image file is required"
            });
        }

        if(!mongoose.Types.ObjectId.isValid(req.user._id)){
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {profileImage: imagePath},
            {new: true}
        );

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json({
            message: "Profile Image updated successfully", user
        });
    
    }catch(err){
        next(err);
    }
};

module.exports = {getAllUsers, updateProfileImage};