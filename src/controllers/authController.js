const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user, res) => {
    const token = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    {expiresIn: "24h"}
    );
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24*60*60*1000 
    });
    
    return token;
};

const registerUser = async(req, res, next) => {
    try{
        const {name, email, password, role} = req.body;
        if(!name || !email || !password || !role){
            return res.status(400).json({message: "All fields are required"});
        }

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({
            message: "User registered successfully", 
            user: {
                name: user.name, 
                email: user.email, 
                role: user.role
            }}
        );
    }catch(err){
        next(err);
    }
};

const loginUser = async(req, res, next) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid Password"});
        }
        
        const token = generateToken(user, res);

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    }catch(err){
        next(err);
    }   
};

module.exports = {registerUser, loginUser};