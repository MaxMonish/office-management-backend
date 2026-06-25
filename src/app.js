const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const chatRoutes = require("./routes/chatRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/calendar", calendarRoutes);   
app.use("/api/chat", chatRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/page", (req, res) => {
    res.json({message: "Backend server is running"});
});

app.use(errorHandler);

module.exports = app;