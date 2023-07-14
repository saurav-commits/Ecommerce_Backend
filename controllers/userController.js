const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const User = require("../models/userModel");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "sample_id",
            url: "profilepic_url",
        },
    });

    res.status(201).json({
        success: true,
        user,
    });
});