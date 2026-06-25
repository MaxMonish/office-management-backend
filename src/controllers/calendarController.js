
const Calendar = require("../models/Calendar");
const User = require("../models/User");
const serverSocket = require("../../server");

const validVisibilities = [
    "All",
    "HR",
    "Employee"
];

const createEvent = async(req, res, next) => {
    try{
        const{title, description, eventDate, visibility, time} = req.body;

        if(!title || !eventDate){
            return res.status(400).json({
                message: "Title and date are required"
            });
        }

        const parsedDate = new Date(eventDate);

        if(isNaN(parsedDate.getTime())){
            return res.status(400).json({
                message: "Invalid date format"
            });
        }

        if(visibility && !validVisibilities.includes(visibility)){
            return res.status(400).json({
                message: "Invalid visibility value"
            });
        }

        const event = await Calendar.create({
            title,
            description,
            eventDate: parsedDate,
            visibility: visibility || "All",
            time,
            createdBy: req.user._id
        });

        const users = await User.find();

        users.forEach((user) => {
            const userId = user._id.toString();

            const allowed = event.visibility === "All" || (event.visibility === "HR" && user.role.toLowerCase() === "hr") || (event.visibility === "Employee" && user.role.toLowerCase() === "employee");

            console.log({
                eventVisibility:
                event.visibility,
                userRole: user.role,
                allowed
            });

            if (!allowed) return;

            if(serverSocket.onlineUsers && serverSocket.onlineUsers[userId] && serverSocket.io){
                const socketIds = serverSocket.onlineUsers[userId];
                
                console.log("CALENDAR SOCKET IDS:", socketIds);

                socketIds.forEach((socketId) => {
                    serverSocket.io.to(socketId).emit("notification", {
                        title: "📅 New Calendar Event",
                        message: `${title} scheduled on ${parsedDate.toDateString()}`,
                        time: new Date()
                    }
                );
            });
            
            console.log("✅ CALENDAR NOTIFICATION SENT TO:", user.name);
        }
    });

    return res.status(201).json({
        message: "Event created successfully",
        event
    });

}catch(err){
    console.error(err);
    next(err);
}
};

const updateEvent = async(req, res, next) => {
    try{
        const {eventId} = req.params;
        
        const{
            title,
            description,
            eventDate,
            visibility,
            time
        } = req.body;

        if(!title && !description && !eventDate && !visibility){
            return res.status(400).json({
                message: "At least one field must be provided to update"
            });
        }

        const event = await Calendar.findById(eventId);

        if(!event){
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if(event.createdBy.toString() !== req.user._id.toString()){

            return res.status(403).json({
                message: "Not authorized to edit this event"
            });
        }

        if(visibility && !validVisibilities.includes(visibility)){
            return res.status(400).json({
                message: "Invalid visibility value"
            });
        }

        let parsedDate;

        if(eventDate){
            parsedDate = new Date(eventDate);

            if(isNaN(parsedDate.getTime())){
                return res.status(400).json({
                    message: "Invalid date format"
                });
            }
        }

        if(title){
            event.title = title;
        }

        if(description){
            event.description = description;
        }

        if(parsedDate){
            event.eventDate = parsedDate;
        }

        if(visibility){
            event.visibility = visibility;
        }

        if(time){
            event.time = time;
        }

        await event.save();

        const users = await User.find();

        users.forEach((user) => {
            const userId = user._id.toString();
            
            const allowed = event.visibility === "All" || (event.visibility === "HR" && user.role.toLowerCase() === "hr") || (event.visibility === "Employee" && user.role.toLowerCase() === "employee");
            
            if (!allowed) return;
            
            if(serverSocket.onlineUsers && serverSocket.onlineUsers[userId] && serverSocket.io){
                
                const socketIds = serverSocket.onlineUsers[userId];
                
                socketIds.forEach((socketId) => {
                    serverSocket.io.to(socketId).emit("notification", {
                        title: "📅 Event Updated",
                        message: `Calendar event "${event.title}" was updated`,
                        time: new Date()
                    }
                );
            });
            
            console.log("✅ EVENT UPDATE NOTIFICATION SENT");
        }
    });
    
    return res.json({
        message: "Event updated successfully", event
    });

}catch(err){
    console.error(err);
    next(err);
}
};

const deleteEvent = async(req, res, next) => {
    try{
        const {eventId} = req.params;

        const event = await Calendar.findById(eventId);

        if(!event){
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if(event.createdBy.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: "Not authorized to delete this event"
            });
        }

        const deletedTitle = event.title;

        await event.deleteOne();

        const users = await User.find();

        users.forEach((user) => {
            const userId = user._id.toString();
            
            const allowed = event.visibility === "All" || (event.visibility === "HR" && user.role.toLowerCase() === "hr") || (event.visibility === "Employee" && user.role.toLowerCase() === "employee");
            
            if (!allowed) return;
            
            if(serverSocket.onlineUsers && serverSocket.onlineUsers[userId] && serverSocket.io){
                const socketIds = serverSocket.onlineUsers[userId];
                
                socketIds.forEach((socketId) => {
                    serverSocket.io.to(socketId).emit("notification", {
                        title: "🗑️ Event Deleted",
                        message: `Calendar event "${deletedTitle}" was deleted`,
                        time: new Date()
                    }
                );
            });
            
            console.log("✅ EVENT DELETE NOTIFICATION SENT");
        }
    });
    
    return res.json({
        message: "Event deleted successfully"
    });

}catch(err){
    console.error(err);
    next(err);
}
};

const getEvents = async(req, res, next) => {
    try{
        const userRole = req.user.role;
        
        const events = await Calendar.find({
            $or: [
                { visibility: "All" },
                { visibility: userRole }
            ]
        })
        .populate("createdBy", "name email role")
        .sort({ eventDate: 1 });

        return res.json(events);

    }catch(err){
        console.error(err);
        next(err);
    }
};

module.exports = {createEvent, updateEvent, deleteEvent, getEvents};