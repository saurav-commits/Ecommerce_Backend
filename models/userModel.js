const mongoose = require('mongoose');
const validator = require('validator');
const {default: isEmail} = require('validator/lib/isEmail');


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
            8, "Name must not exceed 8 characters"
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


module.exports = mongoose.model('User', UserSchema);