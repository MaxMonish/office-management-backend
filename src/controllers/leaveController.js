const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Notification = require("../models/Notification");
const User = require("../models/User");

let serverSocket = null;
try{
    serverSocket = require("../index"); 
}catch(e){
    console.log("Socket import skipped in leaveController");
}

const applyLeave = async(req, res) => {
    try{
        const {fromDate, toDate, reason} = req.body;

        if(!fromDate || !toDate || !reason){
            return res.status(400).json({ message: "All fields are required" });
        }

        const inputDate = new Date(fromDate);
        inputDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if(inputDate < today){
            return res.status(400).json({ message: "Leave cannot start in the past" });
        }

        if(new Date(fromDate) > new Date(toDate)){
            return res.status(400).json({ message: "From date cannot be after To date" });
        }

        const existingLeave = await Leave.findOne({
            user: req.user._id,
            fromDate: { $lte: new Date(toDate) },
            toDate: { $gte: new Date(fromDate) }
        });

        if(existingLeave){
            return res.status(400).json({ message: "You already have a leave applied for these dates" });
        }

        const leave = await Leave.create({
            user: req.user._id,
            fromDate,
            toDate,
            reason,
            status: "Pending"
        });

        await Notification.create({
            user: req.user._id,
            message: "Your leave request has been submitted"
        });

        return res.status(201).json({ message: "Leave applied successfully", leave });
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Failed to apply leave" });
    }
};

const getMyLeaves = async(req, res) => {
    try{
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.json(leaves);
    }catch(err){
        return res.status(500).json({ message: "Failed to fetch leaves" });
    }
};

const getAllLeaves = async(req, res) => {
    try{
        const leaves = await Leave.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 });
        return res.json(leaves);
    }catch(err){
        return res.status(500).json({ message: "Failed to fetch all leaves" });
    }
};

const updateLeaveStatus = async(req, res) => {
    try{
        const {leaveId} = req.params;
        const {status, remarks} = req.body;

        if(req.user.role !== "HR"){
            return res.status(403).json({ message: "Access denied" });
        }

        const leave = await Leave.findById(leaveId).populate("user", "name email role");
        if(!leave){
            return res.status(404).json({ message: "Leave not found" });
        }

        leave.status = status;
        leave.remark = remarks || ""; 
        await leave.save();

        if(status === "Approved"){
            try{
                let curr = new Date(leave.fromDate);
                const end = new Date(leave.toDate);
                curr.setHours(0,0,0,0);
                end.setHours(0,0,0,0);

                while(curr <= end){
                    const dateToProcess = new Date(curr);
                    await Attendance.findOneAndUpdate({ 
                        user: leave.user._id, 
                        date: { 
                            $gte: new Date(dateToProcess).setHours(0,0,0,0), 
                            $lte: new Date(dateToProcess).setHours(23,59,59,999) 
                        } 
                    },{ 
                        user: leave.user._id, date: dateToProcess, status: "Leave" },
                        { upsert: true }
                    );
                    curr.setDate(curr.getDate() + 1);
                }
            }catch(attErr){
                console.error("Attendance Error:", attErr.message);
            }
        }

        await Notification.create({
            user: leave.user._id,
            message: `Your leave request has been ${status}`
        });

        try{
            const userId = leave.user._id.toString();
            if(serverSocket?.io && serverSocket?.onlineUsers?.[userId]){
                serverSocket.onlineUsers[userId].forEach(socketId => {
                    serverSocket.io.to(socketId).emit("notification", {
                        title: `📄 Leave ${status}`,
                        message: `Your leave request has been ${status}`,
                        time: new Date()
                    });
                });
            }
        }catch(sErr){}

        return res.json({ message: `Leave ${status} updated successfully`, leave });
    
    }catch(err){
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({ message: "Failed to update status", error: err.message });
    }
};

module.exports = {applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus};