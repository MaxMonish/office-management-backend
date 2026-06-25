const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");

const getMyProfile = async(req, res, next) => {
    try{
        const user = await User.findById(req.user._id)
        .select("-password");
        
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json(user);
    }catch(err){
        next(err);
    }
};

const updateProfile = async(req, res, next) => {
    try{
        const {name, email} = req.body;

        const user = await User.findById(req.user._id);

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        if(email && email !== user.email){
            const existingUser = await User.findOne({email});
            
            if(existingUser){
                return res.status(400).json({
                    message: "Email already in use"
                });
            }
        }
        
        user.name = name || user.name;

        user.email = email || user.email;
        
        await user.save();
        
        user.password = undefined;
        
        res.json({
            message: "Profile updated successfully", user
        });
    
    }catch(err){
        next(err);
    }
};

const changePassword = async(req, res, next) => {
    try{
        const {oldPassword, newPassword} = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({
                message: "Old and new password are required"
            });
        }

        if(newPassword.length < 6){
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user._id);
        
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        
        if(!isMatch){
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        const samePassword = await bcrypt.compare(newPassword, user.password);
        
        if(samePassword){
            return res.status(400).json({
                message: "New password cannot be same as old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.json({
            message: "Password changed successfully"
        });
    
    }catch(err){
        next(err);
    }
};

const updateProfileImage = async(req, res, next) => {
    try{
        if(!req.file){
            return res.status(400).json({
                message: "Image is required"
            });
        }

        if(!req.file.mimetype.startsWith("image")){
            return res.status(400).json({
                message: "Only image files are allowed"
            });
        }

        const maxSize = 5 * 1024 * 1024;

        if(req.file.size > maxSize){
            return res.status(400).json({
                message: "Image size must be less than 5MB"
            });
        }

        console.log("FILE:", req.file);
        
        console.log("FILE PATH:", req.file.path);

        const uploaded = await cloudinary.uploader.upload(req.file.path, {
            folder: "smart-company-profiles"
        });
        
        console.log("CLOUDINARY: ", uploaded);

        const user = await User.findByIdAndUpdate(req.user._id, {
            profileImage: uploaded.secure_url
        },{
            new: true
        }).select("-password");

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        res.json({
            message: "Profile image updated successfully", user
        });

    }catch(err){
        console.log("PROFILE IMAGE ERROR:", err);
        
        return res.status(500).json({
            message: err.message || "Image upload failed"
        });
    }
};

module.exports = {getMyProfile, updateProfile, changePassword, updateProfileImage};