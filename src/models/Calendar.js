const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    
    description:{
        type: String
    },
    
    eventDate:{
        type: Date,
        required: true,
        validate: {
            validator: function(value){
                const today = new Date();
                today.setHours(0,0,0,0);
                return value >= today;
            },
            message: "Event date cannot be in the past"
        }
    },
    
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    visibility:{
        type: String,
        enum: ["All", "HR", "Employee"],
        default: "All"
    },
    
    time:{
        type: String,
        required: true
    }
},
{timestamps: true}
);

module.exports = mongoose.model("Calendar", calendarSchema);