const Task = require("../models/Task");
const Calendar = require("../models/Calendar");

const getEmployeeDashboard = async(req, res) => {
  try{
    
    const employeeId = req.user.id;

    const pendingTasks = await Task.countDocuments({
      assignedTo: employeeId,
      status: "Pending"
    });
    
    const inProgressTasks = await Task.countDocuments({
      assignedTo: employeeId,
      status: "In Progress"
    });
    
    const completedTasks = await Task.countDocuments({
      assignedTo: employeeId,
      status: "Completed"
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    
    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    const todayEvents = await Calendar.find({
      eventDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
    
    .sort({eventDate: 1});

    const taskChart = [{
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
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const productivity = {Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0};  
  
  const currentDate = new Date();
  
  const startOfWeek = new Date(currentDate);
  
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  
  endOfWeek.setDate(
    startOfWeek.getDate() + 6
  );
  
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekTasks = await Task.find({
    assignedTo: employeeId,
    updatedAt: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });
  
  weekTasks.forEach((task) => {
    const day = weekDays[new Date(task.updatedAt).getDay()];
    productivity[day]++;
  });
  
  const weeklyData = weekDays.map((day) => ({
    day,
    tasks: productivity[day]
  }));
  
  const hasProductivity = weeklyData.some(item => item.tasks > 0);

    res.json({
      pendingTasks,
      inProgressTasks,
      completedTasks,
      todayEvents,
      taskChart,
      weeklyData,
      hasProductivity
    });
  }
  
  catch(err){
    console.log(err);
    res.status(500).json({
      message: "Dashboard failed"
    });
  }
};

module.exports = {getEmployeeDashboard};