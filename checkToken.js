const jwt = require("jsonwebtoken");
require("dotenv").config();

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGI4MmRhZmJjODBlZjhhNjkxYzcwMyIsInJvbGUiOiJIUiIsImlhdCI6MTc1OTQ5MDQ2NywiZXhwIjoxNzU5NTc2ODY3fQ.9sGEjwna5SiTSUKLRgFEn5XxCNMQEFXWJnVpa5SZoHM";

try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Valid Token:", decoded);
}catch(err){
    if(err.name === "TokenExpiredError"){
        console.log("Token expired");
    }else{
        console.log("Invalid Token:", err.message);
    }
}