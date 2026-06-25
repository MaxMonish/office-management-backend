const Notification = require("../models/Notification");

const getMyNotifications = async(req, res, next) => {
    try{
        const notifications = await Notification.find({
            user: req.user._id
        })
        .sort({ createdAt: -1 })
        .lean();
        
        return res.json(notifications);
    }catch(err){
        next(err);
    }
};

const markAsRead = async(req, res, next) => {
    try{
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if(!notification){
            return res.status(404).json({
                message: "Notification not found"
            });
        }
        
        notification.isRead = true;
        await notification.save();
        
        return res.json({
            message: "Notification marked as read"
        });
    
    }catch(err){
        next(err);
    }
};

const markAllAsRead = async(req, res, next) => {
    try{
        await Notification.updateMany({
            user: req.user._id,
            isRead: false
        },{
            $set: {
                isRead: true
            }
        });
        
        return res.json({
            message: "All notifications marked as read"
        });
    
    }catch(err){
        next(err);
    }
};

module.exports = {getMyNotifications, markAsRead, markAllAsRead};