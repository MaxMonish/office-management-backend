const Attendance = require("../models/Attendance");
const User = require("../models/User");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const serverSocket = require("../../server");

const hrUpdateAttendance = async(req, res, next) => {
    try{
        const {employeeId, status} = req.body;

        if(!employeeId || !status){
            throw new BadRequestError(
                "Employee ID and Status required"
            );
        }

        const employee = await User.findById(employeeId);

        if(!employee){
            throw new NotFoundError(
                "Employee not found"
            );
        }

        const validStatuses = ["Present", "Absent", "Leave"];

        if(!validStatuses.includes(status)){
            throw new BadRequestError(
                "Invalid status"
            );
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingRecord = await Attendance.findOne({
            user: employeeId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if(existingRecord){
            return res.status(400).json({
                message: "Attendance already marked for this employee today"
            });
        }
        
        const record = await Attendance.create({
            user: employeeId,
            status,
            date: new Date()
        });

        const userId = employee._id.toString();
        console.log("ATTENDANCE TARGET USER:", userId);

        if(serverSocket.onlineUsers && serverSocket.onlineUsers[userId]){
            const socketIds = serverSocket.onlineUsers[userId];
            console.log("ATTENDANCE SOCKET IDS:", socketIds);

            socketIds.forEach((socketId) => {
                serverSocket.io.to(socketId).emit("notification", {
                    title: "Attendance Updated",
                    message: `Your attendance marked as '${status}'`,
                    time: new Date()
                }
            );
        });
        
        console.log("✅ ATTENDANCE NOTIFICATION SENT");
    }
    
    res.status(201).json({
        message: `Attendance marked as '${status}' for ${employee.name}`, record
    });

    }catch(err){
        next(err);
    }
};

const getAllAttendance = async(req, res, next) => {
    try{
        const record = await Attendance.find()
        .populate("user","name email role")
        .sort({date: -1})

        res.json(record);
    }catch(err){
        next(err);
    }    
};

const employeeAttendance = async(req, res, next) => {
    try{
        if(!req.user){
            throw new BadRequestError("User not authenticated");
        }
        const record = await Attendance.find({user: req.user._id}).sort({date: -1});
        res.json(record);
    }catch(err){
        next(err);
    }
};

module.exports = {hrUpdateAttendance, getAllAttendance, employeeAttendance};