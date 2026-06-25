const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async(req, res, next) => {
    try{
        let token;

        console.log("AUTH HEADER:", req.headers.authorization);

         if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        else if(req.cookies?.token){
            token = req.cookies.token;
        }

        console.log("TOKEN:", token);

        if(!token){
            return res.status(401).json({message: "Not authorized, no token"});
        }

        if(!token){
            return res.status(401).json({ message: "No token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED:", decoded);
        
        const user = await User.findById(decoded.id || decoded.userId);
        console.log("USER FROM DB:", user);
        
        if(!user){
            return res.status(401).json({message: "User not found"});
        }
        req.user = user;
        next();

    }catch(err){
        console.error("JWT Error: ", err.message);
        res.status(401).json({message: "Not authorized - Session expired"});
    }
};

module.exports = {protect};