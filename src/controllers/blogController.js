const Blog = require('@models/blog');
const response = require("../../responses");

const createBlog = async (req, res) => {
    try {
        const { blog_title, blog_image, blog_content } = req.body;

        if (!blog_title || !blog_content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }
       const newBlog = new Blog({
            blog_title,
            blog_image,
            blog_content,
        });
        const savedBlog = await newBlog.save();
        return res.status(201).json({ message: 'Blog created successfully', blog: savedBlog });
    } catch (error) {
        return response.error(res, error);
    }
};

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        return res.status(200).json({ message: 'Blogs retrieved successfully', blogs });
    } catch (error) {
        return response.error(res, error);
    }
};


const getBlogById = async (req, res) => {
    try {
        const { id } = req.body; // Ensure you are sending the ID in the body
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found.' });
        }
        return res.status(200).json({ message: 'Blog retrieved successfully', blog });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const updateBlog = async (req, res) => {
    try {
        const { blog_title, blog_image, blog_content ,id } = req.body;
        const updatedData = {};

        if (blog_title !== undefined) updatedData.blog_title = blog_title;
        if (blog_image !== undefined) updatedData.blog_image = blog_image;
        if (blog_content !== undefined) updatedData.blog_content = blog_content;

        const updatedBlog = await Blog.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        
        
        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found for update.' });
        }

        return res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
    } catch (error) {
        return response.error(res, error);
    }
};

// Delete a blog post
const deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete( req?.body?._id);
        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found for deletion.' });
        }
         return response.ok(res, { meaasge: "Deleted successfully" });
    } catch (error) {
          return response.error(res, error);
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
};
