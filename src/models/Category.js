'use strict';

const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    popular: {
        type: Boolean,
        default: false
    },
    Subcategory: [
        {
            name: { type: String },
            
        }
    ]
}, {
    timestamps: true
});


module.exports = mongoose.model('Category', categorySchema);