const User = require("../models/User");
const Leave = require("../models/Leave");
const Task = require("../models/Task");
const Calendar = require("../models/Calendar");
    
const getHRDashboardStats = async(req, res) => {
    try{

        const employees = await User.countDocuments({
            role: "Employee"
        });

        const pendingLeaves = await Leave.countDocuments({
            status: "Pending"
        });

        const pendingTasks = await Task.countDocuments({
            status: "Pending"
        });

        const inProgressTasks = await Task.countDocuments({
            status: "In Progress"
        });

        const completedTasks = await Task.countDocuments({
            status: "Completed"
        });
        
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        
        tomorrow.setDate(tomorrow.getDate()+1);
        
        const todayEvents = await Calendar.find({eventDate:{
            $gte:today,
            $lt:tomorrow
        }
    })
    
    .sort({
        eventDate:1
    });
    
    const pendingLeaveRequests = await Leave.find({
        status: "Pending"
    })
    
    .populate("user", "name profileImage")
    .limit(5);
    
    const taskData = [{
        name: "Pending",
        value: pendingTasks
    },{
        name: "In Progress",
        value: inProgressTasks
    },{
        name: "Completed",
        value: completedTasks
    }
    ];
    
    res.json({
        employees,
        pendingLeaves,
        tasksInProgress: inProgressTasks,
        todayEvents,
        pendingLeaveRequests,
        taskData
    });
}

catch(err){
    console.log(err);
    res.status(500).json({
        message: "Dashboard fetch failed"
    });
}
};

const getEmployeeDashboardStats = async(req, res) => {
    try{
        const employeeId = req.user.id;
        
        const inProgressTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "In Progress"
        });
        
        const completedTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "Completed"
        });
        
        const pendingTasks = await Task.countDocuments({
            assignedTo: employeeId,
            status: "Pending"
        });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        
        tomorrow.setDate(tomorrow.getDate()+1);
        
        const todayEvents = await Calendar.find({
            eventDate:{
                $gte:today,
                $lt:tomorrow
            }
        })
        .sort({
            eventDate:1
        });
        
        const weekAgo = new Date();
        
        weekAgo.setDate(
            today.getDate()-6
        );
        
        weekAgo.setHours(0, 0, 0, 0);
        
        const tasks = await Task.find({
            assignedTo: employeeId,
            updatedAt:{
                $gte:weekAgo,
                $lte:new Date()
            }
        });
        
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        const productivity = {};
        
        days.forEach(day => {
            productivity[day]=0;
        });
        
        tasks.forEach(task => {
            if(task.status === "Completed"){
                const day = days[new Date(task.updatedAt).getDay()];
                productivity[day] += 1;
            }
        });
        
        const productivityData = days.map(day=>({day, count: productivity[day]}));
        
        const taskData = [{
            name: "Pending",
            value: pendingTasks
        },{
            name: "In Progress",
            value: inProgressTasks
        },{
            name: "Completed",
            value: completedTasks
        }
    ];
    
    res.json({
        tasksInProgress: inProgressTasks, todayEvents, taskData, productivityData});
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Employee dashboard failed"
        });
    }
};

module.exports = {getHRDashboardStats, getEmployeeDashboardStats};