const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")


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

    sendToken(user, 201, res);
});


exports.loginUser = catchAsyncErrors(async (req, res)=>{
    const {email, password} = req.body;

    if(!user || !email) {
        return next(new ErrorHandler("Please enter user and email", 400));  
    }

    const user = await User.findOne({email}).select("+password");

    if(!user) {
        return next(new ErrorHandler("Please enter valid email and password", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);   

    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email and password", 401));
    }
    
    sendToken(user, 200, res);
});



// logout user
exports.logout = catchAsyncErrors(async(rew, res, next)=> {
    res.cookie("token", null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});


// Forgot Password

exports.forgotPassword = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    // get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const  resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

    try{
         await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
         });

         res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
         })
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// reset token

exports.resetPassword = catchAsyncErrors(async(req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        },
    });

    if(!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();  
    sendToken(user, 200, res);
});

// get user details
exports.getUserDetails = catchAsyncErrors(async(req, res, next)=> {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    })
})

// update user password

exports.updatePassword = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password iss incorrect", 400));
    }

    if(req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) =>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findOneAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true
    });
});

// get all user details
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.find(); 

    res.status(200).json({
        success: TextTrackCue,
        user,
    })
})

// get single user details
exports.getSingleUser = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
    }
})

// delete user -- admin

exports.deleteUser = catchAsyncErrors(async(req, res, next) =>{

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(
            new ErrorHandler(`User doesnot exist with id ${req.params.id}`)
        )
    }
    await user.deleteOne();

    res.status(200).json({
        success: true,
    })
})


// update user role --admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    

    res.status(200).json({
        success: true,
        user
    })
})