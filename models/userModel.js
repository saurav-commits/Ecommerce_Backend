const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [
            true, "Please enter name"
        ],
        minLength: [
            4, "Name should not be less than 4 characters"
        ],
        maxLength: [
            30, "Name must not exceed 30 characters"
        ],
        trim: true
    },

    email: {
        type: String,
        required: [
            true, "Please enter email"
        ],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },

    password: {
        type: String,
        required: [
            true, "Please enter a password"
        ],
        minLength: [
            6, "Password should not be less than 6 characters"
        ],
        select: false
    },

    avatar: {

        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },

    role: {
        type: String,
        default: "user"
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) {
        next();
    }
    this.password =await bcrypt.hash(this.password, 10); 
})

UserSchema.methods.getJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
};

// compare passwords
UserSchema.methods.comparePassword =  async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// generating password to reset token
UserSchema.methods.getResetPasswordToken =  function() {    
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest('hex')

    this.resetPasswordExpire = Date.now() + 15*60*1000;
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);