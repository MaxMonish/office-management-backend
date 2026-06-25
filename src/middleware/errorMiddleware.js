const errorHandler = (err, req, res, next) => {
  console.error("Error: ", err.message);
  
  const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      message: err.message || "Server Error",
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
      status: err.status || "error"
    });
};

module.exports = errorHandler;