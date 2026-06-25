const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true
    },
    
    profileImage: {
        type: String,
        default: "default-profile.png"
    },
    
    email: {
        type: String,
        required: [true, "Please enter your email"],
        trim: true,
        unique: true
    },
    
    phone: {
        type: String,
        match: /^[0-9]{10}$/
    },
    
    password: {
        type: String,
        required: [true, "Please enter your password"]
    },
    
    role: {
        type: String,
        enum: ["HR", "Employee"],
        required: true,
        default: "Employee"
    },
    
    lastSeen: {
        type: Date,
        default: Date.now
    }
},
{timestamps: true}
);

module.exports = mongoose.model("User",userSchema);