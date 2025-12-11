const express = require('express');
const {
  login,
  register,
  getUser,
  sendOTP,
  sendOtp,
  verifyOtp,
  verifyOTP,
  changePassword,
  updateProfile,
  sendLoginOtp,
  loginWithOTP,
  changePasswordFOrAdmin
} = require('@controllers/authController');
const {
  contactUs,
  getAllContactUs,
  updateStatus
} = require('@controllers/contactUs');
const wholesale = require('@controllers/wholesale');
const { authenticate } = require('@middlewares/authMiddleware');
const user = require('@controllers/user');
const Blog = require('@controllers/blogController');
const Category = require('@controllers/Catgeory');
const product = require('@controllers/product');
const upload = require('@services/upload');
const favourite = require('@controllers/Favorite');
const Content = require('@controllers/ContentManagement');
const Brand = require('@controllers/BrandController');
const stripe = require('@controllers/Stripe');
const setting = require('@controllers/setting');
const flashSaleController = require('@controllers/sale');
const instaImage = require('@controllers/instaImage');

const router = express.Router();
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/send-login-otp', sendLoginOtp);
router.post('/auth/verify-login-otp', loginWithOTP);
router.post('/auth/profile', authenticate, getUser);
router.post('/auth/sendOTP', sendOTP);
router.post('/auth/updateProfile', updateProfile);
router.post('/auth/verifyOTP', verifyOTP);
router.post('/auth/changePassword', changePassword);
router.post(
  '/auth/changePasswordForAdmin',
  authenticate,
  changePasswordFOrAdmin
);

router.post('/user/fileupload', upload.single('file'), user.fileUpload);

router.post('/contactUs', contactUs);
router.post('/getContactUs', getAllContactUs);
router.post('/updateStatus', updateStatus);

router.post('/addWholesale', wholesale.addWholesale);
router.post('/getAllWholesale', wholesale.getAllWholesale);
router.post('/updateStatusForWholesale', wholesale.updateStatusForWholesale);

router.post('/add-subscriber', user.addNewsLetter);
router.get('/get-subscriber', user.getNewsLetter);
router.post('/del-subscriber', user.DeleteNewsLetter);

router.post('/createProduct', product.createProduct);
router.get('/getProduct', product.getProduct);
router.post('/updateProduct', product.updateProduct);
router.delete('/deleteProduct/:id', product.deleteProduct);
router.get('/getProductById/:id', product.getProductById);
router.get('/getProductBySlug', product.getProductBySlug);
router.get('/getProductBycategoryId', product.getProductBycategoryId);
router.get('/getProductbycategory/:id', product.getProductbycategory);
router.get('/getProductBythemeId/:id', product.getProductBythemeId);
router.post('/createProductRequest', product.requestProduct);
router.get('/getrequestProduct', authenticate, product.getrequestProduct);
router.get('/getHistoryProduct', authenticate, product.getHistoryProduct);
router.get('/getProductByCatgeoryName', product.getProductByCatgeoryName);
router.get('/getColors', product.getColors);
router.get('/getBrand', product.getBrand);

router.get(
  '/getProductRequest/:id',
  authenticate,
  product.getrequestProductbyid
);

router.post('/addremovefavourite', authenticate, favourite.AddFavourite);

router.get('/getFavourite', authenticate, favourite.getFavourite);

router.post('/giverate', authenticate, user.giverate);
router.post('/getReview', authenticate, user.getReview);
router.delete('/deleteReview/:id', user.deleteReview);

router.post('/getOrderBySeller', authenticate, product.getOrderBySeller);

router.post('/createBlog', Blog.createBlog);
router.get('/getAllBlogs', Blog.getAllBlogs);
router.post('/getBlogById', Blog.getBlogById);
router.post('/updateBlog', Blog.updateBlog);
router.post('/deleteBlog', Blog.deleteBlog);

router.post('/createCategory', Category.createCategory);
router.get('/getCategories', Category.getCategories);
router.delete('/deleteCategory', Category.deleteCategory);
router.post('/addSubcategory', Category.addSubcategory);
router.get('/getSubcategories', Category.getSubcategories);
router.delete('/deleteSubcategory', Category.deleteSubcategory);
router.post('/updateCategory', Category.updateCategory);
router.post('/updateSubcategory', Category.updateSubcategory);

router.post('/content', authenticate, Content.createContent);
router.get('/content', Content.getContent);
router.post('/content/update', authenticate, Content.updateContent);

router.get('/productsearch', product.productSearch);
router.post('/getUserList', user.getUserList);

router.post('/createBrand', Brand.createBrand);
router.get('/getBrands', Brand.getBrands);
router.delete('/deleteBrand', Brand.deleteBrand);
router.post('/updateBrand', Brand.updateBrand);

router.get('/getsetting', setting.getSetting);
router.post('/createOrUpdateImage', authenticate, setting.createOrUpdateImage);
router.post(
  '/createOrUpdateContactInfo',
  authenticate,
  setting.createOrUpdateContactInfo
);
router.post(
  '/createOrUpdateShippingKeyInfo',
  authenticate,
  setting.createOrUpdateShippingKeyInfo
);
router.get('/getInstaImage', instaImage.getInstaImage);
router.post(
  '/createOrUpdateInstaImage',
  authenticate,
  instaImage.createOrUpdateInstaImage
);

router.post('/poststripe', stripe.poststripe);

router.post('/createSale', authenticate, flashSaleController.createFlashSale);
router.get('/getFlashSale', flashSaleController.getFlashSale);
router.get('/getActiveFlashSales', flashSaleController.getActiveFlashSales);
router.get(
  '/getFlashSaleByProduct/:productId',
  flashSaleController.getFlashSaleByProduct
);
router.put(
  '/updateFlashSale/:id',
  authenticate,
  flashSaleController.updateFlashSale
);
router.put(
  '/toggleFlashSaleStatus/:id',
  authenticate,
  flashSaleController.toggleFlashSaleStatus
);
router.delete(
  '/deleteFlashSale/:id',
  authenticate,
  flashSaleController.deleteFlashSale
);
router.delete(
  '/deleteAllFlashSales',
  authenticate,
  flashSaleController.deleteAllFlashSales
);
router.delete(
  '/deleteSale',
  authenticate,
  flashSaleController.deleteAllFlashSales
);
router.post(
  '/deleteFlashSaleProduct',
  authenticate,
  flashSaleController.deleteFlashSale
);
router.get('/dashboarddetails', product.dashboarddetails);
router.get('/getMonthlySales', product.getMonthlySales);
router.get('/getTopSoldProduct', product.getTopSoldProduct);
router.get('/getLowStockProduct', product.getLowStockProduct);

router.get('/downloadProductsExcel',product.downloadProductsExcel);
router.get('/downloadOrderExcel',product.downloadOrderExcel);

module.exports = router;
