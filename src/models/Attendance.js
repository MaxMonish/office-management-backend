const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    date: {
        type: Date,
        required: true, 
        default: () => {
            const today=new Date();
            today.setHours(0, 0, 0, 0);
            return today;
        }
    },
    
    status: {
        type: String,
        enum: ["Present", "Absent", "Leave"],
        default: "Absent",
        required: true
    },
    
    inTime: {type: Date},
    outTime: {type: Date}
},
{timestamps: true}
);

attendanceSchema.index({user: 1, date: 1}, {unique: true});

module.exports = mongoose.model("Attendance", attendanceSchema);