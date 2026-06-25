const mongoose = require("mongoose");

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log("MongoDB connected successfully");
        console.log(`Host: ${conn.connection.host}`);
        console.log(`DB Name: ${conn.connection.name}`);
    }catch(error){
        console.log("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;