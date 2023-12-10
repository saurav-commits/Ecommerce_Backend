const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./error");
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

  exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next)=>{
    const token = req.cookie;

    if(!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    await User.findById(decodedData._id);

    next();
  });

  exports.authorizedRoles = (...roles)=> {
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)) {
           return next(
            new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403
            )
           );
        }
        next();
    }
  }


