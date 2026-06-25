require("dotenv").config();

const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const {Server} = require("socket.io");
const path = require("path");

const {setIo, onlineUsers} = require("./src/socketStore");

const taskRoutes = require("./src/routes/taskRoutes");
const leaveRoutes = require("./src/routes/leaveRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const calendarRoutes = require("./src/routes/calendarRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const employeeDashboardRoutes = require("./src/routes/employeeDashboardRoutes");
const authRoutes = require("./src/routes/authRoutes");
const chatRoutes = require("./src/routes/chatRoutes");

const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Chat = require("./src/models/Chat");

const app = express();

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://agent-6a37e070f0ae0471615--silly-zuccutto-37d9b5.netlify.app/" //  Need to Change This After Deployment of backend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/employee-dashboard", employeeDashboardRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API is running and connected to server!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

setIo(io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async(userId) => {
    if (!userId) return;

    socket.userId = userId;

    if(!onlineUsers[userId]){
        onlineUsers[userId] = [];
    }

    if(!onlineUsers[userId].includes(socket.id)){
        onlineUsers[userId].push(socket.id);
    }

    await User.findByIdAndUpdate(userId, {
      lastSeen: null
    });

    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  socket.on("sendMessage", async(msgData) => {
    if (!msgData.sender || !msgData.receiver || !msgData.message) return;

    const receiverId = typeof msgData.receiver === "object" ? msgData.receiver._id : msgData.receiver;

    const receiverSockets = onlineUsers[receiverId];
    
    if(receiverSockets && receiverSockets.length > 0){
        receiverSockets.forEach((sockId) => {
            io.to(sockId).emit("receiveMessage", msgData);
        });
    }
});

socket.on("typing", ({ receiver }) => {
    const receiverSockets = onlineUsers[receiver];
    
    if(receiverSockets?.length){
        receiverSockets.forEach((sockId) => {
            io.to(sockId).emit("typing");
        });
    }
});

socket.on("seen", async(senderId) => {
    try{
        if (!socket.userId) return;
        
        await Chat.updateMany({
            sender: senderId,
            receiver: socket.userId,
            status: {$ne: "seen"}
        },{
            $set: {
                status: "seen",
                read: true
            }
        }
    );
    
    const senderSockets = onlineUsers[senderId];
    
    if(senderSockets?.length){
        senderSockets.forEach((sockId) => {
            io.to(sockId).emit("messages_seen", {
            senderId,
            receiverId: socket.userId
          });
        });
      }
    }catch(err){
        console.log("❌ Seen error:", err);
    }
  });

  socket.on("disconnect", async() => {
    const userId = socket.userId;

    if(userId && onlineUsers[userId]){
        onlineUsers[userId] = onlineUsers[userId].filter(
            (id) => id !== socket.id
        );
        
        if(onlineUsers[userId].length === 0){
            delete onlineUsers[userId];
            
            await User.findByIdAndUpdate(userId, {
                lastSeen: new Date()
            });
        }
        
        io.emit("onlineUsers", Object.keys(onlineUsers));
    }
    
    console.log("User disconnected:", socket.id);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
};

startServer();

module.exports = {io, onlineUsers};