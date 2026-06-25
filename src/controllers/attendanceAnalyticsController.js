const Attendance = require("../models/Attendance");

const getEmployeeAnalytics = async(req, res) => {
    try{
        const userId = req.user._id;
        
        const attendance = await Attendance.find({
            employee: userId
        });

        const weekly = {};

        const monthly = {};

        const yearly = {};

        let present = 0;
        let absent = 0;
        let leave = 0;

        attendance.forEach((item) => {
            const date = new Date(item.date);
            
            const weekDay = date.toLocaleDateString("en-US", {
                weekday: "short"
            });

            const month = date.toLocaleDateString("en-US", {
                month: "short"
            });
            
            const year = date.getFullYear();

            if(item.status === "Present"){
                present++;
            }

            if(item.status === "Absent"){
                absent++;
            }

            if(item.status === "Leave"){
                leave++;
            }

            weekly[weekDay] = (weekly[weekDay] || 0) + 1;


            monthly[month] = (monthly[month] || 0) + 1;

            yearly[year] = (yearly[year] || 0) + 1;
        });
        
        res.json({
            summary: {
                present,
                absent,
                leave,
                total: attendance.length
            },
            weekly,
            monthly,
            yearly
        });
    
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Analytics error"
        });
    }
};

module.exports = {getEmployeeAnalytics};