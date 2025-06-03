const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                'Please enter a valid email address',
            ],
        },
        description: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { timestamps: true },
);

const contactUs = mongoose.model('contactUs', userSchema);
module.exports = contactUs;

