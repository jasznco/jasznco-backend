const express = require('express');
const { login, register, getUser, sendOTP, verifyOTP, changePassword,updateProfile } = require('@controllers/authController');
const { contactUs, getAllContactUs } = require('@controllers/contactUs');
const { authenticate } = require('@middlewares/authMiddleware');
const user = require('@controllers/user');
const Blog = require('@controllers/blogController');
const Category = require('@controllers/Catgeory');
const product = require('@controllers/product');
const upload = require('@services/upload');

const router = express.Router();
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/profile', authenticate, getUser);
router.post("/auth/sendOTP", sendOTP);
router.post("/auth/updateProfile", updateProfile);
router.post("/auth/verifyOTP", verifyOTP);
router.post("/auth/changePassword", changePassword);

router.post('/user/fileupload', upload.single('file'), user.fileUpload);

router.post("/contactUs", contactUs);
router.post("/getContactUs", getAllContactUs)

router.post("/add-subscriber", user.addNewsLetter);
router.get("/get-subscriber", user.getNewsLetter);
router.post("/del-subscriber", user.DeleteNewsLetter);


router.post("/createProduct",  product.createProduct);
router.get("/getProduct", product.getProduct);
router.post("/updateProduct", product.updateProduct);
router.delete("/deleteProduct/:id", product.deleteProduct);
router.get("/getProductById/:id", product.getProductById);
router.get("/getProductBycategoryId", product.getProductBycategoryId);
router.get("/getProductBythemeId/:id", product.getProductBythemeId);

router.post("/createBlog",Blog.createBlog)
router.get("/getAllBlogs",Blog.getAllBlogs)
router.post("/getBlogById",Blog.getBlogById)
router.post("/updateBlog",Blog.updateBlog)
router.post("/deleteBlog",Blog.deleteBlog)

router.post("/createCategory",Category.createCategory)
router.get("/getCategories",Category.getCategories)
router.delete("/deleteCategory",Category.deleteCategory)
router.post("/addSubcategory",Category.addSubcategory)
router.get("/getSubcategories",Category.getSubcategories)
router.delete("/deleteSubcategory",Category.deleteSubcategory)
router.post("/updateCategory",Category.updateCategory)
router.post("/updateSubcategory",Category.updateSubcategory)

module.exports = router;
