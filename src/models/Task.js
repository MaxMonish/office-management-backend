const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    
    description: {
        type: String,
        required: true
    },
    
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    status: {
        type: String,
        enum: ["Assigned", "In Progress", "Pending", "Completed"],
        default: "Assigned"
    },
    
    dueDate:{
        type: Date
    }
},
{timestamps: true}
);

module.exports = mongoose.model("Task", taskSchema);