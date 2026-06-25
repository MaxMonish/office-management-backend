const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const serverSocket = require("../../server");

const createTask = async(req, res, next) => {
    try{
        const {title, description, assignedTo, dueDate} = req.body;
        
        if(!title || !assignedTo){
            return res.status(400).json({
                message: "Title and assignedTo are required"
            });
        }

        if(!mongoose.Types.ObjectId .isValid(assignedTo)){
            return res.status(400).json({
                message: "Invalid assignedTo ID"
            });
        }

        if(dueDate && isNaN(new Date(dueDate).getTime())){
            return res.status(400).json({
                message: "Invalid due date"
            });
        }

        const employee = await User.findById(assignedTo);

        if(!employee){
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo: employee._id,
            createdBy:
            req.user._id,
            dueDate
        });

        await Notification.create({
            user: employee._id,
            message: `${req.user.name} assigned task: ${title}`
        });

        const userId = employee._id.toString();

        console.log("TASK TARGET USER:", userId);

        if(serverSocket.onlineUsers && serverSocket.onlineUsers[userId] && serverSocket.io){
            const socketIds = serverSocket.onlineUsers[userId];
            
            socketIds.forEach((socketId) => {
                serverSocket.io
                .to(socketId)
                .emit("notification", {
                    title: "📌 New Task Assigned",
                    message: `${req.user.name} assigned task: ${title}`,
                    time: new Date()
                }
            );
        });
        
        console.log("✅ TASK NOTIFICATION SENT");
    }
    
    const populatedTask = await Task.findById(task._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
    
    return res.status(201).json({
        message: "Task created successfully",
        task: populatedTask
    });
}catch(err){
    console.error(err);
    next(err);
}
};

const getMyTasks = async(req, res, next) => {
    try{
        const tasks = await Task.find({
            assignedTo: req.user._id
        })
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
        
        return res.json(tasks);
    
    }catch(err){
        next(err);
    }
};

const getAllTasks = async(req, res, next) => {
    try{
        const tasks = await Task.find()
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
        
        return res.json(tasks);

    }catch(err){
        next(err);
    }
};

const updateTaskStatus = async(req, res, next) => {
    try{
        const {taskId} = req.params;

        const {status} = req.body;

        if(!mongoose.Types.ObjectId .isValid(taskId)){
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const allowedStatuses = ["Pending", "In Progress", "Completed"];

        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                message: "Invalid status value"
            });
        }

        const task = await Task.findOne({
            _id: taskId,
            assignedTo:
            req.user._id
        })

        .populate("createdBy", "name email role");

        if(!task){
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if(task.status === status){
            return res.status(400).json({
                message: `Task already marked as ${status}`
            });
        }

        task.status = status;

        await task.save();

        await Notification.create({
            user: task.createdBy._id,
            message: `${req.user.name} updated task "${task.title}" to ${status}`
        });

        const hrId = task.createdBy._id.toString();

        if(serverSocket.onlineUsers && serverSocket.onlineUsers[hrId] && serverSocket.io){
            const socketIds = serverSocket.onlineUsers[hrId];
            socketIds.forEach((socketId) => {
                serverSocket.io
                .to(socketId)
                .emit("notification", {
                    title: "📌 Task Updated",
                    message: `${req.user.name} marked "${task.title}" as ${status}`,
                    time: new Date()
                }
            );
        });
        
        console.log("✅ TASK STATUS NOTIFICATION SENT");
    }
    
    return res.json({
        message: "Task status updated successfully", task
    });

}catch(err){
        next(err);
    }
};

module.exports = {createTask, getMyTasks, getAllTasks, updateTaskStatus};