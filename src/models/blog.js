const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blog_title: {
        type: String,
        required: true,
        trim: true
    },
    blog_image: {
        type: String,
        trim: true
    },
    blog_content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

