const User = require("../models/User");

const getAllEmployees = async(req, res) => {
    try{
        const employees = await User.find({
            role: "Employee"
        })
        
        .select("-password")
        .sort({name: 1});
        
        res.json(employees);

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Failed to fetch employees"
        });
    }
};

const getEmployeeById = async(req, res) => {
    try{
        const employee = await User.findById(req.params.id).select("-password");
        if(!employee){
            return res.status(404).json({
                message: "Employee not found"
            });
        }
        
        res.json(employee);

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Failed to fetch employee"
        });
    }
};

module.exports = {getAllEmployees, getEmployeeById};