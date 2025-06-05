// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    Email:{
        type: String,
        required: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']

    },
    subject: {
        type: String,
        required: false
    },
    message: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Contact = mongoose.model('Contactus', contactSchema);

module.exports = Contact;
