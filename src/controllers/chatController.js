const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const User = require("../models/User");
const serverSocket = require("../../server");

const getAllUsers = async(req, res, next) => {
    try{
        const users = await User.find({ _id: { $ne: req.user._id } })
        .select("name profileImage email role lastSeen")
        .sort({ name: 1 })
        .lean();
        return res.json(users);
    }catch(err){
        next(err);
    }
};

const sendMessage = async(req, res, next) => {
    try{
        const {receiverId, message} = req.body;
        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ message: "Receiver not found" });
        
        const chat = await Chat.create({
            sender: req.user._id,
            receiver: receiverId,
            message,
            status: "sent"
        });

        const populatedChat = await Chat.findById(chat._id)
        .populate("sender", "name profileImage email role")
        .populate("receiver", "name profileImage email role");

        const targetId = receiver._id.toString();
        if(serverSocket.onlineUsers && serverSocket.onlineUsers[targetId] && serverSocket.io){
            serverSocket.onlineUsers[targetId].forEach((socketId) => {
                serverSocket.io.to(socketId).emit("receiveMessage", populatedChat);
            });
        }
        return res.status(201).json({ message: "Message sent", chat: populatedChat });
    }catch(err){
        next(err);
    }
};

const getChat = async(req, res, next) => {
    try{
        const {userId} = req.params;
        await Chat.updateMany({
            sender: userId, receiver: req.user._id, status: { $ne: "seen" }}, {
                $set: { status: "seen", read: true } }
            );
            
            if(serverSocket.onlineUsers && serverSocket.onlineUsers[userId] && serverSocket.io){
                serverSocket.onlineUsers[userId].forEach(id => {
                    serverSocket.io.to(id).emit("messages_seen", { senderId: req.user._id });
                });
            }
            
            const chats = await Chat.find({
                $or: [{ sender: req.user._id, receiver: userId }, { sender: userId, receiver: req.user._id }]})
                .populate("sender", "name profileImage")
                .populate("receiver", "name profileImage")
                .sort({ createdAt: 1 })
                .lean();
                
                return res.json(chats);
            
            }catch(err){
                next(err);
            }
        };
        
        const getChatContacts = async(req, res, next) => {
            try{
                const chats = await Chat.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
                .populate("sender receiver", "name profileImage lastSeen");
                const contactsMap = new Map();
                chats.forEach(chat => {
                    const contact = String(chat.sender._id) === String(req.user._id) ? chat.receiver : chat.sender;
                    if (contact) contactsMap.set(contact._id.toString(), contact);
                });
                return res.json(Array.from(contactsMap.values()));
            
            }catch(err){
                next(err);
            }
        };
        
        module.exports = {sendMessage, getChat, getChatContacts, getAllUsers};